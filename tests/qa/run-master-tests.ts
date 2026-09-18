/**
 * Master QA Test Runner for Universal File Converter
 * Executes all domain unit tests and automated QA integration flows.
 */

import { FormatRegistry } from '../../src/core/domain/entities/Format';
import { ConversionMatrix } from '../../src/core/domain/entities/ConversionMatrix';
import { EngineRouterService } from '../../src/core/application/services/EngineRouterService';
import { ConvertFileUseCase } from '../../src/core/application/use-cases/ConvertFileUseCase';
import { ConversionJob } from '../../src/core/domain/entities/ConversionJob';
import { FileItem } from '../../src/core/domain/entities/FileItem';

// Adapters
import { ImageConversionAdapter } from '../../src/infrastructure/adapters/engines/ImageConversionAdapter';
import { DocumentEngineAdapter } from '../../src/infrastructure/adapters/engines/DocumentEngineAdapter';
import { ArchiveEngineAdapter } from '../../src/infrastructure/adapters/engines/ArchiveEngineAdapter';
import { CADEngineAdapter } from '../../src/infrastructure/adapters/engines/CADEngineAdapter';
import { AudioVideoEngineAdapter } from '../../src/infrastructure/adapters/engines/AudioVideoEngineAdapter';
import { EBookEngineAdapter } from '../../src/infrastructure/adapters/engines/EBookEngineAdapter';
import { MagicNumberDetectorAdapter } from '../../src/infrastructure/adapters/detectors/MagicNumberDetectorAdapter';
import { LocalConsoleTelemetryAdapter } from '../../src/infrastructure/adapters/telemetry/LocalConsoleTelemetryAdapter';

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  durationMs: number;
  error?: string;
}

const results: TestResult[] = [];

async function runTest(suite: string, name: string, fn: () => Promise<void> | void) {
  const start = performance.now();
  try {
    await fn();
    const durationMs = Math.round((performance.now() - start) * 100) / 100;
    results.push({ suite, name, passed: true, durationMs });
    console.log(`[PASS] [${suite}] ${name} (${durationMs}ms)`);
  } catch (err) {
    const durationMs = Math.round((performance.now() - start) * 100) / 100;
    const error = err instanceof Error ? err.stack || err.message : String(err);
    results.push({ suite, name, passed: false, durationMs, error });
    console.error(`[FAIL] [${suite}] ${name} (${durationMs}ms)\n  Error: ${error}`);
  }
}

async function runMasterTestSuite() {
  console.log('===============================================================');
  console.log('NEOFILE - MASTER & QA TEST SUITE');
  console.log('Zero-Server Client-Side Architecture Verification');
  console.log('===============================================================\n');

  // --- SUITE 1: Domain Format Registry ---
  await runTest('Domain: Format Registry', 'should contain all required categories with valid definitions', () => {
    const all = FormatRegistry.getAll();
    if (all.length < 70) throw new Error(`Expected at least 70 formats, found ${all.length}`);

    const audio = FormatRegistry.getByCategory('audio');
    const video = FormatRegistry.getByCategory('video');
    const image = FormatRegistry.getByCategory('image');
    const document = FormatRegistry.getByCategory('document');
    const ebook = FormatRegistry.getByCategory('ebook');
    const compressed = FormatRegistry.getByCategory('compressed');
    const cad = FormatRegistry.getByCategory('cad');

    if (audio.length === 0) throw new Error('No audio formats found');
    if (video.length === 0) throw new Error('No video formats found');
    if (image.length === 0) throw new Error('No image formats found');
    if (document.length === 0) throw new Error('No document formats found');
    if (ebook.length === 0) throw new Error('No ebook formats found');
    if (compressed.length === 0) throw new Error('No compressed formats found');
    if (cad.length === 0) throw new Error('No cad formats found');
  });

  await runTest('Domain: Format Registry', 'should normalize extension casing and leading dots', () => {
    const png = FormatRegistry.get('.PNG');
    if (!png || png.extension !== 'png') throw new Error('Failed to normalize .PNG');
    const mp4 = FormatRegistry.get('mP4');
    if (!mp4 || mp4.extension !== 'mp4') throw new Error('Failed to normalize mP4');
  });

  // --- SUITE 2: Domain Conversion Matrix ---
  await runTest('Domain: Conversion Matrix', 'should generate thousands of conversion paths across categories', () => {
    const totalPairs = ConversionMatrix.getTotalConversionPairs();
    if (totalPairs < 500) throw new Error(`Expected >500 conversion pairs, got ${totalPairs}`);
  });

  await runTest('Domain: Conversion Matrix', 'should calculate compatible targets for video and CAD', () => {
    const mp4Targets = ConversionMatrix.getCompatibleTargets('mp4').map(t => t.extension);
    if (!mp4Targets.includes('webm')) throw new Error('MP4 should target WEBM');
    if (!mp4Targets.includes('mp3')) throw new Error('MP4 should support MP3 audio extraction');

    const dxfTargets = ConversionMatrix.getCompatibleTargets('dxf').map(t => t.extension);
    if (!dxfTargets.includes('svg')) throw new Error('DXF should target SVG');
    if (!dxfTargets.includes('pdf')) throw new Error('DXF should target PDF');
  });

  // --- SUITE 3: Infrastructure Binary Magic Number Detection ---
  await runTest('Infra: Magic Number Detector', 'should detect PNG binary signature', async () => {
    const detector = new MagicNumberDetectorAdapter();
    const pngHeader = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    const file = new File([pngHeader], 'sample.png', { type: 'image/png' });
    const result = await detector.detect(file);
    if (result.detectedFormat?.extension !== 'png' || !result.magicNumberMatch) {
      throw new Error('PNG header detection failed');
    }
  });

  await runTest('Infra: Magic Number Detector', 'should detect PDF header signature', async () => {
    const detector = new MagicNumberDetectorAdapter();
    const pdfHeader = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2D, 0x31]);
    const file = new File([pdfHeader], 'document.pdf', { type: 'application/pdf' });
    const result = await detector.detect(file);
    if (result.detectedFormat?.extension !== 'pdf' || !result.magicNumberMatch) {
      throw new Error('PDF header detection failed');
    }
  });

  // --- SUITE 4: QA Integration: Document & Spreadsheet Engine ---
  await runTest('QA: Document Engine', 'should convert CSV text into JSON data format', async () => {
    const engine = new DocumentEngineAdapter();
    const csvContent = 'id,name,role\n1,Alice,Engineer\n2,Bob,QA';
    const csvFile = new File([csvContent], 'test.csv', { type: 'text/csv' });
    const job = new ConversionJob(
      new FileItem(csvFile, FormatRegistry.get('csv')),
      FormatRegistry.get('json')!
    );

    const result = await engine.convert(job, () => {});
    const blob = result instanceof Blob ? result : result.blob;
    const text = await blob.text();
    const json = JSON.parse(text);
    if (!Array.isArray(json) || json.length !== 2 || json[0].name !== 'Alice') {
      throw new Error(`Invalid JSON output: ${text}`);
    }
  });

  await runTest('QA: Document Engine', 'should generate PDF document from Markdown source', async () => {
    const engine = new DocumentEngineAdapter();
    const mdContent = '# Technical Report\nZero-server conversion test.';
    const mdFile = new File([mdContent], 'report.md', { type: 'text/markdown' });
    const job = new ConversionJob(
      new FileItem(mdFile, FormatRegistry.get('md')),
      FormatRegistry.get('pdf')!
    );

    const result = await engine.convert(job, () => {});
    const blob = result instanceof Blob ? result : result.blob;
    if (blob.size < 50 || blob.type !== 'application/pdf') {
      throw new Error(`Invalid PDF output size: ${blob.size}`);
    }
  });

  await runTest('QA: Document Engine', 'should convert PDF to Microsoft Word (.docx) document', async () => {
    const engine = new DocumentEngineAdapter();
    const pdfContent = '%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\nBT /F1 12 Tf (Hello World from PDF Document) Tj ET\n%%EOF';
    const pdfFile = new File([pdfContent], 'document.pdf', { type: 'application/pdf' });
    const job = new ConversionJob(
      new FileItem(pdfFile, FormatRegistry.get('pdf')),
      FormatRegistry.get('docx')!
    );

    const result = await engine.convert(job, () => {});
    const blob = result instanceof Blob ? result : result.blob;
    if (blob.size < 500) {
      throw new Error(`Invalid DOCX generated size: ${blob.size}`);
    }
  });

  await runTest('QA: Document Engine', 'should convert PDF pages to PNG images', async () => {
    const engine = new DocumentEngineAdapter();
    const pdfContent = '%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF';
    const pdfFile = new File([pdfContent], 'document.pdf', { type: 'application/pdf' });
    const job = new ConversionJob(
      new FileItem(pdfFile, FormatRegistry.get('pdf')),
      FormatRegistry.get('png')!
    );

    const result = await engine.convert(job, () => {});
    const blob = result instanceof Blob ? result : result.blob;
    if (blob.size === 0) {
      throw new Error('Expected non-empty image blob for PDF to PNG conversion');
    }
  });

  // --- SUITE 5: QA Integration: Archive Engine ---
  await runTest('QA: Archive Engine', 'should create valid multi-file ZIP bundles', async () => {
    const bundle = await ArchiveEngineAdapter.createZipBundle([
      { name: 'hello.txt', blob: new Blob(['Hello World'], { type: 'text/plain' }) },
      { name: 'config.json', blob: new Blob(['{"active":true}'], { type: 'application/json' }) }
    ]);

    if (bundle.size < 20 || bundle.type !== 'application/zip') {
      throw new Error(`Invalid ZIP bundle size: ${bundle.size}`);
    }
  });

  // --- SUITE 6: QA Integration: CAD Engine ---
  await runTest('QA: CAD Engine', 'should parse DXF lines and generate SVG graphics', async () => {
    const engine = new CADEngineAdapter();
    const sampleDxf = `  0\nSECTION\n  2\nENTITIES\n  0\nLINE\n  8\n0\n 10\n0.0\n 20\n0.0\n 11\n50.0\n 21\n50.0\n  0\nENDSEC\n  0\nEOF`;
    const dxfFile = new File([sampleDxf], 'floorplan.dxf', { type: 'application/dxf' });
    const job = new ConversionJob(
      new FileItem(dxfFile, FormatRegistry.get('dxf')),
      FormatRegistry.get('svg')!
    );

    const blob = await engine.convert(job, () => {});
    const svgText = await blob.text();
    if (!svgText.includes('<svg') || !svgText.includes('<line')) {
      throw new Error('DXF to SVG failed to render vector lines');
    }
  });

  // --- SUITE 7: End-to-End Hexagonal Use Case Flow ---
  await runTest('E2E: Hexagonal Flow', 'should execute full lifecycle through Router and UseCase', async () => {
    const telemetry = new LocalConsoleTelemetryAdapter();
    const router = new EngineRouterService([
      new DocumentEngineAdapter(),
      new ImageConversionAdapter(),
      new ArchiveEngineAdapter(),
      new CADEngineAdapter(),
      new AudioVideoEngineAdapter(),
      new EBookEngineAdapter()
    ]);

    const useCase = new ConvertFileUseCase(router, telemetry);
    const sourceFile = new File(['alpha,beta\n1,2'], 'data.csv', { type: 'text/csv' });
    const job = new ConversionJob(
      new FileItem(sourceFile, FormatRegistry.get('csv')),
      FormatRegistry.get('json')!
    );

    const completed = await useCase.execute(job);
    if (completed.status !== 'completed' || !completed.result) {
      throw new Error(`Job execution did not complete cleanly: ${completed.error}`);
    }
    if (completed.progress.percentage !== 100) {
      throw new Error(`Expected 100% progress, got ${completed.progress.percentage}`);
    }

    // Test Re-conversion / Reset Flow
    job.reset();
    if (job.status !== 'queued' || job.result !== undefined || job.progress.percentage !== 0) {
      throw new Error('Reset failed to return job to clean queued state');
    }
    job.setTargetFormat(FormatRegistry.get('xlsx')!);
    if (job.targetFormat.extension !== 'xlsx') {
      throw new Error('Failed to set new target format after reset');
    }
  });

  await runTest('Domain: UX & Utilities', 'should calculate format support and format byte sizes accurately', () => {
    if (!ConversionMatrix.isConversionSupported('pdf', 'docx')) {
      throw new Error('PDF to DOCX should be supported');
    }
    if (!ConversionMatrix.isConversionSupported('png', 'webp')) {
      throw new Error('PNG to WEBP should be supported');
    }
    if (ConversionMatrix.isConversionSupported('mp3', 'dwg')) {
      throw new Error('MP3 to DWG should not be supported');
    }

    if (FileItem.formatBytes(0) !== '0 B') throw new Error('0 B format mismatch');
    if (FileItem.formatBytes(1024) !== '1 KB') throw new Error('1 KB format mismatch');
    if (FileItem.formatBytes(1048576) !== '1 MB') throw new Error('1 MB format mismatch');
  });

  // --- SUMMARY ---
  console.log('\n===============================================================');
  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.filter(r => !r.passed).length;
  const totalDuration = Math.round(results.reduce((acc, r) => acc + r.durationMs, 0));

  console.log(`TOTAL TESTS: ${results.length}`);
  console.log(`PASSED: ${passedCount}`);
  console.log(`FAILED: ${failedCount}`);
  console.log(`TOTAL DURATION: ${totalDuration}ms`);
  console.log('===============================================================');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runMasterTestSuite();
