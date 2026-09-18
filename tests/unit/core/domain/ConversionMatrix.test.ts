import { describe, it, expect } from 'vitest';
import { ConversionMatrix } from '../../../../src/core/domain/entities/ConversionMatrix';

describe('ConversionMatrix (Domain Entity)', () => {
  it('should return valid target formats for images', () => {
    const targets = ConversionMatrix.getCompatibleTargets('png');
    const targetExts = targets.map(t => t.extension);

    expect(targetExts).toContain('jpg');
    expect(targetExts).toContain('webp');
    expect(targetExts).toContain('svg');
    expect(targetExts).toContain('pdf'); // Cross-category image to PDF
    expect(targetExts).not.toContain('png'); // Should not include self
  });

  it('should return valid target formats for video including audio extraction', () => {
    const targets = ConversionMatrix.getCompatibleTargets('mp4');
    const targetExts = targets.map(t => t.extension);

    expect(targetExts).toContain('webm');
    expect(targetExts).toContain('mkv');
    expect(targetExts).toContain('mp3'); // Audio extraction
    expect(targetExts).toContain('wav'); // Audio extraction
    expect(targetExts).toContain('gif'); // Video to GIF
  });

  it('should return valid target formats for spreadsheets', () => {
    const targets = ConversionMatrix.getCompatibleTargets('csv');
    const targetExts = targets.map(t => t.extension);

    expect(targetExts).toContain('xlsx');
    expect(targetExts).toContain('json');
    expect(targetExts).toContain('html');
    expect(targetExts).toContain('pdf');
  });

  it('should return valid target formats for CAD DXF', () => {
    const targets = ConversionMatrix.getCompatibleTargets('dxf');
    const targetExts = targets.map(t => t.extension);

    expect(targetExts).toContain('svg');
    expect(targetExts).toContain('pdf');
    expect(targetExts).toContain('png');
    expect(targetExts).toContain('json');
  });

  it('should compute thousands of conversion pairs', () => {
    const totalPairs = ConversionMatrix.getTotalConversionPairs();
    expect(totalPairs).toBeGreaterThan(500);
  });
});
