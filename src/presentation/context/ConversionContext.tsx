import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { ConversionJob } from '../../core/domain/entities/ConversionJob';
import { FileItem } from '../../core/domain/entities/FileItem';
import { FormatRegistry, FormatDefinition } from '../../core/domain/entities/Format';
import { ConversionMatrix, ConversionTarget } from '../../core/domain/entities/ConversionMatrix';
import { ConversionOptions } from '../../core/domain/value-objects/ConversionOptions';
import { EngineRouterService } from '../../core/application/services/EngineRouterService';
import { ConvertFileUseCase } from '../../core/application/use-cases/ConvertFileUseCase';
import { BatchConvertUseCase, BatchProgress } from '../../core/application/use-cases/BatchConvertUseCase';
import { DetectFormatUseCase } from '../../core/application/use-cases/DetectFormatUseCase';

// Infrastructure Adapters
import { ImageConversionAdapter } from '../../infrastructure/adapters/engines/ImageConversionAdapter';
import { DocumentEngineAdapter } from '../../infrastructure/adapters/engines/DocumentEngineAdapter';
import { ArchiveEngineAdapter } from '../../infrastructure/adapters/engines/ArchiveEngineAdapter';
import { CADEngineAdapter } from '../../infrastructure/adapters/engines/CADEngineAdapter';
import { AudioVideoEngineAdapter } from '../../infrastructure/adapters/engines/AudioVideoEngineAdapter';
import { EBookEngineAdapter } from '../../infrastructure/adapters/engines/EBookEngineAdapter';
import { MagicNumberDetectorAdapter } from '../../infrastructure/adapters/detectors/MagicNumberDetectorAdapter';
import { LocalConsoleTelemetryAdapter } from '../../infrastructure/adapters/telemetry/LocalConsoleTelemetryAdapter';

interface ConversionContextType {
  jobs: ConversionJob[];
  isConverting: boolean;
  batchProgress?: BatchProgress;
  addFiles: (files: File[]) => Promise<void>;
  removeJob: (jobId: string) => void;
  clearAllJobs: () => void;
  updateJobTarget: (jobId: string, targetExt: string) => void;
  updateJobOptions: (jobId: string, options: ConversionOptions) => void;
  convertSingleJob: (jobId: string) => Promise<void>;
  convertAllJobs: () => Promise<void>;
  downloadAllZip: () => Promise<void>;
  getCompatibleTargets: (sourceExt: string) => ConversionTarget[];
}

const ConversionContext = createContext<ConversionContextType | undefined>(undefined);

export const ConversionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [jobs, setJobs] = useState<ConversionJob[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [batchProgress, setBatchProgress] = useState<BatchProgress | undefined>(undefined);

  // Wire hexagonal components
  const { convertFileUseCase, batchConvertUseCase, detectFormatUseCase } = useMemo(() => {
    const telemetry = new LocalConsoleTelemetryAdapter();
    const detector = new MagicNumberDetectorAdapter();

    const router = new EngineRouterService([
      new ImageConversionAdapter(),
      new DocumentEngineAdapter(),
      new ArchiveEngineAdapter(),
      new CADEngineAdapter(),
      new AudioVideoEngineAdapter(),
      new EBookEngineAdapter(),
    ]);

    const convertUseCase = new ConvertFileUseCase(router, telemetry);
    const batchUseCase = new BatchConvertUseCase(convertUseCase);
    const detectUseCase = new DetectFormatUseCase(detector);

    return {
      convertFileUseCase: convertUseCase,
      batchConvertUseCase: batchUseCase,
      detectFormatUseCase: detectUseCase,
    };
  }, []);

  const addFiles = async (files: File[]) => {
    const newJobs: ConversionJob[] = [];

    for (const file of files) {
      const { format } = await detectFormatUseCase.execute(file);
      const fileItem = new FileItem(file, format);

      // Pick standard default target format
      const compatibleTargets = ConversionMatrix.getCompatibleTargets(format.extension);
      const defaultTargetDef = compatibleTargets.length > 0 
        ? FormatRegistry.get(compatibleTargets[0].extension) || format
        : format;

      const job = new ConversionJob(fileItem, defaultTargetDef);
      newJobs.push(job);
    }

    setJobs(prev => [...prev, ...newJobs]);
  };

  const removeJob = (jobId: string) => {
    setJobs(prev => {
      const targetJob = prev.find(j => j.id === jobId);
      if (targetJob) {
        targetJob.cleanup();
        targetJob.sourceFile.revokePreview();
      }
      return prev.filter(j => j.id !== jobId);
    });
  };

  const clearAllJobs = () => {
    jobs.forEach(j => {
      j.cleanup();
      j.sourceFile.revokePreview();
    });
    setJobs([]);
  };

  const updateJobTarget = (jobId: string, targetExt: string) => {
    const targetDef = FormatRegistry.get(targetExt);
    if (!targetDef) return;

    setJobs(prev =>
      prev.map(j => {
        if (j.id === jobId) {
          j.setTargetFormat(targetDef);
          return Object.assign(Object.create(Object.getPrototypeOf(j)), j);
        }
        return j;
      })
    );
  };

  const updateJobOptions = (jobId: string, options: ConversionOptions) => {
    setJobs(prev =>
      prev.map(j => {
        if (j.id === jobId) {
          j.options = { ...j.options, ...options };
          return Object.assign(Object.create(Object.getPrototypeOf(j)), j);
        }
        return j;
      })
    );
  };

  const convertSingleJob = async (jobId: string) => {
    const targetJob = jobs.find(j => j.id === jobId);
    if (!targetJob || targetJob.status === 'converting') return;

    setIsConverting(true);
    setJobs(prev => [...prev]);

    try {
      await convertFileUseCase.execute(targetJob);
    } finally {
      setIsConverting(false);
      setJobs(prev => [...prev]);
    }
  };

  const convertAllJobs = async () => {
    if (jobs.length === 0 || isConverting) return;

    setIsConverting(true);
    setJobs(prev => [...prev]);

    try {
      await batchConvertUseCase.execute(jobs, 2, (progress) => {
        setBatchProgress(progress);
        setJobs(prev => [...prev]);
      });
    } finally {
      setIsConverting(false);
      setBatchProgress(undefined);
      setJobs(prev => [...prev]);
    }
  };

  const downloadAllZip = async () => {
    const completedJobs = jobs.filter(j => j.status === 'completed' && j.result);
    if (completedJobs.length === 0) return;

    const filesToZip = completedJobs.map(j => ({
      name: j.result!.fileName,
      blob: j.result!.blob
    }));

    const zipBlob = await ArchiveEngineAdapter.createZipBundle(filesToZip);
    const zipUrl = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = zipUrl;
    a.download = `neofile_converted_files_${Date.now()}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(zipUrl);
  };

  const getCompatibleTargets = (sourceExt: string): ConversionTarget[] => {
    return ConversionMatrix.getCompatibleTargets(sourceExt);
  };

  return (
    <ConversionContext.Provider
      value={{
        jobs,
        isConverting,
        batchProgress,
        addFiles,
        removeJob,
        clearAllJobs,
        updateJobTarget,
        updateJobOptions,
        convertSingleJob,
        convertAllJobs,
        downloadAllZip,
        getCompatibleTargets,
      }}
    >
      {children}
    </ConversionContext.Provider>
  );
};

export const useConverter = (): ConversionContextType => {
  const context = useContext(ConversionContext);
  if (!context) {
    throw new Error('useConverter must be used within a ConversionProvider');
  }
  return context;
};
