export interface ImageOptions {
  quality?: number; // 0.1 - 1.0
  width?: number;
  height?: number;
  maintainAspectRatio?: boolean;
  backgroundColor?: string;
}

export interface AudioVideoOptions {
  audioBitrate?: string; // '128k', '192k', '320k'
  sampleRate?: number;   // 44100, 48000
  channels?: 1 | 2;      // mono / stereo
  videoQuality?: 'low' | 'medium' | 'high';
}

export interface DocumentOptions {
  orientation?: 'portrait' | 'landscape';
  pageSize?: 'a4' | 'letter' | 'legal';
  encoding?: 'utf-8' | 'iso-8859-1' | 'windows-1252';
  delimiter?: ',' | ';' | '\t' | '|';
}

export interface ArchiveOptions {
  compressionLevel?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
}

export interface ConversionOptions {
  image?: ImageOptions;
  audioVideo?: AudioVideoOptions;
  document?: DocumentOptions;
  archive?: ArchiveOptions;
}
