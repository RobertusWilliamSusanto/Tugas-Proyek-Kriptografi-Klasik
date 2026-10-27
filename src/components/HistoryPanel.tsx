import React, { useState, useMemo, useRef } from 'react';
import { HistoryFilter } from '../types/crypto';
import { Download, Upload, Trash2, Play, Copy, Search, FileCode, ChevronDown, ChevronUp } from 'lucide-react';

interface HistoryPanelProps {
  session: ReturnType<typeof import('../hooks/useCryptoSession').useCryptoSession>;
  onLoadItem?: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ session, onLoadItem }) => {
  const {
    history,
    stagedJson,
    setStagedJson,
    clearStagedJson,
    deleteHistoryItem,
    clearAllHistory,
    loadFromHistory,
    exportSessionJson,
    importSessionJson,
    showToast
  } = session;

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<HistoryFilter>('all');
  const [isJsonPreviewOpen, setIsJsonPreviewOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredHistory = useMemo(() => {
    return history.filter(item => {
      const matchFilter = filter === 'all' || item.cipher === filter;
      const q = search.toLowerCase();
      const matchQuery =
        !q ||
        item.plaintext.toLowerCase().includes(q) ||
        item.ciphertext.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q);
      return matchFilter && matchQuery;
    });
  }, [history, filter, search]);

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = ev => {
      const content = ev.target?.result as string;
      setStagedJson(content);
      showToast(`Berkas '${file.name}' siap diintegrasikan.`);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        showToast('Hanya berkas format .json yang didukung.');
        return;
      }
      processFile(file);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Header Sesi & Search Filter */}
      <div className="backdrop-blur-md bg-white/70 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] p-4 rounded-xl shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider">Log Riwayat Sesi</span>
            <span className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 font-mono text-[10px]">
              {history.length} Entri
            </span>
          </div>
          <button
            onClick={clearAllHistory}
            className="text-rose-500 hover:text-rose-600 font-mono text-xs transition-colors"
          >
            Bersihkan Semua
          </button>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari plaintext, ciphertext, atau ID..."
            className="w-full pl-9 pr-3 py-1.5 font-mono text-xs rounded-lg bg-black/[0.03] dark:bg-black/30 border border-black/10 dark:border-white/10 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto font-mono text-[11px] pb-1">
          {(['all', 'hill', 'vigenere', 'playfair', 'affine', 'caesar'] as HistoryFilter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-0.5 rounded-full capitalize shrink-0 transition-colors ${
                filter === f
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-medium'
                  : 'bg-black/5 dark:bg-white/5 text-neutral-500 hover:bg-black/10'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Daftar Kartu Riwayat */}
      <div className="flex flex-col gap-2.5 max-h-[460px] overflow-y-auto pr-1">
        {filteredHistory.length === 0 ? (
          <div className="p-8 text-center font-mono text-xs text-neutral-400 bg-black/[0.02] dark:bg-white/[0.02] rounded-xl border border-dashed border-black/10 dark:border-white/10">
            Tidak ada riwayat kalkulasi yang cocok.
          </div>
        ) : (
          filteredHistory.map(item => (
            <div
              key={item.id}
              className="backdrop-blur-md bg-white/70 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] p-3.5 rounded-xl shadow-sm flex flex-col gap-2 font-mono"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 font-bold uppercase text-[10px]">
                    {item.cipherLabel}
                  </span>
                  <span className="text-neutral-400">#{item.id}</span>
                </div>
                <span className="text-neutral-400 text-[10px]">{item.timeFormatted}</span>
              </div>

              <div className="flex flex-col gap-1 text-xs">
                <div className="flex gap-2">
                  <span className="text-neutral-400 text-[10px] w-12 shrink-0">PLAIN:</span>
                  <span className="text-neutral-800 dark:text-neutral-200 truncate">{item.plaintext}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-neutral-400 text-[10px] w-12 shrink-0">CIPHER:</span>
                  <span className="text-emerald-500 font-semibold truncate">{item.ciphertext}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-neutral-400 text-[10px] w-12 shrink-0">KUNCI:</span>
                  <span className="text-neutral-500 truncate">{item.keyDetails}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-black/5 dark:border-white/5">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(item.ciphertext);
                    showToast('Ciphertext disalin.');
                  }}
                  className="px-2 py-0.5 rounded bg-black/5 dark:bg-white/10 hover:bg-black/10 text-[11px] flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>Salin</span>
                </button>
                <button
                  onClick={() => loadFromHistory(item, onLoadItem)}
                  className="px-2 py-0.5 rounded bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-[11px] font-medium flex items-center gap-1"
                >
                  <Play className="w-3 h-3" />
                  <span>Muat</span>
                </button>
                <button
                  onClick={() => deleteHistoryItem(item.id)}
                  className="p-1 rounded text-rose-500 hover:bg-rose-500/10 text-[11px]"
                  title="Hapus Entri"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 3. Kelola Berkas JSON (Dropzone Anti-Flicker) */}
      <div className="backdrop-blur-md bg-white/70 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] p-4 rounded-xl shadow-sm flex flex-col gap-3 font-mono text-xs">
        <div className="flex items-center justify-between">
          <span className="uppercase tracking-wider text-neutral-500 font-semibold flex items-center gap-1.5">
            <FileCode className="w-3.5 h-3.5" />
            Kelola Berkas JSON
          </span>
          <span className="text-[10px] text-neutral-400">RFC-8259 v1.2</span>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-lg bg-black/[0.02] dark:bg-black/20 border border-black/5 dark:border-white/5">
          <div className="flex flex-col">
            <span className="font-semibold text-neutral-900 dark:text-white">Ekspor Sesi Riwayat</span>
            <span className="text-[10px] text-neutral-400">{history.length} rekaman tersimpan</span>
          </div>
          <button
            onClick={exportSessionJson}
            className="px-3 py-1.5 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-medium flex items-center gap-1.5 hover:opacity-90 transition-opacity"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh JSON</span>
          </button>
        </div>

        {/* Dropzone dengan pointer-events-none pada anak elemen untuk mengeliminasi flickering */}
        <label
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`cursor-pointer flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed transition-all select-none ${
            isDragging
              ? 'border-emerald-500 bg-emerald-500/10 scale-[0.99]'
              : 'border-black/10 dark:border-white/10 hover:border-neutral-400'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Upload className="w-6 h-6 text-neutral-400 mb-1 pointer-events-none" />
          <span className="font-medium text-neutral-800 dark:text-neutral-200 pointer-events-none">
            {stagedJson ? 'File Siap Diimpor' : 'Tarik & Lepas File JSON Sini'}
          </span>
          <span className="text-[10px] text-neutral-400 mt-0.5 pointer-events-none">
            Atau klik untuk menelusuri disk lokal
          </span>
        </label>

        <div className="rounded-lg bg-black/[0.02] dark:bg-black/30 border border-black/5 dark:border-white/5 overflow-hidden">
          <button
            type="button"
            onClick={() => setIsJsonPreviewOpen(prev => !prev)}
            className="w-full flex items-center justify-between p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <span>Pratinjau Struktur Skema JSON</span>
            {isJsonPreviewOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {isJsonPreviewOpen && (
            <pre className="p-2.5 text-[10px] overflow-x-auto text-neutral-600 dark:text-neutral-300 border-t border-black/5 dark:border-white/5 leading-relaxed">
{`{
  "suite_version": "1.2.0",
  "records": [
    { "id": "HIL-9821", "cipher": "hill", "plaintext": "...", "ciphertext": "..." }
  ]
}`}
            </pre>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            disabled={!stagedJson}
            onClick={() => {
              if (stagedJson) {
                importSessionJson(stagedJson, 'replace');
                clearStagedJson();
                if (fileInputRef.current) fileInputRef.current.value = '';
              }
            }}
            className="h-9 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 disabled:opacity-40 transition-colors font-medium"
          >
            Ganti Semua
          </button>
          <button
            disabled={!stagedJson}
            onClick={() => {
              if (stagedJson) {
                importSessionJson(stagedJson, 'merge');
                clearStagedJson();
                if (fileInputRef.current) fileInputRef.current.value = '';
              }
            }}
            className="h-9 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 disabled:opacity-40 transition-colors font-medium"
          >
            Gabungkan (Merge)
          </button>
        </div>
      </div>
    </div>
  );
};
