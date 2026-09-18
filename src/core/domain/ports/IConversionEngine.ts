import { ConversionJob } from '../entities/ConversionJob';
import { FormatCategory } from '../entities/Format';

export interface ProgressCallback {
  (percentage: number, stage: string, message?: string): void;
}

export type EngineConversionResult = Blob | { blob: Blob; outputFileName?: string };

export interface IConversionEngine {
  readonly id: string;
  readonly name: string;
  readonly supportedSourceCategories: readonly FormatCategory[];

  /**
   * Evaluates if this engine can execute conversion between the given source and target extensions.
   */
  canHandle(sourceExt: string, targetExt: string): boolean;

  /**
   * Executes the client-side conversion and yields the output Blob or result with custom filename.
   */
  convert(job: ConversionJob, onProgress: ProgressCallback): Promise<EngineConversionResult>;
}
