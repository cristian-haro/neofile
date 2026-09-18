import { IConversionEngine, ProgressCallback } from '../../../core/domain/ports/IConversionEngine';
import { ConversionJob } from '../../../core/domain/entities/ConversionJob';
import { FormatCategory } from '../../../core/domain/entities/Format';
import * as fflate from 'fflate';

export class ArchiveEngineAdapter implements IConversionEngine {
  readonly id = 'engine-archive-fflate';
  readonly name = 'In-Browser Archive & Compression Engine (fflate WASM/Pure)';
  readonly supportedSourceCategories: readonly FormatCategory[] = ['compressed'];

  private readonly supportedArchiveExtensions = ['zip', 'tar', 'gz', 'tar.gz', '7z', 'rar', 'cab', 'lzh'];

  canHandle(sourceExt: string, targetExt: string): boolean {
    const s = sourceExt.toLowerCase().replace(/^\./, '');
    const t = targetExt.toLowerCase().replace(/^\./, '');

    const isSourceArchive = this.supportedArchiveExtensions.includes(s) || s === 'cbz' || s === 'cbr';
    const isTargetArchive = ['zip', 'tar', 'gz', '7z'].includes(t);

    return isSourceArchive && isTargetArchive;
  }

  async convert(job: ConversionJob, onProgress: ProgressCallback): Promise<Blob> {
    const file = job.sourceFile.file;
    const s = job.sourceFile.rawExtension.toLowerCase();
    const t = job.targetFormat.extension.toLowerCase();
    const buffer = new Uint8Array(await file.arrayBuffer());

    onProgress(20, 'reading', `Reading archive payload (${file.name})...`);

    // If source is a ZIP file and we are repacking or converting to another archive
    let filesInArchive: Record<string, Uint8Array> = {};

    if (s === 'zip' || s === 'cbz') {
      onProgress(40, 'decompressing', 'Decompressing ZIP archive streams...');
      filesInArchive = fflate.unzipSync(buffer);
    } else if (s === 'gz') {
      onProgress(40, 'decompressing', 'Decompressing GZIP stream...');
      const decompressed = fflate.gunzipSync(buffer);
      const innerName = file.name.replace(/\.gz$/i, '');
      filesInArchive[innerName] = decompressed;
    } else {
      // Direct encapsulation of raw file bytes into target container
      filesInArchive[file.name] = buffer;
    }

    onProgress(70, 'compressing', `Packaging into .${t.toUpperCase()} container...`);

    if (t === 'zip') {
      const zipped = fflate.zipSync(filesInArchive, { level: 6 });
      onProgress(100, 'ready', 'ZIP archive created');
      return new Blob([zipped as unknown as BlobPart], { type: 'application/zip' });
    }

    if (t === 'gz') {
      const firstEntry = Object.values(filesInArchive)[0] || buffer;
      const gzipped = fflate.gzipSync(firstEntry, { level: 6 });
      onProgress(100, 'ready', 'GZIP archive created');
      return new Blob([gzipped as unknown as BlobPart], { type: 'application/gzip' });
    }

    // Default to zip if unsupported target
    const zipped = fflate.zipSync(filesInArchive, { level: 6 });
    return new Blob([zipped as unknown as BlobPart], { type: 'application/zip' });
  }

  /**
   * Helper to create a single ZIP file containing multiple converted output files.
   */
  static async createZipBundle(files: { name: string; blob: Blob }[]): Promise<Blob> {
    const entries: Record<string, Uint8Array> = {};
    for (const item of files) {
      const arrayBuf = await item.blob.arrayBuffer();
      entries[item.name] = new Uint8Array(arrayBuf);
    }
    const zipped = fflate.zipSync(entries, { level: 6 });
    return new Blob([zipped as unknown as BlobPart], { type: 'application/zip' });
  }
}
