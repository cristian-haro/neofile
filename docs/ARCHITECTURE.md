# Hexagonal Architecture Specification (Ports & Adapters)

## Overview

The **Neofile** platform strictly adheres to **Hexagonal Architecture (Ports and Adapters)** to decouple domain business logic and conversion workflows from specific browser APIs, UI rendering libraries, and file processing tools.

---

## Architectural Layers

```mermaid
flowchart TD
    subgraph Presentation ["Primary / Driving Adapters (Presentation Layer)"]
        UI["React 19 Components (Dropzone, Queue, Matrix)"]
        Hooks["Custom Hooks (useConverter, useI18n)"]
        Context["Context Providers (ConversionContext)"]
    end

    subgraph Core ["Hexagonal Core (Domain & Application)"]
        subgraph AppLayer ["Application Layer (Use Cases)"]
            UC1["ConvertFileUseCase"]
            UC2["BatchConvertUseCase"]
            UC3["DetectFormatUseCase"]
            UC4["GetCompatibleTargetsUseCase"]
            Router["EngineRouterService"]
        end

        subgraph DomainLayer ["Domain Layer (Entities & Ports)"]
            Entities["Entities: Format, FileItem, ConversionJob, ConversionMatrix"]
            VO["Value Objects: ConversionOptions, ConversionProgress"]
            
            Ports["Output Ports (Interfaces):
            - IConversionEngine
            - IFormatDetector
            - ITelemetryPort"]
        end
    end

    subgraph Infrastructure ["Secondary / Driven Adapters (Infrastructure Layer)"]
        E1["ImageConversionAdapter (Canvas / WebGL)"]
        E2["DocumentEngineAdapter (SheetJS / jsPDF)"]
        E3["ArchiveEngineAdapter (fflate WASM)"]
        E4["CADEngineAdapter (dxf-parser / SVG Vectorizer)"]
        E5["AudioVideoEngineAdapter (Web Audio API / MediaStreams)"]
        E6["EBookEngineAdapter (EPUB/CBZ Stream Reader)"]
        D1["MagicNumberDetectorAdapter (Binary Headers)"]
        T1["LocalConsoleTelemetryAdapter"]
    end

    UI --> Context --> AppLayer
    AppLayer --> DomainLayer
    DomainLayer -.->|Implements Ports| Infrastructure
```

---

## 1. Domain Layer (`src/core/domain/`)
- **Zero dependencies** on external UI frameworks or third-party web APIs.
- **Entities**:
  - `Format`: Represents all 100+ registered format definitions, categories, MIME types, and lossless flags.
  - `ConversionJob`: Manages the state machine (`queued`, `converting`, `completed`, `failed`), progress tracking, and converted artifact blobs.
  - `FileItem`: Encapsulates user files and formatted file size helpers.
  - `ConversionMatrix`: Calculates compatible target formats and validates conversion paths.
- **Ports (Output Interfaces)**:
  - `IConversionEngine`: Contract for executing format conversions.
  - `IFormatDetector`: Contract for binary inspection.
  - `ITelemetryPort`: Contract for logging conversion metrics without external transmission.

---

## 2. Application Layer (`src/core/application/`)
- Coordinates the execution of user intents.
- **Use Cases**:
  - `ConvertFileUseCase`: Coordinates status transitions, progress events, and routing to the right engine.
  - `BatchConvertUseCase`: Manages concurrent multi-file queues with concurrency limits.
  - `DetectFormatUseCase`: Resolves file types by combining binary magic numbers and extensions.
  - `GetCompatibleTargetsUseCase`: Queries target options for any format.
- **Services**:
  - `EngineRouterService`: Dynamically selects the appropriate engine based on `canHandle(sourceExt, targetExt)`.

---

## 3. Infrastructure Layer (`src/infrastructure/`)
- Implements the ports defined by the domain.
- Adapters can be modified, replaced, or upgraded (e.g. swapping Web Audio for FFmpeg WASM or Canvas for Magick WASM) without touching domain logic.

---

## 4. Presentation Layer (`src/presentation/`)
- Implements the primary driving adapter via React 19 and Tailwind CSS.
- Completely isolated from file processing mechanics through React Context and Custom Hooks.

### User Interface Preview
![Neofile Main Interface](assets/neofile_hero_home.png)
*Figure 1: Main Dropzone and Hero Interface (Zero-Server Guarantee)*

![Neofile Queue](assets/neofile_conversion_queue.png)
*Figure 2: Active Batch Conversion Queue with locked format selectors and real-time state management*

