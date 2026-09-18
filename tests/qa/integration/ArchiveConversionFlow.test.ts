import { describe, it, expect } from 'vitest';
import { ArchiveEngineAdapter } from '../../../src/infrastructure/adapters/engines/ArchiveEngineAdapter';
import * as fflate from 'fflate';

describe('QA Integration: Archive Packaging and Bundling Flow', () => {
  it('should package multiple converted files into a valid ZIP bundle', async () => {
    const file1 = { name: 'report.txt', blob: new Blob(['Report Content'], { type: 'text/plain' }) };
    const file2 = { name: 'data.json', blob: new Blob(['{"status":"ok"}'], { type: 'application/json' }) };

    const zipBlob = await ArchiveEngineAdapter.createZipBundle([file1, file2]);
    expect(zipBlob.size).toBeGreaterThan(0);
    expect(zipBlob.type).toBe('application/zip');

    // Verify unzipping returns original entries
    const zipArrayBuffer = await zipBlob.arrayBuffer();
    const unzipped = fflate.unzipSync(new Uint8Array(zipArrayBuffer));

    expect(unzipped['report.txt']).toBeDefined();
    expect(unzipped['data.json']).toBeDefined();

    const text1 = new TextDecoder().decode(unzipped['report.txt']);
    expect(text1).toBe('Report Content');
  });
});
