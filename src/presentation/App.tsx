import React, { useState } from 'react';
import { I18nProvider, useI18n } from './context/I18nContext';
import { ConversionProvider } from './context/ConversionContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { PrivacyBadge } from './components/converter/PrivacyBadge';
import { Dropzone } from './components/converter/Dropzone';
import { ConversionQueue } from './components/converter/ConversionQueue';
import { FormatMatrixExplorer } from './components/matrix/FormatMatrixExplorer';

const MainLayout: React.FC = () => {
  const { t } = useI18n();
  const [currentView, setCurrentView] = useState<'converter' | 'matrix'>('converter');

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar
        currentView={currentView}
        onToggleView={() => setCurrentView(prev => (prev === 'converter' ? 'matrix' : 'converter'))}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        {/* Top Hero Heading */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-100 mb-2">
            {t.header.title}
          </h1>
          <p className="text-sm sm:text-base text-slate-400">
            {t.header.subtitle}
          </p>
        </div>

        {/* View Switch */}
        {currentView === 'converter' ? (
          <>
            <PrivacyBadge />
            <Dropzone />
            <ConversionQueue />
          </>
        ) : (
          <FormatMatrixExplorer />
        )}
      </main>

      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <I18nProvider>
      <ConversionProvider>
        <MainLayout />
      </ConversionProvider>
    </I18nProvider>
  );
};

export default App;
