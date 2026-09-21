import { IConversionEngine, ProgressCallback, EngineConversionResult } from '../../../core/domain/ports/IConversionEngine';
import { ConversionJob } from '../../../core/domain/entities/ConversionJob';
import { FormatCategory } from '../../../core/domain/entities/Format';
import * as YAML from 'yaml';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import * as XLSX from 'xlsx';

export class DataCodeEngineAdapter implements IConversionEngine {
  readonly id = 'engine-datacode-browser';
  readonly name = 'In-Browser Data, Code & Markup Transformation Engine';
  readonly supportedSourceCategories: readonly FormatCategory[] = ['document'];

  private readonly supportedFormats = ['json', 'yaml', 'yml', 'xml', 'csv', 'tsv', 'sql', 'md', 'html', 'b64'];

  canHandle(sourceExt: string, targetExt: string): boolean {
    const s = sourceExt.toLowerCase().replace(/^\./, '');
    const t = targetExt.toLowerCase().replace(/^\./, '');

    // Base64 encoding/decoding for any document
    if (s === 'b64' || t === 'b64') {
      return true;
    }

    // Bidirectional data conversions
    if (this.supportedFormats.includes(s) && (this.supportedFormats.includes(t) || t === 'xlsx' || t === 'txt')) {
      return true;
    }

    return false;
  }

  async convert(job: ConversionJob, onProgress: ProgressCallback): Promise<EngineConversionResult> {
    const sourceFile = job.sourceFile.file;
    const s = job.sourceFile.rawExtension.toLowerCase();
    const t = job.targetFormat.extension.toLowerCase();
    const baseName = sourceFile.name.substring(0, sourceFile.name.lastIndexOf('.')) || 'data';

    onProgress(15, 'reading', `Reading ${s.toUpperCase()} file into memory...`);

    // Case 1: Base64 encoding/decoding
    if (t === 'b64') {
      onProgress(50, 'encoding', 'Encoding file bytes to Base64...');
      const buffer = await sourceFile.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = '';
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const b64String = btoa(binary);
      const outputBlob = new Blob([b64String], { type: 'text/plain;charset=utf-8' });
      onProgress(100, 'completed', 'Base64 encoding complete');
      return {
        blob: outputBlob,
        outputFileName: `${baseName}.b64`
      };
    }

    if (s === 'b64') {
      onProgress(50, 'decoding', 'Decoding Base64 data...');
      const rawText = (await sourceFile.text()).trim();
      // Strip possible data URI prefix (e.g. data:image/png;base64,...)
      const cleaned = rawText.includes(';base64,') ? rawText.split(';base64,')[1] : rawText;
      const binaryString = atob(cleaned.replace(/\s+/g, ''));
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const outputBlob = new Blob([bytes], { type: job.targetFormat.mimeType || 'application/octet-stream' });
      onProgress(100, 'completed', 'Base64 decode complete');
      return {
        blob: outputBlob,
        outputFileName: `${baseName}.${t === 'b64' ? 'txt' : t}`
      };
    }

    // Read source text
    const textContent = await sourceFile.text();
    onProgress(40, 'parsing', `Parsing structured ${s.toUpperCase()} data...`);

    // Parse source into intermediate JavaScript Object or Array
    const parsedData = this.parseSourceData(textContent, s);

    onProgress(70, 'transforming', `Formatting output as ${t.toUpperCase()}...`);

    // Transform parsed data into target format
    const resultBlob = this.serializeTargetData(parsedData, t, baseName);

    onProgress(100, 'completed', `${s.toUpperCase()} to ${t.toUpperCase()} conversion complete`);
    return {
      blob: resultBlob,
      outputFileName: `${baseName}.${t}`
    };
  }

  private parseSourceData(text: string, sourceExt: string): any {
    switch (sourceExt) {
      case 'json':
        try {
          return JSON.parse(text);
        } catch {
          // If JSON is line-delimited (NDJSON / JSON Lines)
          const lines = text.trim().split('\n').map(l => l.trim()).filter(Boolean);
          return lines.map(l => JSON.parse(l));
        }

      case 'yaml':
      case 'yml':
        return YAML.parse(text);

      case 'xml': {
        const parser = new XMLParser({
          ignoreAttributes: false,
          attributeNamePrefix: '@_',
          parseTagValue: true,
          trimValues: true,
        });
        return parser.parse(text);
      }

      case 'csv':
      case 'tsv': {
        const delimiter = sourceExt === 'tsv' ? '\t' : ',';
        return this.parseDelimitedText(text, delimiter);
      }

      default:
        // Attempt JSON or fallback to line object
        try {
          return JSON.parse(text);
        } catch {
          return { content: text };
        }
    }
  }

  private parseDelimitedText(text: string, delimiter: string): Record<string, string>[] {
    const lines = text.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length === 0) return [];

    const headers = this.parseCsvLine(lines[0], delimiter);
    const result: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCsvLine(lines[i], delimiter);
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        const cleanKey = header.trim() || `column_${index + 1}`;
        row[cleanKey] = values[index] !== undefined ? values[index].trim() : '';
      });
      result.push(row);
    }

    return result;
  }

  private parseCsvLine(line: string, delimiter: string): string[] {
    const entries: string[] = [];
    let insideQuotes = false;
    let current = '';

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === delimiter && !insideQuotes) {
        entries.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    entries.push(current);
    return entries.map(val => val.replace(/^"|"$/g, '').trim());
  }

  private serializeTargetData(data: any, targetExt: string, tableName: string): Blob {
    const normalizedTableName = tableName.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();

    switch (targetExt) {
      case 'json': {
        const jsonStr = JSON.stringify(data, null, 2);
        return new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
      }

      case 'yaml':
      case 'yml': {
        const yamlStr = YAML.stringify(data, { indent: 2 });
        return new Blob([yamlStr], { type: 'application/x-yaml;charset=utf-8' });
      }

      case 'xml': {
        const builder = new XMLBuilder({
          format: true,
          ignoreAttributes: false,
          attributeNamePrefix: '@_',
        });
        const rootWrapped = typeof data === 'object' && data !== null && !Array.isArray(data)
          ? { root: data }
          : { root: { item: data } };
        const xmlStr = `<?xml version="1.0" encoding="UTF-8"?>\n` + builder.build(rootWrapped);
        return new Blob([xmlStr], { type: 'application/xml;charset=utf-8' });
      }

      case 'csv': {
        const csvStr = this.convertToDelimited(data, ',');
        return new Blob([csvStr], { type: 'text/csv;charset=utf-8' });
      }

      case 'tsv': {
        const tsvStr = this.convertToDelimited(data, '\t');
        return new Blob([tsvStr], { type: 'text/tab-separated-values;charset=utf-8' });
      }

      case 'sql': {
        const sqlStr = this.convertToSql(data, normalizedTableName);
        return new Blob([sqlStr], { type: 'application/sql;charset=utf-8' });
      }

      case 'md': {
        const mdStr = this.convertToMarkdownTable(data);
        return new Blob([mdStr], { type: 'text/markdown;charset=utf-8' });
      }

      case 'html': {
        const htmlStr = this.convertToHtmlTable(data, tableName);
        return new Blob([htmlStr], { type: 'text/html;charset=utf-8' });
      }

      case 'xlsx': {
        const rows = Array.isArray(data) ? data : [data];
        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      }

      case 'txt':
      default: {
        const txtStr = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
        return new Blob([txtStr], { type: 'text/plain;charset=utf-8' });
      }
    }
  }

  private convertToDelimited(data: any, delimiter: string): string {
    const rows = this.extractFlatRows(data);
    if (rows.length === 0) return '';

    const headers = Object.keys(rows[0]);
    const headerLine = headers.map(h => this.escapeDelimited(h, delimiter)).join(delimiter);

    const dataLines = rows.map(row => {
      return headers
        .map(h => this.escapeDelimited(String(row[h] !== undefined && row[h] !== null ? row[h] : ''), delimiter))
        .join(delimiter);
    });

    return [headerLine, ...dataLines].join('\n');
  }

  private escapeDelimited(value: string, delimiter: string): string {
    if (value.includes(delimiter) || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  private convertToSql(data: any, tableName: string): string {
    const rows = this.extractFlatRows(data);
    if (rows.length === 0) return `-- No records found to generate SQL table`;

    const headers = Object.keys(rows[0]);
    const createColumns = headers.map(h => `  \`${h.replace(/`/g, '')}\` TEXT`).join(',\n');
    const createTableStmt = `CREATE TABLE IF NOT EXISTS \`${tableName}\` (\n  id INT AUTO_INCREMENT PRIMARY KEY,\n${createColumns}\n);\n\n`;

    const insertStatements = rows.map(row => {
      const colNames = headers.map(h => `\`${h.replace(/`/g, '')}\``).join(', ');
      const colValues = headers
        .map(h => {
          const val = row[h];
          if (val === null || val === undefined) return 'NULL';
          return `'${String(val).replace(/'/g, "''")}'`;
        })
        .join(', ');
      return `INSERT INTO \`${tableName}\` (${colNames}) VALUES (${colValues});`;
    });

    return `-- Generated by Neofile (Zero-Server In-Browser Engine)\n` + createTableStmt + insertStatements.join('\n') + '\n';
  }

  private convertToMarkdownTable(data: any): string {
    const rows = this.extractFlatRows(data);
    if (rows.length === 0) return `*No structured rows to display in table format.*`;

    const headers = Object.keys(rows[0]);
    const headerRow = `| ${headers.join(' | ')} |`;
    const separatorRow = `| ${headers.map(() => ':---').join(' | ')} |`;

    const bodyRows = rows.map(row => {
      const values = headers.map(h => {
        const val = row[h];
        return String(val !== undefined && val !== null ? val : '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
      });
      return `| ${values.join(' | ')} |`;
    });

    return [headerRow, separatorRow, ...bodyRows].join('\n');
  }

  private convertToHtmlTable(data: any, title: string): string {
    const rows = this.extractFlatRows(data);
    const headers = rows.length > 0 ? Object.keys(rows[0]) : [];

    const tableHeaderHtml = headers.map(h => `        <th style="padding: 10px 14px; background: #f1f5f9; border-bottom: 2px solid #cbd5e1; text-align: left; font-family: monospace;">${this.escapeHtml(h)}</th>`).join('\n');

    const tableRowsHtml = rows.map((row, idx) => {
      const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
      const cells = headers.map(h => {
        const val = row[h] !== undefined && row[h] !== null ? String(row[h]) : '';
        return `        <td style="padding: 8px 14px; border-bottom: 1px solid #e2e8f0;">${this.escapeHtml(val)}</td>`;
      }).join('\n');
      return `      <tr style="background: ${bg};">\n${cells}\n      </tr>`;
    }).join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${this.escapeHtml(title)} - Neofile Table Export</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; padding: 2rem; color: #1e293b; background: #ffffff; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 1rem; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
  </style>
</head>
<body>
  <h2>${this.escapeHtml(title)}</h2>
  <table>
    <thead>
      <tr>
${tableHeaderHtml}
      </tr>
    </thead>
    <tbody>
${tableRowsHtml}
    </tbody>
  </table>
</body>
</html>`;
  }

  private extractFlatRows(data: any): Record<string, any>[] {
    if (Array.isArray(data)) {
      return data.map(item => {
        if (typeof item === 'object' && item !== null) {
          return this.flattenObject(item);
        }
        return { value: item };
      });
    }

    if (typeof data === 'object' && data !== null) {
      // If object has a root array property (e.g. { items: [...], data: [...] })
      for (const key of Object.keys(data)) {
        if (Array.isArray(data[key])) {
          return this.extractFlatRows(data[key]);
        }
      }
      return [this.flattenObject(data)];
    }

    return [{ value: data }];
  }

  private flattenObject(obj: Record<string, any>, prefix = ''): Record<string, any> {
    const flattened: Record<string, any> = {};

    for (const [key, value] of Object.entries(obj)) {
      const propName = prefix ? `${prefix}.${key}` : key;
      if (typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date)) {
        Object.assign(flattened, this.flattenObject(value, propName));
      } else if (Array.isArray(value)) {
        flattened[propName] = JSON.stringify(value);
      } else {
        flattened[propName] = value;
      }
    }

    return flattened;
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
