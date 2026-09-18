import { FormatDefinition } from './Format';

export interface FileMetadata {
  readonly width?: number;
  readonly height?: number;
  readonly durationSeconds?: number;
  readonly pageCount?: number;
  readonly lineCount?: number;
  readonly hasAudio?: boolean;
  readonly hasVideo?: boolean;
}

export class FileItem {
  readonly id: string;
  readonly file: File;
  readonly name: string;
  readonly size: number;
  readonly rawExtension: string;
  readonly format?: FormatDefinition;
  readonly metadata?: FileMetadata;
  readonly previewUrl?: string;

  constructor(file: File, format?: FormatDefinition, metadata?: FileMetadata) {
    this.id = `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    this.file = file;
    this.name = file.name;
    this.size = file.size;
    const parts = file.name.split('.');
    this.rawExtension = parts.length > 1 ? parts.pop()!.toLowerCase() : '';
    this.format = format;
    this.metadata = metadata;
    
    // Generate object URL for image/video preview if possible
    if (file.type.startsWith('image/') || file.type.startsWith('video/') || file.type.startsWith('audio/')) {
      try {
        this.previewUrl = URL.createObjectURL(file);
      } catch {
        this.previewUrl = undefined;
      }
    }
  }

  static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  get formattedSize(): string {
    return FileItem.formatBytes(this.size);
  }

  revokePreview(): void {
    if (this.previewUrl) {
      try {
        URL.revokeObjectURL(this.previewUrl);
      } catch {
        // Ignore cleanup errors
      }
    }
  }
}
