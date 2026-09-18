import React, { useRef, useState, DragEvent, ChangeEvent } from 'react';
import { useI18n } from '../../context/I18nContext';
import { useConverter } from '../../context/ConversionContext';
import { Upload, Music, Video, Image as ImageIcon, FileText, BookOpen, Archive, Compass } from 'lucide-react';

export const Dropzone: React.FC = () => {
  const { t } = useI18n();
  const { addFiles } = useConverter();
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const fileList = Array.from(e.dataTransfer.files);
      await addFiles(fileList);
    }
  };

  const handleFileInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileList = Array.from(e.target.files);
      await addFiles(fileList);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const categories = [
    { name: 'Audio', icon: Music, color: 'text-amber-400 bg-amber-950/40 border-amber-800/40' },
    { name: 'Video', icon: Video, color: 'text-rose-400 bg-rose-950/40 border-rose-800/40' },
    { name: 'Image', icon: ImageIcon, color: 'text-purple-400 bg-purple-950/40 border-purple-800/40' },
    { name: 'Document', icon: FileText, color: 'text-blue-400 bg-blue-950/40 border-blue-800/40' },
    { name: 'e-Book', icon: BookOpen, color: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40' },
    { name: 'Archive', icon: Archive, color: 'text-cyan-400 bg-cyan-950/40 border-cyan-800/40' },
    { name: 'CAD', icon: Compass, color: 'text-orange-400 bg-orange-950/40 border-orange-800/40' },
  ];

  return (
    <div className="w-full mb-8">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        className={`relative group cursor-pointer border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all duration-200 ${
          isDragOver
            ? 'border-blue-500 bg-blue-950/20 scale-[1.005]'
            : 'border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 group-hover:bg-blue-600/20 transition-all duration-200">
            <Upload className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-100 mb-1">
              {t.dropzone.title}
            </h2>
            <p className="text-sm text-slate-400">
              {t.dropzone.subtitle}
            </p>
          </div>

          {/* Format Categories Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 max-w-2xl">
            {categories.map(cat => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.name}
                  className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs border ${cat.color}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.name}</span>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-slate-500 pt-2 font-mono">
            {t.dropzone.batchNotice}
          </p>
        </div>
      </div>
    </div>
  );
};
