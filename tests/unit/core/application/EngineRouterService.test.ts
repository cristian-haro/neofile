import { describe, it, expect } from 'vitest';
import { EngineRouterService } from '../../../../src/core/application/services/EngineRouterService';
import { IConversionEngine } from '../../../../src/core/domain/ports/IConversionEngine';
import { ConversionJob } from '../../../../src/core/domain/entities/ConversionJob';

class MockImageEngine implements IConversionEngine {
  readonly id = 'mock-image';
  readonly name = 'Mock Image Engine';
  readonly supportedSourceCategories = ['image'] as const;

  canHandle(sourceExt: string, targetExt: string): boolean {
    return ['png', 'jpg'].includes(sourceExt) && ['webp', 'png'].includes(targetExt);
  }

  async convert(_job: ConversionJob): Promise<Blob> {
    return new Blob(['fake image bytes'], { type: 'image/webp' });
  }
}

describe('EngineRouterService (Application Service)', () => {
  it('should register and dispatch to the correct engine', () => {
    const mockEngine = new MockImageEngine();
    const router = new EngineRouterService([mockEngine]);

    const resolved = router.getEngine('png', 'webp');
    expect(resolved.id).toBe('mock-image');
  });

  it('should throw an error when no engine can handle the format combination', () => {
    const router = new EngineRouterService();
    expect(() => router.getEngine('unknown_ext', 'unsupported_target')).toThrowError(
      /No compatible zero-server conversion engine/
    );
  });
});
