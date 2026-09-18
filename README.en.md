# Neofile - Universal Converter (Zero-Server)

**Neofile** is a universal file conversion platform with 100% client-side processing using **WebAssembly (WASM)**, **Web Workers**, and **Hexagonal Architecture (Ports & Adapters)**.

Your files **are never uploaded to any server**. Total privacy is guaranteed by processing everything within the browser's local memory.

[Versión en Español](README.md) | [Architecture Documentation](docs/ARCHITECTURE.md) | [Commit Guidelines](docs/CONVENTIONAL_COMMITS.md) | [Privacy Assurance](docs/PRIVACY_ZERO_SERVER.md)

---

## Key Highlights

- **Absolute Privacy (Zero-Server)**: No backend receives files. Zero bytes transmitted to external networks.
- **100+ Formats Supported**: Covers full categories of Audio, Video, Images, Documents, eBooks, Archives, and CAD.
- **Hexagonal Architecture**: Pure domain core decoupled from UI frameworks and conversion engine adapters.
- **Batch Processing**: Simultaneous conversions with concurrency management, per-item status, and ZIP bundling.
- **Binary Format Detection**: Identifies file types via binary *Magic Numbers* instead of relying solely on file extensions.
- **Zero Emoji Standard**: Clean, professional typography with structured SVG iconography (Lucide Icons).
- **Bilingual Internationalization**: Native English and Spanish support with instant runtime switching.
- **Dual Test Strategy**: Domain unit tests alongside automated QA integration test suites.

---

## Supported Formats by Category

| Category | Available Formats |
| :--- | :--- |
| **Audio** | `3GA`, `AAC`, `AC3`, `AIFF`, `FLAC`, `M4A`, `M4R`, `MIDI`, `MP3`, `OGG`, `RA`, `RAM`, `WAV`, `WMA` |
| **Video** | `3G2`, `3GP`, `3GPP`, `ASF`, `AVI`, `FLV`, `GVI`, `M4V`, `MKV`, `MOD`, `MOV`, `MP4`, `MPG`, `MTS`, `RM`, `RMVB`, `TS`, `VOB`, `WEBM`, `WMV` |
| **Images** | `AI`, `AVIF`, `BMP`, `CDR`, `EMF`, `GIF`, `HEIC`, `JFIF`, `JPG`, `JPEG`, `ODG`, `PCX`, `PNG`, `PSD`, `SVG`, `TGA`, `TIFF`, `WBMP`, `WEBP`, `WMF`, `ICO` |
| **Documents** | `CSV`, `DJVU`, `DOC`, `DOCM`, `DOCX`, `EML`, `EPS`, `HTML`, `JSON`, `MD`, `MSG`, `ODP`, `ODS`, `ODT`, `PDF`, `PPS`, `PPSX`, `PPT`, `PPTM`, `PPTX`, `PS`, `PUB`, `RTF`, `TEX`, `TXT`, `WKS`, `WPD`, `WPS`, `XLR`, `XLS`, `XLSM`, `XLSX`, `XPS` |
| **e-Books** | `AZW`, `AZW3`, `CBC`, `CBR`, `CBZ`, `CHM`, `EPUB`, `FB2`, `LIT`, `LRF`, `MOBI`, `PDB`, `PML`, `PRC`, `RB`, `TCR` |
| **Archives** | `7Z`, `CAB`, `LZH`, `RAR`, `TAR`, `TAR.BZ2`, `TAR.GZ`, `YZ1`, `ZIP` |
| **CAD** | `DWG`, `DXF` |

---

## Hexagonal Architecture Structure

```
neofile/
├── src/
│   ├── core/                           # Domain Core & Application Use Cases (Pure TypeScript)
│   │   ├── domain/
│   │   │   ├── entities/               # Format, ConversionJob, FileItem, ConversionMatrix
│   │   │   ├── value-objects/          # ConversionOptions, ConversionProgress
│   │   │   └── ports/                  # IConversionEngine, IFormatDetector, ITelemetryPort
│   │   └── application/
│   │       ├── use-cases/              # ConvertFileUseCase, BatchConvertUseCase, DetectFormatUseCase
│   │       └── services/               # EngineRouterService
│   │
│   ├── infrastructure/                 # Output Adapters (Engine Implementations)
│   │   └── adapters/
│   │       ├── engines/                # ImageConversionAdapter, DocumentEngineAdapter, etc.
│   │       ├── detectors/              # MagicNumberDetectorAdapter
│   │       └── telemetry/              # LocalConsoleTelemetryAdapter
│   │
│   └── presentation/                   # Primary Adapter (React 19 + TailwindCSS)
│       ├── components/                 # Dropzone, Queue, MatrixExplorer, Navbar, Footer
│       ├── context/                    # ConversionContext, I18nContext
│       └── i18n/                       # ES / EN dictionaries
│
├── tests/
│   ├── unit/                           # Domain unit tests
│   └── qa/                             # Automated integration QA test runner
└── docs/                               # Bilingual technical documentation
```

---

## Quickstart

### Prerequisites
- Node.js 20+ (tested on v26.3.0)
- npm 10+

### Commands

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Run Master & QA Test Suite**:
   ```bash
   npm run test:qa
   ```

4. **Build production bundle**:
   ```bash
   npm run build
   ```

---

## License

Open source under the MIT License.
