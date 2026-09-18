export interface TelemetryEvent {
  readonly name: string;
  readonly properties?: Record<string, string | number | boolean>;
  readonly timestamp: Date;
}

export interface ITelemetryPort {
  trackConversion(sourceExt: string, targetExt: string, durationMs: number, success: boolean): void;
  trackError(context: string, error: Error | string): void;
}
