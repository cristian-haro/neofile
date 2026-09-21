import { FormatCategory, FormatDefinition, FormatRegistry } from './Format';

export interface ConversionTarget {
  readonly extension: string;
  readonly name: string;
  readonly category: FormatCategory;
  readonly engineType: 'image' | 'audio-video' | 'document' | 'archive' | 'cad' | 'ebook';
  readonly isLossless?: boolean;
}

export class ConversionMatrix {
  /**
   * Calculates all valid target formats for a given source extension.
   */
  static getCompatibleTargets(sourceExt: string): ConversionTarget[] {
    const format = FormatRegistry.get(sourceExt);
    if (!format) return [];

    const ext = format.extension;
    const category = format.category;
    const targets: ConversionTarget[] = [];

    // Helper to add target
    const addTarget = (targetExt: string, engineType: ConversionTarget['engineType']) => {
      if (targetExt === ext) return; // Skip self
      const targetDef = FormatRegistry.get(targetExt);
      if (targetDef) {
        targets.push({
          extension: targetDef.extension,
          name: targetDef.name,
          category: targetDef.category,
          engineType,
          isLossless: targetDef.isLossless
        });
      }
    };

    switch (category) {
      case 'image': {
        // Any image can convert to core web and print image formats
        const commonImageTargets = ['png', 'jpg', 'jpeg', 'webp', 'avif', 'bmp', 'ico', 'tiff', 'gif', 'svg'];
        commonImageTargets.forEach(t => addTarget(t, 'image'));
        // Images can also be converted to PDF
        addTarget('pdf', 'document');
        break;
      }

      case 'audio': {
        // Audio to audio transcoding
        const audioTargets = ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a', 'aiff', 'wma'];
        audioTargets.forEach(t => addTarget(t, 'audio-video'));
        break;
      }

      case 'video': {
        // Video to video transcoding
        const videoTargets = ['mp4', 'webm', 'mkv', 'avi', 'mov', 'flv', 'wmv', '3gp', 'ts'];
        videoTargets.forEach(t => addTarget(t, 'audio-video'));
        
        // Video to Audio extraction
        const audioExtractionTargets = ['mp3', 'wav', 'aac', 'ogg', 'flac', 'm4a'];
        audioExtractionTargets.forEach(t => addTarget(t, 'audio-video'));

        // Video to animated GIF
        addTarget('gif', 'audio-video');
        break;
      }

      case 'document': {
        if (['csv', 'tsv'].includes(ext)) {
          // Tabular data
          ['json', 'yaml', 'xml', 'xlsx', 'sql', 'md', 'html', 'pdf', 'csv', 'tsv', 'b64', 'txt'].forEach(t => addTarget(t, 'document'));
        } else if (['xls', 'xlsx', 'ods', 'xlsm', 'xlr', 'wks'].includes(ext)) {
          // Spreadsheets
          ['csv', 'tsv', 'xlsx', 'xls', 'ods', 'json', 'yaml', 'xml', 'sql', 'md', 'html', 'pdf', 'txt'].forEach(t => addTarget(t, 'document'));
        } else if (['json', 'yaml', 'yml', 'xml'].includes(ext)) {
          // Structured data & configuration
          ['json', 'yaml', 'xml', 'csv', 'tsv', 'sql', 'md', 'html', 'xlsx', 'b64', 'txt'].forEach(t => addTarget(t, 'document'));
        } else if (['sql'].includes(ext)) {
          // SQL scripts
          ['json', 'yaml', 'csv', 'tsv', 'md', 'html', 'txt'].forEach(t => addTarget(t, 'document'));
        } else if (['b64'].includes(ext)) {
          // Base64 payloads
          ['txt', 'json', 'xml', 'yaml', 'csv'].forEach(t => addTarget(t, 'document'));
        } else if (['md', 'txt', 'tex', 'rtf'].includes(ext)) {
          // Text & Markup
          ['pdf', 'docx', 'txt', 'md', 'html', 'b64', 'epub'].forEach(t => addTarget(t, 'document'));
        } else if (['html'].includes(ext)) {
          // HTML Markup
          ['md', 'txt', 'pdf', 'docx', 'b64'].forEach(t => addTarget(t, 'document'));
        } else if (['doc', 'docx', 'odt', 'rtf', 'wps', 'wpd'].includes(ext)) {
          // Word processing
          ['pdf', 'txt', 'md', 'docx', 'html'].forEach(t => addTarget(t, 'document'));
        } else if (['ppt', 'pptx', 'odp', 'pps', 'ppsx', 'pptm'].includes(ext)) {
          // Presentations
          ['pdf', 'txt'].forEach(t => addTarget(t, 'document'));
        } else if (ext === 'pdf') {
          // PDF to Word (.docx), plain text, and high-res images
          ['docx', 'txt', 'png', 'jpg', 'webp'].forEach(t => addTarget(t, 'document'));
        } else {
          // Generic document
          ['pdf', 'txt', 'b64'].forEach(t => addTarget(t, 'document'));
        }
        break;
      }

      case 'compressed': {
        // Archive conversion & repacking
        const archiveTargets = ['zip', 'tar', 'tar.gz', '7z'];
        archiveTargets.forEach(t => addTarget(t, 'archive'));
        break;
      }

      case 'cad': {
        // CAD conversions
        ['svg', 'pdf', 'png', 'jpg', 'json', 'dxf'].forEach(t => addTarget(t, 'cad'));
        break;
      }

      case 'ebook': {
        // eBook conversions
        ['epub', 'pdf', 'txt', 'html', 'cbz'].forEach(t => addTarget(t, 'ebook'));
        break;
      }
    }

    return targets;
  }

  /**
   * Checks if a conversion from sourceExt to targetExt is supported.
   */
  static isConversionSupported(sourceExt: string, targetExt: string): boolean {
    const targets = this.getCompatibleTargets(sourceExt);
    const cleanTarget = targetExt.toLowerCase().replace(/^\./, '');
    return targets.some(t => t.extension.toLowerCase() === cleanTarget);
  }

  /**
   * Total number of supported format pairs.
   */
  static getTotalConversionPairs(): number {
    let count = 0;
    for (const format of FormatRegistry.getAll()) {
      count += this.getCompatibleTargets(format.extension).length;
    }
    return count;
  }
}
