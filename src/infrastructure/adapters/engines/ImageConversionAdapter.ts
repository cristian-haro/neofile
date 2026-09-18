import { IConversionEngine, ProgressCallback } from '../../../core/domain/ports/IConversionEngine';
import { ConversionJob } from '../../../core/domain/entities/ConversionJob';
import { FormatCategory } from '../../../core/domain/entities/Format';
import { jsPDF } from 'jspdf';

export class ImageConversionAdapter implements IConversionEngine {
  readonly id = 'engine-image-canvas';
  readonly name = 'In-Browser Image Engine (Canvas & WebGL)';
  readonly supportedSourceCategories: readonly FormatCategory[] = ['image'];

  private readonly supportedExtensions = [
    'png', 'jpg', 'jpeg', 'webp', 'avif', 'bmp', 'gif', 'svg', 'ico', 'tiff', 'tga', 'jfif', 'cur'
  ];

  canHandle(sourceExt: string, targetExt: string): boolean {
    const s = sourceExt.toLowerCase().replace(/^\./, '');
    const t = targetExt.toLowerCase().replace(/^\./, '');

    const isSourceSupported = this.supportedExtensions.includes(s);
    const isTargetSupported = [...this.supportedExtensions, 'pdf'].includes(t);

    return isSourceSupported && isTargetSupported;
  }

  async convert(job: ConversionJob, onProgress: ProgressCallback): Promise<Blob> {
    const sourceFile = job.sourceFile.file;
    const targetExt = job.targetFormat.extension.toLowerCase();
    const options = job.options.image || {};

    onProgress(20, 'reading', 'Loading image into memory buffer...');

    // If converting to PDF
    if (targetExt === 'pdf') {
      return this.convertToPdf(sourceFile, onProgress);
    }

    // If source is SVG and target is SVG
    if (job.sourceFile.rawExtension === 'svg' && targetExt === 'svg') {
      const text = await sourceFile.text();
      return new Blob([text], { type: 'image/svg+xml' });
    }

    // Convert via HTML Canvas / Image element
    const img = await this.loadImage(sourceFile);
    onProgress(50, 'rasterizing', 'Rendering image canvas with custom parameters...');

    const canvas = document.createElement('canvas');
    let targetWidth = options.width || img.naturalWidth || img.width || 800;
    let targetHeight = options.height || img.naturalHeight || img.height || 600;

    if (options.maintainAspectRatio && options.width && !options.height) {
      const ratio = (img.naturalHeight || 600) / (img.naturalWidth || 800);
      targetHeight = Math.round(targetWidth * ratio);
    }

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Unable to acquire 2D canvas context for zero-server image conversion');
    }

    // Fill background color if specified (e.g. for transparent PNG -> JPG)
    if (targetExt === 'jpg' || targetExt === 'jpeg' || options.backgroundColor) {
      ctx.fillStyle = options.backgroundColor || '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
    onProgress(80, 'encoding', `Encoding output format to .${targetExt.toUpperCase()}...`);

    const mimeMap: Record<string, string> = {
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      webp: 'image/webp',
      bmp: 'image/bmp',
      ico: 'image/x-icon',
      gif: 'image/gif'
    };

    const targetMime = mimeMap[targetExt] || 'image/png';
    const quality = options.quality !== undefined ? options.quality : 0.92;

    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            onProgress(100, 'ready', 'Conversion completed');
            resolve(blob);
          } else {
            // Fallback for BMP or unsupported MIME by canvas
            try {
              const dataUrl = canvas.toDataURL(targetMime, quality);
              const byteString = atob(dataUrl.split(',')[1]);
              const ab = new ArrayBuffer(byteString.length);
              const ia = new Uint8Array(ab);
              for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
              }
              resolve(new Blob([ab], { type: targetMime }));
            } catch (err) {
              reject(new Error(`Browser does not support direct export to .${targetExt.toUpperCase()}`));
            }
          }
        },
        targetMime,
        quality
      );
    });
  }

  private loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = (err) => {
        URL.revokeObjectURL(url);
        reject(new Error(`Failed to decode image: ${file.name}`));
      };
      img.src = url;
    });
  }

  private async convertToPdf(file: File, onProgress: ProgressCallback): Promise<Blob> {
    const img = await this.loadImage(file);
    onProgress(60, 'generating_pdf', 'Packaging image into PDF document...');

    const orientation = img.width > img.height ? 'landscape' : 'portrait';
    const doc = new jsPDF({
      orientation,
      unit: 'px',
      format: [img.width, img.height]
    });

    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    doc.addImage(imgData, 'JPEG', 0, 0, img.width, img.height);

    const pdfBlob = doc.output('blob');
    onProgress(100, 'ready', 'PDF generated');
    return pdfBlob;
  }
}
