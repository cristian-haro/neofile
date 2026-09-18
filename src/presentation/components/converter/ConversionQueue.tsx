import React from 'react';
import { useI18n } from '../../context/I18nContext';
import { useConverter } from '../../context/ConversionContext';
import { ConversionItemCard } from './ConversionItemCard';
import { Play, Download, Trash2, Layers, Loader2, Sparkles } from 'lucide-react';

export const ConversionQueue: React.FC = () => {
  const { t } = useI18n();
  const { jobs, isConverting, batchProgress, convertAllJobs, downloadAllZip, clearAllJobs } = useConverter();

  if (jobs.length === 0) {
    return null;
  }

  const completedCount = jobs.filter(j => j.status === 'completed').length;
  const queuedCount = jobs.filter(j => j.status === 'queued' || j.status === 'failed').length;

  return (
    <div className="w-full space-y-4 mb-12">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/40 border border-slate-800/80 rounded-xl px-5 py-3.5">
        <div className="flex items-center space-x-2.5">
          <Layers className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-slate-100">
            {t.queue.title}
          </h3>
          <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
            {jobs.length}
          </span>
        </div>

        <div className="flex items-center space-x-2 self-end sm:self-auto">
          {/* Clear All */}
          <button
            onClick={clearAllJobs}
            disabled={isConverting}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t.queue.clearAll}</span>
          </button>

          {/* Download All ZIP */}
          {completedCount > 0 && (
            <button
              onClick={downloadAllZip}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-600/30 text-xs font-medium transition-colors"
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
        <div className="bg-slate-900/60 border border-blue-900/40 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-xs text-slate-300 font-mono">
            <span>
              Batch Progress: {batchProgress.completedJobs} of {batchProgress.totalJobs} finished
            </span>
            <span>{batchProgress.overallPercentage}%</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
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
