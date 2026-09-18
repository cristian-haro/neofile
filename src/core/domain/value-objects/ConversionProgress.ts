export interface ConversionProgress {
  readonly percentage: number; // 0 - 100
  readonly stage: string;       // e.g. 'parsing', 'transcoding', 'packaging'
  readonly message?: string;
  readonly bytesProcessed?: number;
  readonly totalBytes?: number;
}
