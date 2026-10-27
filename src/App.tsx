import React, { useState } from 'react';
import { useCryptoSession } from './hooks/useCryptoSession';
import { Header } from './components/Header';
import { CipherWorkspace } from './components/CipherWorkspace';
import { HistoryPanel } from './components/HistoryPanel';
import { CheckCircle2 } from 'lucide-react';

export const App: React.FC = () => {
  const session = useCryptoSession();
  const [activeMobileTab, setActiveMobileTab] = useState<'workspace' | 'history'>('workspace');

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0a0b0e] text-neutral-900 dark:text-neutral-100 antialiased selection:bg-neutral-800 selection:text-white transition-colors">
      <Header
        activeMobileTab={activeMobileTab}
        onTabChange={setActiveMobileTab}
        historyCount={session.history.length}
      />

      <div className="w-full max-w-7xl mx-auto pt-28 lg:pt-24 pb-16 px-4 sm:px-6 lg:px-8 transition-colors">
        {/* Status Bar Modul Riset & Telemetri */}
        <div className="hidden lg:flex items-center justify-between pb-4 mb-6 border-b border-black/[0.06] dark:border-white/[0.08] font-mono text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="uppercase tracking-widest text-[10px]">MODUL RISET AKTIF:</span>
            <span className="text-neutral-900 dark:text-white font-medium">Kriptanalisis Polialfabetik & Matriks Hill</span>
            <span className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-[10px]">RFC-CLASSIC-04</span>
          </div>
          <div className="flex items-center gap-4">
            <span>ALGEBRA MODULO: 26 (ℤ₂₆)</span>
            <span>COINCIDENCE IDX: <strong className="text-neutral-900 dark:text-white">{session.metrics.ic}</strong></span>
            <span>ENTROPI: <strong className="text-neutral-900 dark:text-white">{session.metrics.entropy}</strong></span>
          </div>
        </div>

        {/* Workspace Grid 12-Kolom: 7 Kolom Workspace, 5 Kolom Riwayat */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className={`lg:col-span-7 ${activeMobileTab === 'workspace' ? 'block' : 'hidden lg:block'}`}>
            <CipherWorkspace session={session} />
          </div>

          <div className={`lg:col-span-5 ${activeMobileTab === 'history' ? 'block' : 'hidden lg:block'}`}>
            <HistoryPanel
              session={session}
              onLoadItem={() => setActiveMobileTab('workspace')}
            />
          </div>
        </main>
      </div>

      {session.toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-2xl font-mono text-xs animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{session.toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default App;
