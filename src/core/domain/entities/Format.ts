export type FormatCategory = 
  | 'audio' 
  | 'video' 
  | 'image' 
  | 'document' 
  | 'ebook' 
  | 'compressed' 
  | 'cad';

export interface FormatDefinition {
  readonly extension: string;
  readonly name: string;
  readonly description: string;
  readonly category: FormatCategory;
  readonly mimeType: string;
  readonly magicBytes?: number[];
  readonly isLossless?: boolean;
}

export const FORMAT_REGISTRY: Record<string, FormatDefinition> = {
  // --- AUDIO ---
  '3ga': { extension: '3ga', name: '3GA', description: '3GA Multimedia Audio File', category: 'audio', mimeType: 'audio/3gpp' },
  'aac': { extension: 'aac', name: 'AAC', description: 'Advanced Audio Coding File', category: 'audio', mimeType: 'audio/aac' },
  'ac3': { extension: 'ac3', name: 'AC3', description: 'AC3 Audio File', category: 'audio', mimeType: 'audio/ac3' },
  'aiff': { extension: 'aiff', name: 'AIFF', description: 'Audio Interchange File Format', category: 'audio', mimeType: 'audio/aiff', isLossless: true },
  'flac': { extension: 'flac', name: 'FLAC', description: 'Free Lossless Audio Codec', category: 'audio', mimeType: 'audio/flac', isLossless: true },
  'm4a': { extension: 'm4a', name: 'M4A', description: 'MPEG-4 Audio File', category: 'audio', mimeType: 'audio/mp4' },
  'm4r': { extension: 'm4r', name: 'M4R', description: 'iPhone Ringtone File', category: 'audio', mimeType: 'audio/x-m4r' },
  'midi': { extension: 'midi', name: 'MIDI', description: 'Musical Instrument Digital Interface', category: 'audio', mimeType: 'audio/midi' },
  'mp3': { extension: 'mp3', name: 'MP3', description: 'MPEG Audio Layer III', category: 'audio', mimeType: 'audio/mpeg' },
  'ogg': { extension: 'ogg', name: 'OGG', description: 'Ogg Vorbis Compressed Audio File', category: 'audio', mimeType: 'audio/ogg' },
  'ra': { extension: 'ra', name: 'RA', description: 'RealMedia Streaming Media Audio', category: 'audio', mimeType: 'audio/x-pn-realaudio' },
  'ram': { extension: 'ram', name: 'RAM', description: 'RealMedia Metafile', category: 'audio', mimeType: 'audio/x-pn-realaudio' },
  'wav': { extension: 'wav', name: 'WAV', description: 'Waveform Audio File Format', category: 'audio', mimeType: 'audio/wav', isLossless: true },
  'wma': { extension: 'wma', name: 'WMA', description: 'Windows Media Audio', category: 'audio', mimeType: 'audio/x-ms-wma' },

  // --- CAD ---
  'dwg': { extension: 'dwg', name: 'DWG', description: 'AutoCAD Drawing Database', category: 'cad', mimeType: 'application/acad' },
  'dxf': { extension: 'dxf', name: 'DXF', description: 'AutoCAD Drawing Interchange Format', category: 'cad', mimeType: 'application/dxf' },

  // --- COMPRESSED / ARCHIVE ---
  '7z': { extension: '7z', name: '7Z', description: '7-Zip Compressed File', category: 'compressed', mimeType: 'application/x-7z-compressed' },
  'cab': { extension: 'cab', name: 'CAB', description: 'Cabinet Archive File', category: 'compressed', mimeType: 'application/vnd.ms-cab-compressed' },
  'lzh': { extension: 'lzh', name: 'LZH', description: 'Compressed Archive File', category: 'compressed', mimeType: 'application/x-lzh-compressed' },
  'rar': { extension: 'rar', name: 'RAR', description: 'WinRAR Compressed Archive', category: 'compressed', mimeType: 'application/vnd.rar' },
  'tar': { extension: 'tar', name: 'TAR', description: 'Tape Archive File', category: 'compressed', mimeType: 'application/x-tar' },
  'tar.bz2': { extension: 'tar.bz2', name: 'TAR.BZ2', description: 'Bzip2 UNIX Compressed Archive', category: 'compressed', mimeType: 'application/x-bzip2' },
  'tar.gz': { extension: 'tar.gz', name: 'TAR.GZ', description: 'Gzip Compressed Tar Archive', category: 'compressed', mimeType: 'application/gzip' },
  'yz1': { extension: 'yz1', name: 'YZ1', description: 'DeepFreezer Compressed Archive', category: 'compressed', mimeType: 'application/octet-stream' },
  'zip': { extension: 'zip', name: 'ZIP', description: 'ZIP Compressed Archive', category: 'compressed', mimeType: 'application/zip' },

  // --- DOCUMENT ---
  'csv': { extension: 'csv', name: 'CSV', description: 'Comma Separated Values', category: 'document', mimeType: 'text/csv' },
  'djvu': { extension: 'djvu', name: 'DJVU', description: 'DjVu Scanned Document', category: 'document', mimeType: 'image/vnd.djvu' },
  'doc': { extension: 'doc', name: 'DOC', description: 'Microsoft Word Document (Legacy)', category: 'document', mimeType: 'application/msword' },
  'docm': { extension: 'docm', name: 'DOCM', description: 'Microsoft Word Macro-Enabled Document', category: 'document', mimeType: 'application/vnd.ms-word.document.macroEnabled.12' },
  'docx': { extension: 'docx', name: 'DOCX', description: 'Microsoft Word OpenXML Document', category: 'document', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
  'eml': { extension: 'eml', name: 'EML', description: 'E-mail Message RFC 822 format', category: 'document', mimeType: 'message/rfc822' },
  'eps': { extension: 'eps', name: 'EPS', description: 'Encapsulated PostScript', category: 'document', mimeType: 'application/postscript' },
  'md': { extension: 'md', name: 'MD', description: 'Markdown plain text document', category: 'document', mimeType: 'text/markdown' },
  'msg': { extension: 'msg', name: 'MSG', description: 'Outlook E-mail Message', category: 'document', mimeType: 'application/vnd.ms-outlook' },
  'odp': { extension: 'odp', name: 'ODP', description: 'OpenDocument Presentation', category: 'document', mimeType: 'application/vnd.oasis.opendocument.presentation' },
  'ods': { extension: 'ods', name: 'ODS', description: 'OpenDocument Spreadsheet', category: 'document', mimeType: 'application/vnd.oasis.opendocument.spreadsheet' },
  'odt': { extension: 'odt', name: 'ODT', description: 'OpenDocument Text Document', category: 'document', mimeType: 'application/vnd.oasis.opendocument.text' },
  'pdf': { extension: 'pdf', name: 'PDF', description: 'Portable Document Format', category: 'document', mimeType: 'application/pdf' },
  'pps': { extension: 'pps', name: 'PPS', description: 'Microsoft PowerPoint Presentation Slide Show', category: 'document', mimeType: 'application/vnd.ms-powerpoint' },
  'ppsx': { extension: 'ppsx', name: 'PPSX', description: 'Microsoft PowerPoint 2007+ Slide Show', category: 'document', mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.slideshow' },
  'ppt': { extension: 'ppt', name: 'PPT', description: 'Microsoft PowerPoint Presentation', category: 'document', mimeType: 'application/vnd.ms-powerpoint' },
  'pptm': { extension: 'pptm', name: 'PPTM', description: 'Microsoft PowerPoint Macro-Enabled Presentation', category: 'document', mimeType: 'application/vnd.ms-powerpoint.presentation.macroEnabled.12' },
  'pptx': { extension: 'pptx', name: 'PPTX', description: 'Microsoft PowerPoint 2007+ Presentation', category: 'document', mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' },
  'ps': { extension: 'ps', name: 'PS', description: 'PostScript Document', category: 'document', mimeType: 'application/postscript' },
  'pub': { extension: 'pub', name: 'PUB', description: 'Microsoft Publisher Document', category: 'document', mimeType: 'application/x-mspublisher' },
  'rtf': { extension: 'rtf', name: 'RTF', description: 'Rich Text Format', category: 'document', mimeType: 'application/rtf' },
  'tex': { extension: 'tex', name: 'TEX', description: 'LaTeX typesetting source file', category: 'document', mimeType: 'application/x-tex' },
  'txt': { extension: 'txt', name: 'TXT', description: 'Plain Text Document', category: 'document', mimeType: 'text/plain' },
  'wks': { extension: 'wks', name: 'WKS', description: 'Microsoft Works Spreadsheet', category: 'document', mimeType: 'application/vnd.ms-works' },
  'wpd': { extension: 'wpd', name: 'WPD', description: 'WordPerfect Document', category: 'document', mimeType: 'application/wordperfect' },
  'wps': { extension: 'wps', name: 'WPS', description: 'Microsoft Works Document', category: 'document', mimeType: 'application/vnd.ms-works' },
  'xlr': { extension: 'xlr', name: 'XLR', description: 'Works Spreadsheet or Chart', category: 'document', mimeType: 'application/x-excel' },
  'xls': { extension: 'xls', name: 'XLS', description: 'Microsoft Excel Spreadsheet (Legacy)', category: 'document', mimeType: 'application/vnd.ms-excel' },
  'xlsm': { extension: 'xlsm', name: 'XLSM', description: 'Microsoft Excel Macro-Enabled Spreadsheet', category: 'document', mimeType: 'application/vnd.ms-excel.sheet.macroEnabled.12' },
  'xlsx': { extension: 'xlsx', name: 'XLSX', description: 'Microsoft Excel OpenXML Spreadsheet', category: 'document', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
  'xps': { extension: 'xps', name: 'XPS', description: 'Open XML Paper Specification', category: 'document', mimeType: 'application/oxps' },
  'json': { extension: 'json', name: 'JSON', description: 'JavaScript Object Notation Data', category: 'document', mimeType: 'application/json' },
  'html': { extension: 'html', name: 'HTML', description: 'HyperText Markup Language', category: 'document', mimeType: 'text/html' },

  // --- E-BOOK ---
  'azw': { extension: 'azw', name: 'AZW', description: 'Amazon Kindle eBook File', category: 'ebook', mimeType: 'application/vnd.amazon.ebook' },
  'azw3': { extension: 'azw3', name: 'AZW3', description: 'Amazon KF8 eBook File', category: 'ebook', mimeType: 'application/vnd.amazon.ebook' },
  'cbc': { extension: 'cbc', name: 'CBC', description: 'eBook Comic Format', category: 'ebook', mimeType: 'application/octet-stream' },
  'cbr': { extension: 'cbr', name: 'CBR', description: 'Comic Book RAR Archive', category: 'ebook', mimeType: 'application/x-cbr' },
  'cbz': { extension: 'cbz', name: 'CBZ', description: 'Comic Book ZIP Archive', category: 'ebook', mimeType: 'application/x-cbz' },
  'chm': { extension: 'chm', name: 'CHM', description: 'Compiled HTML Help File', category: 'ebook', mimeType: 'application/vnd.ms-htmlhelp' },
  'epub': { extension: 'epub', name: 'EPUB', description: 'Open Electronic Publication eBook', category: 'ebook', mimeType: 'application/epub+zip' },
  'fb2': { extension: 'fb2', name: 'FB2', description: 'FictionBook 2.0 File', category: 'ebook', mimeType: 'application/x-fictionbook+xml' },
  'lit': { extension: 'lit', name: 'LIT', description: 'Microsoft eBook File', category: 'ebook', mimeType: 'application/x-ms-reader' },
  'lrf': { extension: 'lrf', name: 'LRF', description: 'Sony Portable Reader File', category: 'ebook', mimeType: 'application/x-sony-bbeb' },
  'mobi': { extension: 'mobi', name: 'MOBI', description: 'Mobipocket eBook', category: 'ebook', mimeType: 'application/x-mobipocket-ebook' },
  'pdb': { extension: 'pdb', name: 'PDB', description: 'Palm Media eBook File', category: 'ebook', mimeType: 'application/vnd.palm' },
  'pml': { extension: 'pml', name: 'PML', description: 'Palm Markup Language eBook', category: 'ebook', mimeType: 'application/x-pml' },
  'prc': { extension: 'prc', name: 'PRC', description: 'Mobipocket eBook Container', category: 'ebook', mimeType: 'application/x-mobipocket-ebook' },
  'rb': { extension: 'rb', name: 'RB', description: 'RocketEdition eBook File', category: 'ebook', mimeType: 'application/octet-stream' },
  'tcr': { extension: 'tcr', name: 'TCR', description: 'Psion eBook File', category: 'ebook', mimeType: 'application/octet-stream' },

  // --- IMAGE ---
  'ai': { extension: 'ai', name: 'AI', description: 'Adobe Illustrator Artwork', category: 'image', mimeType: 'application/postscript' },
  'avif': { extension: 'avif', name: 'AVIF', description: 'AV1 Image File Format', category: 'image', mimeType: 'image/avif' },
  'bmp': { extension: 'bmp', name: 'BMP', description: 'Windows Bitmap Image', category: 'image', mimeType: 'image/bmp' },
  'cdr': { extension: 'cdr', name: 'CDR', description: 'Corel Draw Vector Drawing File', category: 'image', mimeType: 'application/cdr' },
  'emf': { extension: 'emf', name: 'EMF', description: 'Windows Enhanced Metafile', category: 'image', mimeType: 'image/emf' },
  'gif': { extension: 'gif', name: 'GIF', description: 'CompuServe Graphics Interchange Format', category: 'image', mimeType: 'image/gif' },
  'heic': { extension: 'heic', name: 'HEIC', description: 'High Efficiency Image Container', category: 'image', mimeType: 'image/heic' },
  'jfif': { extension: 'jfif', name: 'JFIF', description: 'JPEG File Interchange Format', category: 'image', mimeType: 'image/jpeg' },
  'jpg': { extension: 'jpg', name: 'JPG', description: 'JPEG Image Format', category: 'image', mimeType: 'image/jpeg' },
  'jpeg': { extension: 'jpeg', name: 'JPEG', description: 'JPEG Image Format', category: 'image', mimeType: 'image/jpeg' },
  'odg': { extension: 'odg', name: 'ODG', description: 'OpenDocument Drawing', category: 'image', mimeType: 'application/vnd.oasis.opendocument.graphics' },
  'pcx': { extension: 'pcx', name: 'PCX', description: 'Paintbrush Bitmap Image', category: 'image', mimeType: 'image/x-pcx' },
  'png': { extension: 'png', name: 'PNG', description: 'Portable Network Graphics', category: 'image', mimeType: 'image/png', isLossless: true },
  'psd': { extension: 'psd', name: 'PSD', description: 'Adobe Photoshop Document', category: 'image', mimeType: 'image/vnd.adobe.photoshop' },
  'svg': { extension: 'svg', name: 'SVG', description: 'Scalable Vector Graphics', category: 'image', mimeType: 'image/svg+xml', isLossless: true },
  'tga': { extension: 'tga', name: 'TGA', description: 'Truevision Targa Graphic', category: 'image', mimeType: 'image/x-tga' },
  'tiff': { extension: 'tiff', name: 'TIFF', description: 'Tagged Image File Format', category: 'image', mimeType: 'image/tiff', isLossless: true },
  'wbmp': { extension: 'wbmp', name: 'WBMP', description: 'Wireless Bitmap File Format', category: 'image', mimeType: 'image/vnd.wap.wbmp' },
  'webp': { extension: 'webp', name: 'WEBP', description: 'WebP Image Format', category: 'image', mimeType: 'image/webp' },
  'wmf': { extension: 'wmf', name: 'WMF', description: 'Windows Metafile', category: 'image', mimeType: 'image/wmf' },
  'ico': { extension: 'ico', name: 'ICO', description: 'Windows Icon Format', category: 'image', mimeType: 'image/x-icon' },

  // --- VIDEO ---
  '3g2': { extension: '3g2', name: '3G2', description: '3GPP2 Multimedia Video File', category: 'video', mimeType: 'video/3gpp2' },
  '3gp': { extension: '3gp', name: '3GP', description: '3GPP Multimedia Video File', category: 'video', mimeType: 'video/3gpp' },
  '3gpp': { extension: '3gpp', name: '3GPP', description: '3GPP Multimedia File', category: 'video', mimeType: 'video/3gpp' },
  'asf': { extension: 'asf', name: 'ASF', description: 'Advanced Streaming Format', category: 'video', mimeType: 'video/x-ms-asf' },
  'avi': { extension: 'avi', name: 'AVI', description: 'Audio Video Interleave', category: 'video', mimeType: 'video/x-msvideo' },
  'flv': { extension: 'flv', name: 'FLV', description: 'Flash Video Format', category: 'video', mimeType: 'video/x-flv' },
  'gvi': { extension: 'gvi', name: 'GVI', description: 'Google Video File', category: 'video', mimeType: 'video/x-gvi' },
  'm4v': { extension: 'm4v', name: 'M4V', description: 'MPEG-4 Video File', category: 'video', mimeType: 'video/x-m4v' },
  'mkv': { extension: 'mkv', name: 'MKV', description: 'Matroska Video Container', category: 'video', mimeType: 'video/x-matroska' },
  'mod': { extension: 'mod', name: 'MOD', description: 'Camcorder Recorded Video', category: 'video', mimeType: 'video/mod' },
  'mov': { extension: 'mov', name: 'MOV', description: 'Apple QuickTime Movie', category: 'video', mimeType: 'video/quicktime' },
  'mp4': { extension: 'mp4', name: 'MP4', description: 'MPEG-4 Part 14 Video File', category: 'video', mimeType: 'video/mp4' },
  'mpg': { extension: 'mpg', name: 'MPG', description: 'MPEG Video File', category: 'video', mimeType: 'video/mpeg' },
  'mts': { extension: 'mts', name: 'MTS', description: 'AVCHD High Definition Video', category: 'video', mimeType: 'video/mp2t' },
  'rm': { extension: 'rm', name: 'RM', description: 'RealMedia Streaming Media Video', category: 'video', mimeType: 'application/vnd.rn-realmedia' },
  'rmvb': { extension: 'rmvb', name: 'RMVB', description: 'RealMedia Variable Bitrate Video', category: 'video', mimeType: 'application/vnd.rn-realmedia-vbr' },
  'ts': { extension: 'ts', name: 'TS', description: 'Video Transport Stream File', category: 'video', mimeType: 'video/mp2t' },
  'vob': { extension: 'vob', name: 'VOB', description: 'DVD Video Object File', category: 'video', mimeType: 'video/x-ms-vob' },
  'webm': { extension: 'webm', name: 'WEBM', description: 'WebM Open Media Video', category: 'video', mimeType: 'video/webm' },
  'wmv': { extension: 'wmv', name: 'WMV', description: 'Windows Media Video', category: 'video', mimeType: 'video/x-ms-wmv' }
};

export class FormatRegistry {
  static get(extension: string): FormatDefinition | undefined {
    const cleanExt = extension.toLowerCase().replace(/^\./, '');
    return FORMAT_REGISTRY[cleanExt];
  }

  static getByCategory(category: FormatCategory): FormatDefinition[] {
    return Object.values(FORMAT_REGISTRY).filter(f => f.category === category);
  }

  static getAll(): FormatDefinition[] {
    return Object.values(FORMAT_REGISTRY);
  }

  static isSupported(extension: string): boolean {
    const cleanExt = extension.toLowerCase().replace(/^\./, '');
    return cleanExt in FORMAT_REGISTRY;
  }
}
