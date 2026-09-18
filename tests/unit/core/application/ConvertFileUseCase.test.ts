import { describe, it, expect } from 'vitest';
import { ConvertFileUseCase } from '../../../../src/core/application/use-cases/ConvertFileUseCase';
import { EngineRouterService } from '../../../../src/core/application/services/EngineRouterService';
import { ConversionJob } from '../../../../src/core/domain/entities/ConversionJob';
import { FileItem } from '../../../../src/core/domain/entities/FileItem';
import { FormatRegistry } from '../../../../src/core/domain/entities/Format';
import { IConversionEngine, ProgressCallback } from '../../../../src/core/domain/ports/IConversionEngine';

class MockSuccessEngine implements IConversionEngine {
  readonly id = 'mock-success';
  readonly name = 'Mock Success Engine';
  readonly supportedSourceCategories = ['document'] as const;

  canHandle(): boolean {
    return true;
  }

  async convert(_job: ConversionJob, onProgress: ProgressCallback): Promise<Blob> {
    onProgress(50, 'processing', 'Halfway done');
    onProgress(100, 'ready', 'All done');
    return new Blob(['converted text content'], { type: 'text/plain' });
  }
}

describe('ConvertFileUseCase (Application Layer)', () => {
  it('should successfully execute conversion lifecycle and update job status', async () => {
    const mockEngine = new MockSuccessEngine();
    const router = new EngineRouterService([mockEngine]);
    const useCase = new ConvertFileUseCase(router);

    const testFile = new File(['hello world sample text'], 'sample.md', { type: 'text/markdown' });
    const sourceFormat = FormatRegistry.get('md')!;
    const targetFormat = FormatRegistry.get('txt')!;

    const fileItem = new FileItem(testFile, sourceFormat);
    const job = new ConversionJob(fileItem, targetFormat);

    expect(job.status).toBe('queued');

    const resultJob = await useCase.execute(job);

    expect(resultJob.status).toBe('completed');
    expect(resultJob.result).toBeDefined();
    expect(resultJob.result?.fileName).toBe('sample.txt');
    expect(resultJob.progress.percentage).toBe(100);
    expect(resultJob.durationMs).toBeGreaterThanOrEqual(0);
  });
});
