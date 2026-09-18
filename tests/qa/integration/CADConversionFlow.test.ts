import { describe, it, expect } from 'vitest';
import { CADEngineAdapter } from '../../../src/infrastructure/adapters/engines/CADEngineAdapter';
import { ConversionJob } from '../../../src/core/domain/entities/ConversionJob';
import { FileItem } from '../../../src/core/domain/entities/FileItem';
import { FormatRegistry } from '../../../src/core/domain/entities/Format';

describe('QA Integration: CAD Vector Conversion Flow', () => {
  const engine = new CADEngineAdapter();

  const sampleDxfContent = `  0
SECTION
  2
ENTITIES
  0
LINE
  8
0
 10
0.0
 20
0.0
 30
0.0
 11
100.0
 21
100.0
 31
0.0
  0
ENDSEC
  0
EOF`;

  it('should parse DXF content and export as SVG vector format', async () => {
    const dxfFile = new File([sampleDxfContent], 'drawing.dxf', { type: 'application/dxf' });
    const sourceFormat = FormatRegistry.get('dxf')!;
    const targetFormat = FormatRegistry.get('svg')!;

    const fileItem = new FileItem(dxfFile, sourceFormat);
    const job = new ConversionJob(fileItem, targetFormat);

    const resultBlob = await engine.convert(job, () => {});
    const svgText = await resultBlob.text();

    expect(svgText).toContain('<svg');
    expect(svgText).toContain('<line');
    expect(resultBlob.type).toBe('image/svg+xml');
  });

  it('should export DXF entity metadata as JSON tree structure', async () => {
    const dxfFile = new File([sampleDxfContent], 'drawing.dxf', { type: 'application/dxf' });
    const sourceFormat = FormatRegistry.get('dxf')!;
    const targetFormat = FormatRegistry.get('json')!;

    const fileItem = new FileItem(dxfFile, sourceFormat);
    const job = new ConversionJob(fileItem, targetFormat);

    const resultBlob = await engine.convert(job, () => {});
    const jsonText = await resultBlob.text();
    const parsed = JSON.parse(jsonText);

    expect(parsed.entities).toBeDefined();
    expect(parsed.entities.length).toBeGreaterThan(0);
    expect(parsed.entities[0].type).toBe('LINE');
  });
});
