import React from 'react';
import { useI18n } from '../../context/I18nContext';
import { ShieldCheck, HardDrive, WifiOff } from 'lucide-react';

export const PrivacyBadge: React.FC = () => {
  const { t } = useI18n();

  return (
    <div className="w-full bg-gradient-to-r from-emerald-950/40 via-slate-900/60 to-blue-950/40 border border-emerald-900/40 rounded-xl p-4 sm:p-5 mb-8 text-slate-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 rounded-lg bg-emerald-900/30 border border-emerald-700/50 text-emerald-400 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-semibold text-slate-100">{t.privacy.title}</h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
                100% In-Browser
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              {t.privacy.description}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs text-slate-400 shrink-0 self-end sm:self-center">
          <div className="flex items-center space-x-1.5 bg-slate-950/60 border border-slate-800/80 px-2.5 py-1.5 rounded-md">
            <HardDrive className="w-3.5 h-3.5 text-blue-400" />
            <span>RAM Processing</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-slate-950/60 border border-slate-800/80 px-2.5 py-1.5 rounded-md">
            <WifiOff className="w-3.5 h-3.5 text-emerald-400" />
            <span>No Data Uploads</span>
          </div>
        </div>
      </div>
    </div>
  );
};
