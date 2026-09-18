import React from 'react';
import { useI18n } from '../../context/I18nContext';
import { useTheme } from '../../context/ThemeContext';
import { ShieldCheck, TableProperties, Globe, RefreshCw, Sun, Moon, Monitor } from 'lucide-react';

interface NavbarProps {
  currentView: 'converter' | 'matrix';
  onToggleView: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onToggleView }) => {
  const { t, language, toggleLanguage } = useI18n();
  const { theme, resolvedTheme, toggleTheme } = useTheme();

  const getThemeIcon = () => {
    if (theme === 'system') return <Monitor className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />;
    if (theme === 'light') return <Sun className="w-3.5 h-3.5 text-amber-500" />;
    return <Moon className="w-3.5 h-3.5 text-indigo-400" />;
  };

  const getThemeLabel = () => {
    if (theme === 'system') return t.header.themeSystem;
    if (theme === 'light') return t.header.themeLight;
    return t.header.themeDark;
  };

  return (
    <header className="w-full border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => currentView === 'matrix' && onToggleView()}>
          <div className="w-9 h-9 rounded-lg bg-blue-600/10 dark:bg-blue-600/20 border border-blue-500/30 dark:border-blue-500/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <RefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold tracking-tight text-slate-900 dark:text-slate-100 text-lg">Neofile</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 font-medium">
                WASM Native
              </span>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Privacy Badge */}
          <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{t.header.privacyBadge}</span>
          </div>

          {/* Matrix Explorer Toggle */}
          <button
            onClick={onToggleView}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 border ${
              currentView === 'matrix'
                ? 'bg-blue-600 border-blue-500 text-white shadow-sm shadow-blue-500/20'
                : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <TableProperties className="w-4 h-4" />
            <span className="hidden sm:inline">{t.header.exploreMatrix}</span>
          </button>

          {/* Theme Selector Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            title={`${t.header.themeToggle} (${getThemeLabel()})`}
          >
            {getThemeIcon()}
            <span className="hidden md:inline capitalize">{theme}</span>
          </button>

          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span className="uppercase">{language === 'es' ? 'EN' : 'ES'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
