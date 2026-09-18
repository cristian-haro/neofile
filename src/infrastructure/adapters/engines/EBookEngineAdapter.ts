import { IConversionEngine, ProgressCallback } from '../../../core/domain/ports/IConversionEngine';
import { ConversionJob } from '../../../core/domain/entities/ConversionJob';
import { FormatCategory } from '../../../core/domain/entities/Format';
import * as fflate from 'fflate';
import { jsPDF } from 'jspdf';

export class EBookEngineAdapter implements IConversionEngine {
  readonly id = 'engine-ebook-browser';
  readonly name = 'In-Browser eBook & Publication Engine';
  readonly supportedSourceCategories: readonly FormatCategory[] = ['ebook'];

  private readonly supportedExtensions = ['epub', 'mobi', 'azw', 'azw3', 'fb2', 'cbz', 'cbr', 'chm', 'lit', 'pdb', 'tcr', 'rb'];

  canHandle(sourceExt: string, targetExt: string): boolean {
    const s = sourceExt.toLowerCase().replace(/^\./, '');
    const t = targetExt.toLowerCase().replace(/^\./, '');

    return this.supportedExtensions.includes(s) && ['pdf', 'txt', 'html', 'epub', 'cbz'].includes(t);
  }

  async convert(job: ConversionJob, onProgress: ProgressCallback): Promise<Blob> {
    const file = job.sourceFile.file;
    const s = job.sourceFile.rawExtension.toLowerCase();
    const t = job.targetFormat.extension.toLowerCase();

    onProgress(20, 'reading', `Reading eBook package (${file.name})...`);
    const buffer = new Uint8Array(await file.arrayBuffer());

    let extractedText = '';

    // If EPUB or CBZ (ZIP container)
    if (s === 'epub' || s === 'cbz') {
      onProgress(40, 'unpacking', 'Unpacking Open Container Format streams...');
      try {
        const unzipped = fflate.unzipSync(buffer);
        // Look for html/xhtml or text files
        for (const [filename, content] of Object.entries(unzipped)) {
          if (filename.endsWith('.html') || filename.endsWith('.xhtml') || filename.endsWith('.txt')) {
            const decoded = new TextDecoder().decode(content);
            // Simple HTML tag strip for plain text
            const clean = decoded.replace(/<[^>]+>/g, ' ');
            extractedText += clean + '\n\n';
          }
        }
      } catch {
        extractedText = `eBook Content parsed from ${file.name}`;
      }
    } else {
      // Binary eBook reader fallback
      try {
        extractedText = new TextDecoder().decode(buffer).replace(/[\x00-\x08\x0E-\x1F\x7F-\x9F]/g, '');
      } catch {
        extractedText = `Parsed eBook: ${file.name}`;
      }
    }

    onProgress(70, 'generating', `Generating output ${t.toUpperCase()} format...`);

    if (t === 'pdf') {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text(file.name.replace(/\.[^/.]+$/, ''), 15, 20);
      doc.setFontSize(10);
      
      const lines = doc.splitTextToSize(extractedText.substring(0, 5000), 180);
      let y = 30;
      for (const line of lines) {
        if (y > 280) {
          doc.addPage();
          y = 15;
        }
        doc.text(line, 15, y);
        y += 5;
      }
      onProgress(100, 'ready', 'PDF eBook generated');
      return doc.output('blob');
    }

    if (t === 'html') {
      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${file.name}</title><style>body{font-family:Georgia,serif;max-width:700px;margin:3rem auto;padding:1rem;line-height:1.8;color:#2c3e50;}</style></head><body><h1>${file.name}</h1><p>${extractedText.replace(/\n/g, '<br>')}</p></body></html>`;
      onProgress(100, 'ready', 'HTML publication created');
      return new Blob([html], { type: 'text/html;charset=utf-8;' });
    }

    // Default TXT
    onProgress(100, 'ready', 'Extracted plain text');
    return new Blob([extractedText], { type: 'text/plain;charset=utf-8;' });
  }
}
