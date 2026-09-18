import { FormatDefinition } from '../entities/Format';

export interface FormatDetectionResult {
  readonly detectedFormat?: FormatDefinition;
  readonly confidence: number; // 0.0 - 1.0
  readonly mimeMatch: boolean;
  readonly magicNumberMatch: boolean;
}

export interface IFormatDetector {
  detect(file: File): Promise<FormatDetectionResult>;
}
