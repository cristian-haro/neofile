import React from 'react';
import { useI18n } from '../../context/I18nContext';
import { ShieldCheck, RefreshCw } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t } = useI18n();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-900 bg-white/80 dark:bg-slate-950/80 py-8 mt-16 text-slate-500 dark:text-slate-400 text-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Tagline */}
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 rounded-md bg-blue-600/10 dark:bg-blue-600/20 border border-blue-500/20 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <RefreshCw className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-slate-800 dark:text-slate-200 tracking-tight">Neofile</span>
          <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
          <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">{t.footer.tagline}</span>
        </div>

        {/* Privacy & Copyright */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t.footer.privacyGuarantee}</span>
          </div>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="text-slate-500 dark:text-slate-400">© {currentYear} {t.footer.rights}</span>
        </div>
      </div>
    </footer>
  );
};
