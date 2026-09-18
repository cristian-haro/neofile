import { describe, it, expect } from 'vitest';
import { FormatRegistry } from '../../../../src/core/domain/entities/Format';

describe('FormatRegistry (Domain Entity)', () => {
  it('should retrieve definitions for all primary categories', () => {
    // Audio
    expect(FormatRegistry.get('mp3')?.category).toBe('audio');
    expect(FormatRegistry.get('wav')?.category).toBe('audio');
    expect(FormatRegistry.get('flac')?.category).toBe('audio');

    // Video
    expect(FormatRegistry.get('mp4')?.category).toBe('video');
    expect(FormatRegistry.get('mkv')?.category).toBe('video');
    expect(FormatRegistry.get('webm')?.category).toBe('video');

    // Image
    expect(FormatRegistry.get('png')?.category).toBe('image');
    expect(FormatRegistry.get('jpg')?.category).toBe('image');
    expect(FormatRegistry.get('webp')?.category).toBe('image');
    expect(FormatRegistry.get('svg')?.category).toBe('image');

    // Document
    expect(FormatRegistry.get('pdf')?.category).toBe('document');
    expect(FormatRegistry.get('docx')?.category).toBe('document');
    expect(FormatRegistry.get('xlsx')?.category).toBe('document');
    expect(FormatRegistry.get('csv')?.category).toBe('document');

    // CAD
    expect(FormatRegistry.get('dxf')?.category).toBe('cad');
    expect(FormatRegistry.get('dwg')?.category).toBe('cad');

    // Compressed
    expect(FormatRegistry.get('zip')?.category).toBe('compressed');
    expect(FormatRegistry.get('7z')?.category).toBe('compressed');
    expect(FormatRegistry.get('tar')?.category).toBe('compressed');

    // eBook
    expect(FormatRegistry.get('epub')?.category).toBe('ebook');
    expect(FormatRegistry.get('mobi')?.category).toBe('ebook');
    expect(FormatRegistry.get('cbz')?.category).toBe('ebook');
  });

  it('should handle case insensitivity and leading dots', () => {
    expect(FormatRegistry.get('.PNG')).toBeDefined();
    expect(FormatRegistry.get('.PNG')?.extension).toBe('png');
    expect(FormatRegistry.get('MP4')?.extension).toBe('mp4');
    expect(FormatRegistry.get('.FlAc')?.extension).toBe('flac');
  });

  it('should list all registered formats', () => {
    const all = FormatRegistry.getAll();
    expect(all.length).toBeGreaterThanOrEqual(70);
  });

  it('should verify support status correctly', () => {
    expect(FormatRegistry.isSupported('png')).toBe(true);
    expect(FormatRegistry.isSupported('.docx')).toBe(true);
    expect(FormatRegistry.isSupported('unsupported_xyz_format')).toBe(false);
  });
});
