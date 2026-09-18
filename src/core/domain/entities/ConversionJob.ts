import { FileItem } from './FileItem';
import { FormatDefinition } from './Format';
import { ConversionOptions } from '../value-objects/ConversionOptions';
import { ConversionProgress } from '../value-objects/ConversionProgress';

export type JobStatus = 'queued' | 'converting' | 'completed' | 'failed' | 'cancelled';

export interface ConvertedResult {
  readonly blob: Blob;
  readonly fileName: string;
  readonly mimeType: string;
  readonly size: number;
  readonly downloadUrl: string;
}

export class ConversionJob {
  readonly id: string;
  readonly sourceFile: FileItem;
  targetFormat: FormatDefinition;
  options: ConversionOptions;
  status: JobStatus;
  progress: ConversionProgress;
  result?: ConvertedResult;
  error?: string;
  readonly createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;

  constructor(
    sourceFile: FileItem, 
    targetFormat: FormatDefinition, 
    options: ConversionOptions = {}
  ) {
    this.id = `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    this.sourceFile = sourceFile;
    this.targetFormat = targetFormat;
    this.options = options;
    this.status = 'queued';
    this.progress = { percentage: 0, stage: 'queued' };
    this.createdAt = new Date();
  }

  setTargetFormat(newTarget: FormatDefinition): void {
    if (this.status === 'converting' || this.status === 'completed') {
      throw new Error('Cannot change target format while conversion is in progress or completed');
    }
    this.targetFormat = newTarget;
  }

  start(): void {
    this.status = 'converting';
    this.startedAt = new Date();
    this.progress = { percentage: 0, stage: 'starting' };
  }

  updateProgress(percentage: number, stage: string, message?: string): void {
    this.progress = {
      percentage: Math.min(100, Math.max(0, percentage)),
      stage,
      message
    };
  }

  complete(blob: Blob, outputFileName?: string): void {
    this.status = 'completed';
    this.completedAt = new Date();
    this.progress = { percentage: 100, stage: 'completed' };
    
    const baseName = this.sourceFile.name.substring(0, this.sourceFile.name.lastIndexOf('.')) || this.sourceFile.name;
    const finalName = outputFileName || `${baseName}.${this.targetFormat.extension}`;
    
    const downloadUrl = URL.createObjectURL(blob);
    this.result = {
      blob,
      fileName: finalName,
      mimeType: blob.type || this.targetFormat.mimeType,
      size: blob.size,
      downloadUrl
    };
  }

  fail(errorMessage: string): void {
    this.status = 'failed';
    this.completedAt = new Date();
    this.error = errorMessage;
    this.progress = { percentage: 0, stage: 'failed', message: errorMessage };
  }

  cancel(): void {
    if (this.status === 'converting' || this.status === 'queued') {
      this.status = 'cancelled';
      this.completedAt = new Date();
      this.progress = { percentage: 0, stage: 'cancelled' };
    }
  }

  get durationMs(): number | undefined {
    if (this.startedAt && this.completedAt) {
      return this.completedAt.getTime() - this.startedAt.getTime();
    }
    return undefined;
  }

  cleanup(): void {
    if (this.result?.downloadUrl) {
      try {
        URL.revokeObjectURL(this.result.downloadUrl);
      } catch {
        // Cleanup ignore
      }
    }
  }
}
