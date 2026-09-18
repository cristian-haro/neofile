import React, { useMemo } from 'react';
import { useI18n } from '../../context/I18nContext';
import { useConverter } from '../../context/ConversionContext';
import { ConversionItemCard } from './ConversionItemCard';
import { Play, Download, Trash2, Layers, Loader2, Wand2 } from 'lucide-react';

export const ConversionQueue: React.FC = () => {
  const { t } = useI18n();
  const {
    jobs,
    isConverting,
    batchProgress,
    convertAllJobs,
    downloadAllZip,
    clearAllJobs,
    setBatchTarget,
    getCompatibleTargets
  } = useConverter();

  const completedCount = jobs.filter(j => j.status === 'completed').length;
  const queuedJobs = jobs.filter(j => j.status === 'queued');
  const queuedCount = jobs.filter(j => j.status === 'queued' || j.status === 'failed').length;

  // Find common compatible target extensions across queued jobs
  const commonTargets = useMemo(() => {
    if (queuedJobs.length === 0) return [];
    
    // Collect target list of the first queued job
    const firstTargets = getCompatibleTargets(queuedJobs[0].sourceFile.rawExtension);
    if (queuedJobs.length === 1) return firstTargets;

    // Filter targets that are compatible with all other queued jobs
    return firstTargets.filter(target =>
      queuedJobs.every(job =>
        getCompatibleTargets(job.sourceFile.rawExtension).some(t => t.extension === target.extension)
      )
    );
  }, [queuedJobs, getCompatibleTargets]);

  if (jobs.length === 0) {
    return null;
  }

  return (
    <div className="w-full space-y-4 mb-12">
      {/* Action Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-xl px-5 py-3.5 shadow-xs transition-colors duration-200">
        <div className="flex items-center space-x-2.5">
          <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {t.queue.title}
          </h3>
          <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
            {jobs.length}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
          {/* Common Target Selector for Queued Files */}
          {queuedJobs.length > 1 && commonTargets.length > 0 && (
            <div className="flex items-center space-x-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded-lg">
              <Wand2 className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 shrink-0" />
              <span className="text-xs text-slate-600 dark:text-slate-400 hidden sm:inline">
                {t.queue.batchTargetPlaceholder}
              </span>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    setBatchTarget(e.target.value);
                  }
                }}
                defaultValue=""
                disabled={isConverting}
                className="bg-transparent text-xs font-mono font-medium text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="" disabled className="dark:bg-slate-900">
                  {t.queue.batchTargetPlaceholder}
                </option>
                {commonTargets.map(tgt => (
                  <option key={tgt.extension} value={tgt.extension} className="dark:bg-slate-900">
                    .{tgt.extension.toUpperCase()} ({tgt.name})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Clear All */}
          <button
            onClick={clearAllJobs}
            disabled={isConverting}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t.queue.clearAll}</span>
          </button>

          {/* Download All ZIP */}
          {completedCount > 0 && (
            <button
              onClick={downloadAllZip}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-600/20 border border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-600/30 text-xs font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.queue.downloadAll} ({completedCount})</span>
            </button>
          )}

          {/* Convert All Button */}
          {queuedCount > 0 && (
            <button
              onClick={convertAllJobs}
              disabled={isConverting}
              className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
            >
              {isConverting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{t.queue.converting}</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>{t.queue.convertAll}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Batch Progress Bar */}
      {batchProgress && (
        <div className="bg-white dark:bg-slate-900/60 border border-blue-200 dark:border-blue-900/40 rounded-xl p-4 space-y-2 shadow-xs transition-colors duration-200">
          <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300 font-mono">
            <span>
              Batch Progress: {batchProgress.completedJobs} of {batchProgress.totalJobs} finished
            </span>
            <span>{batchProgress.overallPercentage}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${batchProgress.overallPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Jobs List */}
      <div className="space-y-3">
        {jobs.map(job => (
          <ConversionItemCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
};
