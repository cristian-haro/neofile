import { FileItem } from '../../domain/entities/FileItem';
import { FormatDefinition, FormatRegistry } from '../../domain/entities/Format';
import { IFormatDetector, FormatDetectionResult } from '../../domain/ports/IFormatDetector';

export class DetectFormatUseCase {
  constructor(private readonly detector?: IFormatDetector) {}

  async execute(file: File): Promise<{ format: FormatDefinition; detectionResult?: FormatDetectionResult }> {
    let detectedFormat: FormatDefinition | undefined;
    let detectionResult: FormatDetectionResult | undefined;

    if (this.detector) {
      detectionResult = await this.detector.detect(file);
      if (detectionResult.detectedFormat) {
        detectedFormat = detectionResult.detectedFormat;
      }
    }

    if (!detectedFormat) {
      const parts = file.name.split('.');
      const ext = parts.length > 1 ? parts.pop()!.toLowerCase() : '';
      detectedFormat = FormatRegistry.get(ext);
    }

    if (!detectedFormat) {
      // Fallback generic format definition
      detectedFormat = {
        extension: 'bin',
        name: 'Binary Data',
        description: 'Unknown binary file format',
        category: 'document',
        mimeType: file.type || 'application/octet-stream'
      };
    }

    return {
      format: detectedFormat,
      detectionResult
    };
  }
}
