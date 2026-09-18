import React, { useState, useMemo } from 'react';
import { useI18n } from '../../context/I18nContext';
import { FormatRegistry } from '../../../core/domain/entities/Format';
import { ConversionMatrix } from '../../../core/domain/entities/ConversionMatrix';
import {
  Search,
  Filter,
  Music,
  Video,
  Image as ImageIcon,
  FileText,
  BookOpen,
  Archive,
  Compass
} from 'lucide-react';

export const FormatMatrixExplorer: React.FC = () => {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories: { id: string; label: string; icon: any }[] = [
    { id: 'all', label: t.matrix.categoryAll, icon: Filter },
    { id: 'audio', label: t.matrix.categoryAudio, icon: Music },
    { id: 'video', label: t.matrix.categoryVideo, icon: Video },
    { id: 'image', label: t.matrix.categoryImage, icon: ImageIcon },
    { id: 'document', label: t.matrix.categoryDocument, icon: FileText },
    { id: 'ebook', label: t.matrix.categoryEbook, icon: BookOpen },
    { id: 'compressed', label: t.matrix.categoryCompressed, icon: Archive },
    { id: 'cad', label: t.matrix.categoryCad, icon: Compass },
  ];

  const allFormats = useMemo(() => FormatRegistry.getAll(), []);

  const filteredFormats = useMemo(() => {
    return allFormats.filter(format => {
      const matchesCategory = selectedCategory === 'all' || format.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        format.extension.toLowerCase().includes(q) ||
        format.name.toLowerCase().includes(q) ||
        format.description.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [allFormats, selectedCategory, searchQuery]);

  const totalPairs = useMemo(() => ConversionMatrix.getTotalConversionPairs(), []);

  return (
    <div className="w-full space-y-6 animate-fade-in mb-16">
      {/* Header Info */}
      <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-xs transition-colors duration-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">
              {t.matrix.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
              {t.matrix.subtitle}
            </p>
          </div>
          <div className="flex items-center space-x-4 shrink-0 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl">
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Total Formats</span>
              <span className="text-lg font-bold font-mono text-blue-600 dark:text-blue-400">{allFormats.length}</span>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Conversion Paths</span>
              <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">{totalPairs}+</span>
            </div>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t.matrix.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-blue-500 font-mono transition-colors"
            />
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.map(cat => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Formats Table */}
      <div className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-xs transition-colors duration-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-mono text-[11px] uppercase">
              <tr>
                <th className="px-6 py-3.5">{t.matrix.formatCol}</th>
                <th className="px-6 py-3.5">{t.matrix.categoryCol}</th>
                <th className="px-6 py-3.5">{t.matrix.descCol}</th>
                <th className="px-6 py-3.5">{t.matrix.targetsCol}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/50">
              {filteredFormats.map(format => {
                const targets = ConversionMatrix.getCompatibleTargets(format.extension);

                return (
                  <tr key={format.extension} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-mono">
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">.{format.extension.toUpperCase()}</span>
                      {format.isLossless && (
                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          {t.matrix.lossless}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 capitalize">
                        {format.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {format.description}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center gap-1.5 max-w-lg">
                        {targets.slice(0, 7).map(tgt => (
                          <span
                            key={tgt.extension}
                            className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-blue-700 dark:text-blue-300"
                          >
                            .{tgt.extension.toUpperCase()}
                          </span>
                        ))}
                        {targets.length > 7 && (
                          <span className="text-[10px] font-mono text-slate-500">
                            +{targets.length - 7} more
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
