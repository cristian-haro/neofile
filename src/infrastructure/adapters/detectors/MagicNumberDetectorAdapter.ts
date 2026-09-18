import { IFormatDetector, FormatDetectionResult } from '../../../core/domain/ports/IFormatDetector';
import { FormatRegistry, FormatDefinition } from '../../../core/domain/entities/Format';

interface MagicSignature {
  readonly bytes: number[];
  readonly mask?: number[];
  readonly extension: string;
}

export class MagicNumberDetectorAdapter implements IFormatDetector {
  private readonly signatures: MagicSignature[] = [
    // Image Signatures
    { bytes: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], extension: 'png' },
    { bytes: [0xFF, 0xD8, 0xFF], extension: 'jpg' },
    { bytes: [0x47, 0x49, 0x46, 0x38], extension: 'gif' },
    { bytes: [0x42, 0x4D], extension: 'bmp' },
    { bytes: [0x52, 0x49, 0x46, 0x46], extension: 'webp' }, // RIFF header for webp/wav/avi
    { bytes: [0x49, 0x49, 0x2A, 0x00], extension: 'tiff' },
    { bytes: [0x4D, 0x4D, 0x00, 0x2A], extension: 'tiff' },
    { bytes: [0x38, 0x42, 0x50, 0x53], extension: 'psd' },

    // Document Signatures
    { bytes: [0x25, 0x50, 0x44, 0x46], extension: 'pdf' }, // %PDF
    { bytes: [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1], extension: 'doc' }, // OLE CFB
    { bytes: [0x50, 0x4B, 0x03, 0x04], extension: 'docx' }, // ZIP container for docx/xlsx/pptx/epub/zip

    // Compressed Signatures
    { bytes: [0x37, 0x7A, 0xBC, 0xAF, 0x27, 0x1C], extension: '7z' },
    { bytes: [0x52, 0x61, 0x72, 0x21, 0x1A, 0x07], extension: 'rar' },
    { bytes: [0x1F, 0x8B], extension: 'tar.gz' },
    { bytes: [0x42, 0x5A, 0x68], extension: 'tar.bz2' },

    // Audio / Video
    { bytes: [0x49, 0x44, 0x33], extension: 'mp3' }, // ID3v2
    { bytes: [0x66, 0x4C, 0x61, 0x43], extension: 'flac' }, // fLaC
    { bytes: [0x4F, 0x67, 0x67, 0x53], extension: 'ogg' }, // OggS
    { bytes: [0x4D, 0x54, 0x68, 0x64], extension: 'midi' }, // MThd
    { bytes: [0x1A, 0x45, 0xDF, 0xA3], extension: 'mkv' }, // Matroska / WebM
  ];

  async detect(file: File): Promise<FormatDetectionResult> {
    try {
      const slice = file.slice(0, 32);
      const buffer = new Uint8Array(await slice.arrayBuffer());

      let bestMatchExt: string | undefined;

      for (const sig of this.signatures) {
        if (buffer.length >= sig.bytes.length) {
          let match = true;
          for (let i = 0; i < sig.bytes.length; i++) {
            if (buffer[i] !== sig.bytes[i]) {
              match = false;
              break;
            }
          }
          if (match) {
            bestMatchExt = sig.extension;
            break;
          }
        }
      }

      // Check file name extension
      const fileNameParts = file.name.split('.');
      const fileExt = fileNameParts.length > 1 ? fileNameParts.pop()!.toLowerCase() : '';

      if (bestMatchExt) {
        // If it's a zip container, prioritize file extension (e.g. docx, xlsx, epub, zip)
        let resolvedExt = bestMatchExt;
        if (bestMatchExt === 'docx' && ['xlsx', 'pptx', 'epub', 'cbz', 'zip'].includes(fileExt)) {
          resolvedExt = fileExt;
        }

        const formatDef = FormatRegistry.get(resolvedExt) || FormatRegistry.get(bestMatchExt);
        return {
          detectedFormat: formatDef,
          confidence: 0.95,
          mimeMatch: Boolean(file.type && formatDef && file.type.includes(formatDef.mimeType)),
          magicNumberMatch: true
        };
      }

      // Fallback to name extension
      const nameFormat = FormatRegistry.get(fileExt);
      return {
        detectedFormat: nameFormat,
        confidence: nameFormat ? 0.7 : 0.2,
        mimeMatch: false,
        magicNumberMatch: false
      };
    } catch {
      return {
        detectedFormat: undefined,
        confidence: 0,
        mimeMatch: false,
        magicNumberMatch: false
      };
    }
  }
}
