import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

const THEME_KEY = 'theme_preference';

export const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    // 1. Cek penyimpanan persistensi localStorage
    try {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored === 'dark') return true;
      if (stored === 'light') return false;
    } catch {
      // Fallback jika akses localStorage dibatasi/error
    }

    // 2. Jika tidak ada preferensi tersimpan, ikuti preferensi media query OS
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    // 3. Fallback ke kelas HTML saat ini
    return typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      try {
        localStorage.setItem(THEME_KEY, 'dark');
      } catch (e) {
        console.warn('Gagal menyimpan tema gelap ke localStorage', e);
      }
    } else {
      root.classList.remove('dark');
      try {
        localStorage.setItem(THEME_KEY, 'light');
      } catch (e) {
        console.warn('Gagal menyimpan tema terang ke localStorage', e);
      }
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(prev => !prev)}
      className="w-9 h-9 flex items-center justify-center rounded-lg bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.08] text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white hover:bg-black/[0.08] dark:hover:bg-white/[0.1] transition-all cursor-pointer"
      title={isDark ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
      type="button"
      aria-label="Toggle Theme"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-neutral-700 transition-transform hover:-rotate-12" />
      )}
    </button>
  );
};
