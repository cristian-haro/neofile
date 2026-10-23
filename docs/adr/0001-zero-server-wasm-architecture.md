# ADR 0001: Zero-Server Client-Side Conversion Architecture (WASM & Web Workers)

## Status
Accepted

## Context
Traditional file converters upload user files to remote servers, incurring high backend bandwidth costs, privacy compliance liabilities (GDPR), and security risks for sensitive documents.

## Decision
Neofile adopts a **Zero-Server Client-Side Architecture**:
1. 100% of conversion computations execute inside the user's browser memory using WebAssembly, Web Workers, and JavaScript binary parsers (pdfjs-dist, docx, fflate, xlsx).
2. Hexagonal engine adapters isolate format categories: `ImageConversionAdapter`, `DocumentEngineAdapter`, `ArchiveEngineAdapter`, `CADEngineAdapter`, `DataCodeEngineAdapter`.
3. Offline-First PWA capabilities: `manifest.webmanifest` and Service Worker cache static assets so conversion operates without an internet connection.

## Consequences
- **Positive**: Total privacy guarantee (0 bytes transmitted to external servers).
- **Positive**: Zero server hosting costs for conversion workloads.
- **Negative**: File size processing capacity is bounded by the user device's available RAM.
