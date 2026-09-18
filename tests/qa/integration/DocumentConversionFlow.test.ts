import { describe, it, expect } from 'vitest';
import { DocumentEngineAdapter } from '../../../src/infrastructure/adapters/engines/DocumentEngineAdapter';
import { ConversionJob } from '../../../src/core/domain/entities/ConversionJob';
import { FileItem } from '../../../src/core/domain/entities/FileItem';
import { FormatRegistry } from '../../../src/core/domain/entities/Format';

describe('QA Integration: Document Conversion Flow', () => {
  const engine = new DocumentEngineAdapter();

  it('should convert CSV data to JSON structure client-side', async () => {
    const csvContent = 'name,role,department\nAlice,Architect,Engineering\nBob,Tester,QA';
    const csvFile = new File([csvContent], 'employees.csv', { type: 'text/csv' });

    const sourceFormat = FormatRegistry.get('csv')!;
    const targetFormat = FormatRegistry.get('json')!;

    const fileItem = new FileItem(csvFile, sourceFormat);
    const job = new ConversionJob(fileItem, targetFormat);

    const result = await engine.convert(job, () => {});
    const resultBlob = result instanceof Blob ? result : result.blob;
    const resultText = await resultBlob.text();
    const parsed = JSON.parse(resultText);

    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBe(2);
    expect(parsed[0].name).toBe('Alice');
    expect(parsed[1].role).toBe('Tester');
  });

  it('should convert Markdown text to PDF blob client-side', async () => {
    const mdContent = '# Architecture Overview\nThis document is converted entirely inside the client memory.';
    const mdFile = new File([mdContent], 'architecture.md', { type: 'text/markdown' });

    const sourceFormat = FormatRegistry.get('md')!;
    const targetFormat = FormatRegistry.get('pdf')!;

    const fileItem = new FileItem(mdFile, sourceFormat);
    const job = new ConversionJob(fileItem, targetFormat);

    const result = await engine.convert(job, () => {});
    const resultBlob = result instanceof Blob ? result : result.blob;
    expect(resultBlob.size).toBeGreaterThan(100);
    expect(resultBlob.type).toBe('application/pdf');
  });

  it('should convert PDF to Microsoft Word (.docx) document', async () => {
    const pdfContent = '%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\nBT /F1 12 Tf (Hello World from PDF Document) Tj ET\n%%EOF';
    const pdfFile = new File([pdfContent], 'document.pdf', { type: 'application/pdf' });
    const job = new ConversionJob(
      new FileItem(pdfFile, FormatRegistry.get('pdf')),
      FormatRegistry.get('docx')!
    );

    const result = await engine.convert(job, () => {});
    const blob = result instanceof Blob ? result : result.blob;
    expect(blob.size).toBeGreaterThan(500);
  });
});
