import React, { useState } from 'react';
import { ConversionJob } from '../../../core/domain/entities/ConversionJob';
import { FileItem } from '../../../core/domain/entities/FileItem';
import { useI18n } from '../../context/I18nContext';
import { useConverter } from '../../context/ConversionContext';
import { OptionsModal } from './OptionsModal';
import {
  FileText,
  Music,
  Video,
  Image as ImageIcon,
  BookOpen,
  Archive,
  Compass,
  FileCode,
  Download,
  Trash2,
  Sliders,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  RotateCcw,
  TrendingDown,
  TrendingUp
} from 'lucide-react';

interface ConversionItemCardProps {
  job: ConversionJob;
}

export const ConversionItemCard: React.FC<ConversionItemCardProps> = ({ job }) => {
  const { t } = useI18n();
  const { updateJobTarget, updateJobOptions, convertSingleJob, removeJob, resetJob, getCompatibleTargets } = useConverter();
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);

  const compatibleTargets = getCompatibleTargets(job.sourceFile.rawExtension);

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'audio': return <Music className="w-5 h-5 text-amber-500 dark:text-amber-400" />;
      case 'video': return <Video className="w-5 h-5 text-rose-500 dark:text-rose-400" />;
      case 'image': return <ImageIcon className="w-5 h-5 text-purple-500 dark:text-purple-400" />;
      case 'document': return <FileText className="w-5 h-5 text-blue-500 dark:text-blue-400" />;
      case 'ebook': return <BookOpen className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />;
      case 'compressed': return <Archive className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />;
      case 'cad': return <Compass className="w-5 h-5 text-orange-500 dark:text-orange-400" />;
      default: return <FileCode className="w-5 h-5 text-slate-500 dark:text-slate-400" />;
    }
  };

  const renderStatusBadge = () => {
    switch (job.status) {
      case 'queued':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <Clock className="w-3 h-3 text-slate-500 dark:text-slate-400" />
            <span>{t.item.statusQueued}</span>
          </span>
        );
      case 'converting':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Loader2 className="w-3 h-3 animate-spin text-blue-600 dark:text-blue-400" />
            <span>{t.item.statusConverting} ({job.progress.percentage}%)</span>
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>{t.item.statusCompleted} {job.durationMs ? `(${job.durationMs}ms)` : ''}</span>
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800" title={job.error}>
            <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
            <span>{t.item.statusFailed}</span>
          </span>
        );
      default:
        return null;
    }
  };

  const renderSizeComparison = () => {
    if (job.status !== 'completed' || !job.result) return null;

    const originalBytes = job.sourceFile.size;
    const resultBytes = job.result.size;
    const formattedResult = FileItem.formatBytes(resultBytes);

    if (originalBytes <= 0 || resultBytes <= 0) {
      return (
        <span className="text-[11px] font-mono text-slate-500">
          {formattedResult}
        </span>
      );
    }

    const diff = originalBytes - resultBytes;
    const percent = Math.round((Math.abs(diff) / originalBytes) * 100);

    if (diff > 0 && percent > 0) {
      return (
        <div className="flex items-center space-x-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-md">
          <TrendingDown className="w-3 h-3" />
          <span>{formattedResult} (-{percent}%)</span>
        </div>
      );
    }

    if (diff < 0 && percent > 0) {
      return (
        <div className="flex items-center space-x-1 text-[11px] font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-md">
          <TrendingUp className="w-3 h-3 text-slate-500" />
          <span>{formattedResult} (+{percent}%)</span>
        </div>
      );
    }

    return (
      <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400">
        {formattedResult}
      </span>
    );
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 sm:p-5 transition-all duration-150 hover:border-slate-300 dark:hover:border-slate-700/80 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          {/* File Info */}
          <div className="flex items-center space-x-3.5 min-w-0 max-w-full md:max-w-[38%]">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
              {job.sourceFile.previewUrl && job.sourceFile.format?.category === 'image' ? (
                <img
                  src={job.sourceFile.previewUrl}
                  alt={job.sourceFile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                getCategoryIcon(job.sourceFile.format?.category)
              )}
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate" title={job.sourceFile.name}>
                {job.sourceFile.name}
              </h4>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <span className="font-mono">{job.sourceFile.formattedSize}</span>
                <span>•</span>
                <span className="uppercase font-mono font-medium text-slate-700 dark:text-slate-300">
                  {job.sourceFile.rawExtension}
                </span>
                {job.sourceFile.format?.name && (
                  <span className="hidden sm:inline text-slate-400 dark:text-slate-500 truncate">
                    ({job.sourceFile.format.name})
                  </span>
                )}
                {renderSizeComparison()}
              </div>
            </div>
          </div>

          {/* Target Selector & Options */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">{t.item.convertTo}:</span>
              <select
                value={job.targetFormat.extension}
                onChange={(e) => updateJobTarget(job.id, e.target.value)}
                disabled={job.status === 'converting' || job.status === 'completed'}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 text-xs font-mono font-medium rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-900/60"
              >
                {compatibleTargets.length > 0 ? (
                  compatibleTargets.map(target => (
                    <option key={target.extension} value={target.extension} className="dark:bg-slate-900">
                      .{target.extension.toUpperCase()} ({target.name})
                    </option>
                  ))
                ) : (
                  <option value={job.targetFormat.extension} className="dark:bg-slate-900">
                    .{job.targetFormat.extension.toUpperCase()}
                  </option>
                )}
              </select>
            </div>

            {/* Options Button */}
            {job.sourceFile.format?.category === 'image' && (
              <button
                onClick={() => setIsOptionsOpen(true)}
                disabled={job.status === 'converting' || job.status === 'completed'}
                className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={t.item.options}
              >
                <Sliders className="w-4 h-4" />
              </button>
            )}

            {/* Status Pill */}
            <div>
              {renderStatusBadge()}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 self-end md:self-center shrink-0">
            {/* Completed Actions: Download & Reconvert / Change Format */}
            {job.status === 'completed' && job.result && (
              <>
                <a
                  href={job.result.downloadUrl}
                  download={job.result.fileName}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t.item.download}</span>
                </a>

                {/* Reconvert / Change format button */}
                <button
                  onClick={() => resetJob(job.id)}
                  className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700 transition-colors"
                  title={t.item.reconvert}
                >
                  <RotateCcw className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span className="hidden lg:inline">{t.item.reconvert}</span>
                </button>
              </>
            )}

            {job.status === 'queued' && (
              <button
                onClick={() => convertSingleJob(job.id)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium shadow-xs transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{t.header.title.split(' ')[0]}</span>
              </button>
            )}

            {job.status === 'failed' && (
              <>
                <button
                  onClick={() => convertSingleJob(job.id)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium shadow-xs transition-colors"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{t.item.retry}</span>
                </button>

                <button
                  onClick={() => resetJob(job.id)}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700 transition-colors"
                  title={t.item.reset}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            <button
              onClick={() => removeJob(job.id)}
              disabled={job.status === 'converting'}
              className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-transparent hover:border-rose-200 dark:hover:border-rose-900/50 transition-colors disabled:opacity-50"
              title={t.item.remove}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar (when active or in progress) */}
        {job.status === 'converting' && (
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800/60">
            <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400 mb-1 font-mono">
              <span>{job.progress.stage}... {job.progress.message ? `- ${job.progress.message}` : ''}</span>
              <span>{job.progress.percentage}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-blue-500 h-full transition-all duration-300 rounded-full"
                style={{ width: `${job.progress.percentage}%` }}
              />
            </div>
          </div>
        )}

        {job.status === 'failed' && job.error && (
          <div className="mt-2 text-[11px] font-mono text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 rounded-lg p-2">
            Error: {job.error}
          </div>
        )}
      </div>

      {/* Options Modal */}
      <OptionsModal
        isOpen={isOptionsOpen}
        onClose={() => setIsOptionsOpen(false)}
        options={job.options}
        fileName={job.sourceFile.name}
        onSave={(opts) => updateJobOptions(job.id, opts)}
      />
    </>
  );
};
