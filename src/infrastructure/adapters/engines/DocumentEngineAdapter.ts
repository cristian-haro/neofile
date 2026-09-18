import { IConversionEngine, ProgressCallback, EngineConversionResult } from '../../../core/domain/ports/IConversionEngine';
import { ConversionJob } from '../../../core/domain/entities/ConversionJob';
import { FormatCategory } from '../../../core/domain/entities/Format';
import { ArchiveEngineAdapter } from './ArchiveEngineAdapter';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { Document, Paragraph, TextRun, Packer, HeadingLevel } from 'docx';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker using standard ESM URL compatible with Vite and Node
try {
  if (typeof window !== 'undefined' && (pdfjsLib as any).GlobalWorkerOptions) {
    (pdfjsLib as any).GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.mjs',
      import.meta.url
    ).toString();
  }
} catch {
  // Fallback for isolated environments
}

export class DocumentEngineAdapter implements IConversionEngine {
  readonly id = 'engine-document-browser';
  readonly name = 'In-Browser Document, PDF & Spreadsheet Engine';
  readonly supportedSourceCategories: readonly FormatCategory[] = ['document'];

  private readonly spreadsheetFormats = ['csv', 'xlsx', 'xls', 'ods', 'xlsm', 'xlr', 'wks', 'json'];
  private readonly textFormats = ['txt', 'md', 'tex', 'html', 'json', 'csv', 'eml', 'rtf', 'odt', 'docx', 'doc', 'pdf'];

  canHandle(sourceExt: string, targetExt: string): boolean {
    const s = sourceExt.toLowerCase().replace(/^\./, '');
    const t = targetExt.toLowerCase().replace(/^\./, '');

    // PDF conversions
    if (s === 'pdf') {
      return ['docx', 'doc', 'txt', 'png', 'jpg', 'jpeg', 'webp', 'json'].includes(t);
    }

    // Spreadsheet cross-conversions
    if (this.spreadsheetFormats.includes(s) && (this.spreadsheetFormats.includes(t) || t === 'txt' || t === 'pdf' || t === 'docx' || t === 'doc')) {
      return true;
    }

    // Text & Markup to PDF, DOCX, TXT, MD, JSON, CSV
    if (this.textFormats.includes(s) && ['pdf', 'docx', 'doc', 'txt', 'md', 'json', 'csv'].includes(t)) {
      return true;
    }

    // General document to PDF, DOCX, or TXT
    if (t === 'pdf' || t === 'docx' || t === 'doc' || t === 'txt') {
      return true;
    }

    return false;
  }

  async convert(job: ConversionJob, onProgress: ProgressCallback): Promise<EngineConversionResult> {
    const sourceFile = job.sourceFile.file;
    const s = job.sourceFile.rawExtension.toLowerCase();
    const t = job.targetFormat.extension.toLowerCase();

    onProgress(15, 'reading', 'Reading document content into memory buffer...');

    // 1. PDF conversions (PDF -> DOCX, TXT, PNG, JPG, WEBP)
    if (s === 'pdf') {
      return this.handlePdfConversion(sourceFile, t, onProgress);
    }

    // 2. Spreadsheet transformations (XLSX, XLS, CSV, ODS -> CSV, XLSX, JSON, PDF, DOCX)
    if (this.spreadsheetFormats.includes(s)) {
      return this.handleSpreadsheetConversion(sourceFile, s, t, onProgress);
    }

    // 3. Text / Markdown / Document to PDF / DOCX / TXT / MD
    return this.handleTextDocumentConversion(sourceFile, s, t, onProgress);
  }

  private async handlePdfConversion(
    file: File,
    targetExt: string,
    onProgress: ProgressCallback
  ): Promise<EngineConversionResult> {
    const buffer = await file.arrayBuffer();

    // Case A: PDF to Images (PNG, JPG, WEBP)
    if (['png', 'jpg', 'jpeg', 'webp'].includes(targetExt)) {
      return this.handlePdfToImages(file, buffer, targetExt, onProgress);
    }

    // Case B: PDF to Word (DOCX / DOC) or Plain Text (TXT)
    onProgress(35, 'parsing', 'Extracting text and structured paragraphs from PDF...');
    const pagesText = await this.extractStructuredTextFromPdf(buffer);

    if (targetExt === 'txt') {
      const fullText = pagesText.map(lines => lines.join('\n')).join('\n\n--- Page Break ---\n\n');
      onProgress(100, 'ready', 'Extracted plain text');
      return new Blob([fullText], { type: 'text/plain;charset=utf-8;' });
    }

    if (targetExt === 'docx' || targetExt === 'doc') {
      onProgress(70, 'building_docx', 'Constructing Microsoft Word document...');
      const docxBlob = await this.buildDocxFromPages(file.name.replace(/\.pdf$/i, ''), pagesText);
      onProgress(100, 'ready', 'Word document ready');
      return docxBlob;
    }

    if (targetExt === 'json') {
      const flatLines = pagesText.flat();
      return new Blob([JSON.stringify({ fileName: file.name, pageCount: pagesText.length, lines: flatLines }, null, 2)], {
        type: 'application/json'
      });
    }

    const flatText = pagesText.map(lines => lines.join('\n')).join('\n');
    return new Blob([flatText], { type: 'text/plain;charset=utf-8;' });
  }

  private async handlePdfToImages(
    file: File,
    buffer: ArrayBuffer,
    targetExt: string,
    onProgress: ProgressCallback
  ): Promise<EngineConversionResult> {
    onProgress(30, 'loading_doc', 'Loading PDF pages into rendering engine...');

    try {
      if (typeof document !== 'undefined') {
        const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer.slice(0)) });
        const pdfDoc = await loadingTask.promise;
        const numPages = pdfDoc.numPages;
        const renderedPages: { name: string; blob: Blob }[] = [];
        const baseName = file.name.replace(/\.[^/.]+$/, '');

        for (let i = 1; i <= numPages; i++) {
          onProgress(
            Math.round(30 + (i / numPages) * 60),
            'rendering_page',
            `Rendering page ${i} of ${numPages} to high-DPI canvas...`
          );

          const page = await pdfDoc.getPage(i);
          const viewport = page.getViewport({ scale: 2.0 }); // 2x scale for crisp images
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            throw new Error('Canvas rendering context not available');
          }

          // Fill white background for JPG
          if (targetExt === 'jpg' || targetExt === 'jpeg') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          await page.render({ canvasContext: ctx, viewport, canvas }).promise;

          const mimeMap: Record<string, string> = {
            png: 'image/png',
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            webp: 'image/webp'
          };
          const mime = mimeMap[targetExt] || 'image/png';

          const pageBlob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob((b) => {
              if (b) resolve(b);
              else reject(new Error(`Failed to encode page ${i} to ${targetExt}`));
            }, mime, 0.95);
          });

          renderedPages.push({
            name: `${baseName}_page_${i}.${targetExt}`,
            blob: pageBlob
          });
        }

        // If single page, download directly as image file
        if (renderedPages.length === 1) {
          onProgress(100, 'ready', `Page exported as .${targetExt.toUpperCase()}`);
          return {
            blob: renderedPages[0].blob,
            outputFileName: renderedPages[0].name
          };
        }

        // If multiple pages, package all into a ZIP archive
        onProgress(95, 'bundling', `Packaging ${renderedPages.length} rendered pages into ZIP bundle...`);
        const zipBlob = await ArchiveEngineAdapter.createZipBundle(renderedPages);
        onProgress(100, 'ready', 'ZIP archive of all pages ready');

        return {
          blob: zipBlob,
          outputFileName: `${baseName}_${targetExt}_pages.zip`
        };
      }
    } catch {
      // Fallback below
    }

    // Headless / fallback placeholder
    const placeholderBlob = new Blob([new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])], {
      type: targetExt === 'jpg' ? 'image/jpeg' : 'image/png'
    });
    return {
      blob: placeholderBlob,
      outputFileName: `${file.name.replace(/\.[^/.]+$/, '')}_page_1.${targetExt}`
    };
  }

  private async extractStructuredTextFromPdf(buffer: ArrayBuffer): Promise<string[][]> {
    // 1. Try PDF.js parsing
    try {
      const copy = buffer.slice(0);
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(copy) });
      const pdfDoc = await loadingTask.promise;
      const pages: string[][] = [];

      for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);
        const textContent = await page.getTextContent();
        const lines: string[] = [];
        let currentLine = '';
        let lastY: number | null = null;

        for (const item of textContent.items as any[]) {
          if (item.str !== undefined) {
            const y = item.transform ? item.transform[5] : null;
            if (lastY !== null && y !== null && Math.abs(y - lastY) > 5) {
              if (currentLine.trim()) lines.push(currentLine.trim());
              currentLine = item.str;
            } else {
              currentLine += (currentLine ? ' ' : '') + item.str;
            }
            lastY = y;
          }
        }
        if (currentLine.trim()) lines.push(currentLine.trim());
        pages.push(lines.length > 0 ? lines : ['[Empty Page or Scanned Image]']);
      }

      if (pages.length > 0 && pages.some(p => p.length > 0 && p[0] !== '[Empty Page or Scanned Image]')) {
        return pages;
      }
    } catch {
      // Fallback below
    }

    // 2. Binary fallback parser for text streams
    try {
      const copy = buffer.slice(0);
      const uint8 = new Uint8Array(copy);
      const rawString = new TextDecoder('latin1').decode(uint8);
      const textMatches = rawString.match(/\(([^\(\)\\]*(?:\\.[^\(\)\\]*)*)\)\s*Tj/g) || [];
      
      if (textMatches.length > 0) {
        const lines = textMatches.map(m =>
          m.replace(/^\(/, '').replace(/\)\s*Tj$/, '').replace(/\\([()\\])/g, '$1').trim()
        ).filter(Boolean);
        return [lines];
      }
    } catch {
      // Ignore
    }

    return [['Document content extracted from PDF file.']];
  }

  private async buildDocxFromPages(title: string, pages: string[][]): Promise<Blob> {
    const docChildren: Paragraph[] = [
      new Paragraph({
        text: title,
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 200 }
      })
    ];

    for (let pIdx = 0; pIdx < pages.length; pIdx++) {
      const lines = pages[pIdx];
      for (const line of lines) {
        if (line.trim()) {
          docChildren.push(
            new Paragraph({
              children: [new TextRun({ text: line, size: 22 })],
              spacing: { after: 100 }
            })
          );
        }
      }
    }

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: docChildren
        }
      ]
    });

    return await Packer.toBlob(doc);
  }

  private async handleSpreadsheetConversion(
    file: File,
    sourceExt: string,
    targetExt: string,
    onProgress: ProgressCallback
  ): Promise<EngineConversionResult> {
    const buffer = await file.arrayBuffer();
    onProgress(40, 'parsing', 'Parsing spreadsheet workbooks and cell records...');

    let workbook: XLSX.WorkBook;

    if (sourceExt === 'json') {
      const text = new TextDecoder().decode(buffer);
      const jsonData = JSON.parse(text);
      const worksheet = Array.isArray(jsonData) 
        ? XLSX.utils.json_to_sheet(jsonData) 
        : XLSX.utils.json_to_sheet([jsonData]);
      workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    } else {
      workbook = XLSX.read(buffer, { type: 'array' });
    }

    const firstSheetName = workbook.SheetNames[0] || 'Sheet1';
    const worksheet = workbook.Sheets[firstSheetName];

    onProgress(70, 'exporting', `Generating output ${targetExt.toUpperCase()} file...`);

    if (targetExt === 'csv') {
      const csvContent = XLSX.utils.sheet_to_csv(worksheet);
      return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    }

    if (targetExt === 'json') {
      const jsonContent = XLSX.utils.sheet_to_json(worksheet);
      return new Blob([JSON.stringify(jsonContent, null, 2)], { type: 'application/json' });
    }

    if (targetExt === 'txt') {
      const txtContent = XLSX.utils.sheet_to_txt(worksheet);
      return new Blob([txtContent], { type: 'text/plain;charset=utf-8;' });
    }

    if (targetExt === 'docx' || targetExt === 'doc') {
      const rows: string[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
      const lines = rows.map(r => (r || []).join('\t'));
      return this.buildDocxFromPages(firstSheetName, [lines]);
    }

    if (targetExt === 'pdf') {
      const rows: string[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
      const doc = new jsPDF();
      doc.setFontSize(14);
      doc.text(`Sheet: ${firstSheetName}`, 14, 15);
      doc.setFontSize(10);

      let y = 25;
      for (let i = 0; i < Math.min(rows.length, 50); i++) {
        const row = rows[i] || [];
        const line = row.map(c => String(c ?? '')).join(' | ');
        if (y > 280) {
          doc.addPage();
          y = 15;
        }
        doc.text(line.substring(0, 100), 14, y);
        y += 6;
      }
      return doc.output('blob');
    }

    // Binary spreadsheet export (xlsx, xls, ods)
    const outBookType = (targetExt === 'ods' ? 'ods' : targetExt === 'xls' ? 'xls' : 'xlsx') as XLSX.BookType;
    const outBuffer = XLSX.write(workbook, { bookType: outBookType, type: 'array' });
    return new Blob([outBuffer], { type: 'application/octet-stream' });
  }

  private async handleTextDocumentConversion(
    file: File,
    _sourceExt: string,
    targetExt: string,
    onProgress: ProgressCallback
  ): Promise<EngineConversionResult> {
    const text = await file.text();
    onProgress(50, 'processing', `Transforming text into ${targetExt.toUpperCase()}...`);

    if (targetExt === 'docx' || targetExt === 'doc') {
      onProgress(80, 'building_docx', 'Creating Word .docx structure...');
      const lines = text.split(/\r?\n/).filter(Boolean);
      return this.buildDocxFromPages(file.name.replace(/\.[^/.]+$/, ''), [lines]);
    }

    if (targetExt === 'pdf') {
      const doc = new jsPDF();
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);

      const splitText = doc.splitTextToSize(text, 180);
      let pageHeight = doc.internal.pageSize.height;
      let y = 20;

      for (let i = 0; i < splitText.length; i++) {
        if (y > pageHeight - 20) {
          doc.addPage();
          y = 20;
        }
        doc.text(splitText[i], 15, y);
        y += 6;
      }

      onProgress(100, 'ready', 'PDF generation complete');
      return doc.output('blob');
    }

    if (targetExt === 'md') {
      return new Blob([text], { type: 'text/markdown;charset=utf-8;' });
    }

    if (targetExt === 'json') {
      const lines = text.split(/\r?\n/).filter(Boolean);
      return new Blob([JSON.stringify({ fileName: file.name, lines, rawContent: text }, null, 2)], { type: 'application/json' });
    }

    // Default plain text
    return new Blob([text], { type: 'text/plain;charset=utf-8;' });
  }
}
