import { ConversionJob } from '../../domain/entities/ConversionJob';
import { EngineRouterService } from '../services/EngineRouterService';
import { ITelemetryPort } from '../../domain/ports/ITelemetryPort';

export class ConvertFileUseCase {
  constructor(
    private readonly routerService: EngineRouterService,
    private readonly telemetry?: ITelemetryPort
  ) {}

  async execute(job: ConversionJob): Promise<ConversionJob> {
    const sourceExt = job.sourceFile.rawExtension;
    const targetExt = job.targetFormat.extension;

    job.start();

    try {
      const engine = this.routerService.getEngine(sourceExt, targetExt);
      job.updateProgress(10, 'initializing', `Using ${engine.name}`);

      const result = await engine.convert(job, (percentage, stage, message) => {
        job.updateProgress(percentage, stage, message);
      });

      if (result instanceof Blob) {
        job.complete(result);
      } else if (result && typeof result === 'object' && 'blob' in result) {
        job.complete(result.blob, result.outputFileName);
      } else {
        throw new Error('Conversion engine returned an invalid result format');
      }

      if (this.telemetry && job.durationMs !== undefined) {
        this.telemetry.trackConversion(sourceExt, targetExt, job.durationMs, true);
      }

      return job;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      job.fail(errorMsg);

      if (this.telemetry) {
        this.telemetry.trackError('ConvertFileUseCase', errorMsg);
        if (job.durationMs !== undefined) {
          this.telemetry.trackConversion(sourceExt, targetExt, job.durationMs, false);
        }
      }

      return job;
    }
  }
}
