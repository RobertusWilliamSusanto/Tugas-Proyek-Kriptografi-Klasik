import React from 'react';
import { ThemeToggle } from './ThemeToggle';
import { ShieldCheck, Calculator, History } from 'lucide-react';

interface HeaderProps {
  activeMobileTab: 'workspace' | 'history';
  onTabChange: (tab: 'workspace' | 'history') => void;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({ activeMobileTab, onTabChange, historyCount }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-[#0a0b0e]/85 border-b border-black/[0.06] dark:border-white/[0.08] transition-colors">
      <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Core */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 flex items-center justify-center font-mono font-bold shadow-sm">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-sm font-semibold tracking-tight text-neutral-900 dark:text-white">
              CryptographyKu 
            </span>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Sesi Sementara
              </span>
            </div>
          </div>
        </div>

        {/* Global Toolbar Tools */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>

      {/* Mobile Tab Segment Switcher (Hidden on Desktop LG) */}
      <div className="lg:hidden px-4 pb-2.5">
        <nav className="flex items-center p-1 bg-black/[0.04] dark:bg-white/[0.04] rounded-lg border border-black/[0.05] dark:border-white/[0.05]">
          <button
            onClick={() => onTabChange('workspace')}
            className={`flex-1 h-8 rounded-md flex items-center justify-center gap-1.5 text-xs font-mono transition-all ${
              activeMobileTab === 'workspace'
                ? 'bg-white dark:bg-white/[0.1] text-neutral-900 dark:text-white shadow-sm font-medium'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Kalkulator</span>
          </button>
          <button
            onClick={() => onTabChange('history')}
            className={`flex-1 h-8 rounded-md flex items-center justify-center gap-1.5 text-xs font-mono transition-all ${
              activeMobileTab === 'history'
                ? 'bg-white dark:bg-white/[0.1] text-neutral-900 dark:text-white shadow-sm font-medium'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Riwayat Sesi</span>
            <span className="px-1.5 py-0.2 bg-black/10 dark:bg-white/10 rounded-full text-[10px]">
              {historyCount}
            </span>
          </button>
        </nav>
      </div>
    </header>
  );
};
