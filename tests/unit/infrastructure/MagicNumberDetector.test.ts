import { describe, it, expect } from 'vitest';
import { MagicNumberDetectorAdapter } from '../../../src/infrastructure/adapters/detectors/MagicNumberDetectorAdapter';

describe('MagicNumberDetectorAdapter (Infrastructure Adapter)', () => {
  const detector = new MagicNumberDetectorAdapter();

  it('should detect PNG files from binary header', async () => {
    // 89 50 4E 47 0D 0A 1A 0A
    const pngHeader = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00]);
    const file = new File([pngHeader], 'image.png', { type: 'image/png' });

    const result = await detector.detect(file);
    expect(result.detectedFormat?.extension).toBe('png');
    expect(result.magicNumberMatch).toBe(true);
    expect(result.confidence).toBeGreaterThan(0.9);
  });

  it('should detect PDF files from binary header (%PDF)', async () => {
    // 25 50 44 46
    const pdfHeader = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34]);
    const file = new File([pdfHeader], 'document.pdf', { type: 'application/pdf' });

    const result = await detector.detect(file);
    expect(result.detectedFormat?.extension).toBe('pdf');
    expect(result.magicNumberMatch).toBe(true);
  });

  it('should detect 7Z archives from binary header', async () => {
    // 37 7A BC AF 27 1C
    const sevenZipHeader = new Uint8Array([0x37, 0x7A, 0xBC, 0xAF, 0x27, 0x1C, 0x00]);
    const file = new File([sevenZipHeader], 'archive.7z');

    const result = await detector.detect(file);
    expect(result.detectedFormat?.extension).toBe('7z');
    expect(result.magicNumberMatch).toBe(true);
  });
});
