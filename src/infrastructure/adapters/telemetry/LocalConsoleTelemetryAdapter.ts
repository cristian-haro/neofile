import { ITelemetryPort } from '../../../core/domain/ports/ITelemetryPort';

export class LocalConsoleTelemetryAdapter implements ITelemetryPort {
  trackConversion(sourceExt: string, targetExt: string, durationMs: number, success: boolean): void {
    const statusText = success ? 'SUCCESS' : 'FAILED';
    console.debug(`[Zero-Server Telemetry] ${statusText} | ${sourceExt.toUpperCase()} -> ${targetExt.toUpperCase()} in ${durationMs}ms (Client-only, 0 bytes transmitted)`);
  }

  trackError(context: string, error: Error | string): void {
    const msg = error instanceof Error ? error.message : error;
    console.error(`[Zero-Server Error] Context: ${context} | Message: ${msg}`);
  }
}
