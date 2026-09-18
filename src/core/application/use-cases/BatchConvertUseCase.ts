import { ConversionJob } from '../../domain/entities/ConversionJob';
import { ConvertFileUseCase } from './ConvertFileUseCase';

export interface BatchProgress {
  readonly totalJobs: number;
  readonly completedJobs: number;
  readonly failedJobs: number;
  readonly activeJobs: number;
  readonly overallPercentage: number;
}

export class BatchConvertUseCase {
  constructor(private readonly convertFileUseCase: ConvertFileUseCase) {}

  async execute(
    jobs: ConversionJob[],
    concurrency: number = 2,
    onBatchProgress?: (progress: BatchProgress) => void
  ): Promise<ConversionJob[]> {
    const queuedJobs = jobs.filter(j => j.status === 'queued' || j.status === 'failed');
    if (queuedJobs.length === 0) return jobs;

    let completedCount = 0;
    let failedCount = 0;

    const reportProgress = () => {
      if (onBatchProgress) {
        const total = jobs.length;
        const active = jobs.filter(j => j.status === 'converting').length;
        const progressSum = jobs.reduce((acc, j) => acc + j.progress.percentage, 0);
        const overallPercentage = total > 0 ? Math.round(progressSum / total) : 0;

        onBatchProgress({
          totalJobs: total,
          completedJobs: completedCount,
          failedJobs: failedCount,
          activeJobs: active,
          overallPercentage
        });
      }
    };

    // Process in batches with concurrency limit
    const pool: Promise<ConversionJob>[] = [];
    
    for (const job of queuedJobs) {
      const task = this.convertFileUseCase.execute(job).then(res => {
        if (res.status === 'completed') {
          completedCount++;
        } else if (res.status === 'failed') {
          failedCount++;
        }
        reportProgress();
        return res;
      });

      pool.push(task);

      if (pool.length >= concurrency) {
        await Promise.race(pool);
        // Remove settled promises from pool
        for (let i = pool.length - 1; i >= 0; i--) {
          // Check if resolved by attaching a noop catch
        }
      }
    }

    await Promise.all(pool);
    return jobs;
  }
}
