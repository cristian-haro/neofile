import React, { useState } from 'react';
import { useI18n } from '../../context/I18nContext';
import { ConversionOptions } from '../../../core/domain/value-objects/ConversionOptions';
import { X, Sliders, Check } from 'lucide-react';

interface OptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  options: ConversionOptions;
  onSave: (options: ConversionOptions) => void;
  fileName: string;
}

export const OptionsModal: React.FC<OptionsModalProps> = ({
  isOpen,
  onClose,
  options,
  onSave,
  fileName,
}) => {
  const { t } = useI18n();

  const [quality, setQuality] = useState<number>(options.image?.quality ?? 0.92);
  const [width, setWidth] = useState<string>(options.image?.width ? String(options.image.width) : '');
  const [height, setHeight] = useState<string>(options.image?.height ? String(options.image.height) : '');
  const [maintainAspect, setMaintainAspect] = useState<boolean>(options.image?.maintainAspectRatio ?? true);
  const [bgColor, setBgColor] = useState<string>(options.image?.backgroundColor ?? '#ffffff');

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      image: {
        quality,
        width: width ? parseInt(width, 10) : undefined,
        height: height ? parseInt(height, 10) : undefined,
        maintainAspectRatio: maintainAspect,
        backgroundColor: bgColor,
      },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-slate-100">{t.optionsModal.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-xs text-slate-300">
          <div>
            <span className="text-slate-400 font-mono block mb-1">Target file:</span>
            <p className="font-semibold text-slate-200 truncate">{fileName}</p>
          </div>

          {/* Quality Slider */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-slate-300 font-medium">{t.optionsModal.quality}</label>
              <span className="font-mono text-blue-400">{Math.round(quality * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={quality}
              onChange={(e) => setQuality(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Dimensions */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-medium block mb-1">{t.optionsModal.width}</label>
              <input
                type="number"
                placeholder="Auto"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="text-slate-300 font-medium block mb-1">{t.optionsModal.height}</label>
              <input
                type="number"
                placeholder="Auto"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          {/* Aspect Ratio Checkbox */}
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={maintainAspect}
              onChange={(e) => setMaintainAspect(e.target.checked)}
              className="rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-0"
            />
            <span>{t.optionsModal.maintainAspect}</span>
          </label>

          {/* Background Color Picker */}
          <div>
            <label className="text-slate-300 font-medium block mb-1">{t.optionsModal.bgColor}</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-8 h-8 rounded border border-slate-800 cursor-pointer bg-transparent"
              />
              <span className="font-mono text-slate-400">{bgColor}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-2 px-6 py-4 border-t border-slate-800 bg-slate-950/60">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs transition-colors"
          >
            {t.optionsModal.close}
          </button>
          <button
            onClick={handleSave}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium shadow-sm transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{t.optionsModal.save}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
