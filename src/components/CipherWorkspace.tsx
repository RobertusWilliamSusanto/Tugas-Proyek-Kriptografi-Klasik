import React from 'react';
import { CipherType, OutputFormat } from '../types/crypto';
import { KeyControls } from './KeyControls';
import { mod, modInverse } from '../utils/cryptoMath';
import { ArrowUpDown, RotateCcw, BookmarkPlus, Copy, ClipboardPaste, Info } from 'lucide-react';

interface WorkspaceProps {
  session: ReturnType<typeof import('../hooks/useCryptoSession').useCryptoSession>;
}

export const CipherWorkspace: React.FC<WorkspaceProps> = ({ session }) => {
  const {
    cipher, setCipher,
    mode, setMode,
    inputText, setInputText,
    outputFormat, setOutputFormat,
    formattedOutput,
    error,
    metrics,
    hillMatrix, setHillMatrix,
    vigenereKey, setVigenereKey,
    caesarShift, setCaesarShift,
    affineKey, setAffineKey,
    playfairKey, setPlayfairKey,
    swapText, saveCurrentToHistory,
    showToast
  } = session;

  // Inversi Matriks Hill Murni Menggunakan modInverse dari cryptoMath
  const handleInvertHill = () => {
    if (mode === 'decrypt') {
      showToast('Fungsi dekripsi secara otomatis menghitung invers modular.');
      return;
    }

    const rawDet = (hillMatrix.k00 * hillMatrix.k11) - (hillMatrix.k01 * hillMatrix.k10);
    const modDet = mod(rawDet, 26);
    const inv = modInverse(modDet, 26);

    if (inv === null) {
      showToast('Matriks tidak memiliki balikan dalam modulo 26.');
      return;
    }

    setHillMatrix({
      k00: mod(inv * hillMatrix.k11, 26),
      k01: mod(inv * -hillMatrix.k01, 26),
      k10: mod(inv * -hillMatrix.k10, 26),
      k11: mod(inv * hillMatrix.k00, 26)
    });
    showToast('Matriks berhasil diinversi.');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Disalin ke clipboard.');
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInputText(text);
      showToast('Teks berhasil disematkan.');
    } catch {
      showToast('Izin akses clipboard ditolak.');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Mode Selector & Cipher Engine Tabs */}
      <div className="backdrop-blur-md bg-white/70 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] p-4 rounded-xl shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-wider text-neutral-500">Skema Transformasi</span>
          <div className="flex items-center p-0.5 rounded-lg bg-black/5 dark:bg-black/30 border border-black/5 dark:border-white/5">
            <button
              onClick={() => setMode('encrypt')}
              className={`px-3 py-1 rounded text-xs font-mono transition-all ${
                mode === 'encrypt'
                  ? 'bg-white dark:bg-white/10 text-neutral-900 dark:text-white font-medium shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Enkripsi
            </button>
            <button
              onClick={() => setMode('decrypt')}
              className={`px-3 py-1 rounded text-xs font-mono transition-all ${
                mode === 'decrypt'
                  ? 'bg-white dark:bg-white/10 text-neutral-900 dark:text-white font-medium shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Dekripsi
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 pt-1">
          {[
            { id: 'hill', label: 'Hill 2×2', sub: 'Matriks GL(2)' },
            { id: 'vigenere', label: 'Vigenère', sub: 'Polialfabetik' },
            { id: 'playfair', label: 'Playfair', sub: 'Digraf 5×5' },
            { id: 'affine', label: 'Affine', sub: 'ax + b mod 26' },
            { id: 'caesar', label: 'Caesar', sub: 'Rot-N' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setCipher(item.id as CipherType)}
              className={`p-2 rounded-lg flex flex-col items-center justify-center font-mono transition-all text-center ${
                cipher === item.id
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
                  : 'bg-black/[0.02] dark:bg-white/[0.02] text-neutral-500 hover:bg-black/[0.05] dark:hover:bg-white/[0.05]'
              }`}
            >
              <span className="text-xs font-semibold">{item.label}</span>
              <span className="text-[9px] opacity-70">{item.sub}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Key Configuration Section */}
      <KeyControls
        cipher={cipher}
        mode={mode}
        hillMatrix={hillMatrix}
        setHillMatrix={setHillMatrix}
        vigenereKey={vigenereKey}
        setVigenereKey={setVigenereKey}
        caesarShift={caesarShift}
        setCaesarShift={setCaesarShift}
        affineKey={affineKey}
        setAffineKey={setAffineKey}
        playfairKey={playfairKey}
        setPlayfairKey={setPlayfairKey}
        onInvertHill={handleInvertHill}
      />

      {/* Plaintext / Source Input Terminal Card */}
      <div className="backdrop-blur-md bg-white/70 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] p-4 rounded-xl shadow-sm flex flex-col gap-2">
        <div className="flex items-center justify-between font-mono text-xs">
          <span className="text-neutral-500 uppercase tracking-wider">
            {mode === 'encrypt' ? 'Teks Sumber (Plaintext)' : 'Teks Terenkripsi (Ciphertext)'}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">{inputText.length} karakter</span>
            <button
              onClick={handlePaste}
              className="px-2 py-0.5 rounded bg-black/5 dark:bg-white/10 hover:bg-black/10 text-[11px] transition-colors flex items-center gap-1"
            >
              <ClipboardPaste className="w-3 h-3" />
              <span>Tempel</span>
            </button>
          </div>
        </div>
        <textarea
          rows={3}
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder="Ketik teks alfabet di sini..."
          className="w-full p-3 font-mono text-sm leading-relaxed rounded-lg bg-black/[0.03] dark:bg-black/40 border border-black/10 dark:border-white/10 focus:outline-none resize-none"
        />

        {/* Indikator Pemrosesan Karakter */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
          <Info className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
          {cipher === 'hill' || cipher === 'playfair' ? (
            <span>
              <strong className="text-neutral-700 dark:text-neutral-200">Mode Blok:</strong> Spasi dan simbol diabaikan, diproses sebagai A-Z.
            </span>
          ) : (
            <span>
              <strong className="text-neutral-700 dark:text-neutral-200">Mode Substitusi:</strong> Casing huruf, spasi, dan tanda baca dipertahankan.
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 font-mono text-[11px]">
          <span className="text-neutral-400 shrink-0">Contoh:</span>
          {['DEFENDTHEFORTRESS', 'ATTACK AT DAWN', 'SECRET OF SILENCE'].map(s => (
            <button
              key={s}
              onClick={() => setInputText(s)}
              className="px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300 shrink-0 transition-colors"
            >
              "{s}"
            </button>
          ))}
        </div>
      </div>

      {/* Command Actions Bar */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={swapText}
          className="h-10 rounded-lg bg-white/80 dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] text-xs font-mono flex items-center justify-center gap-1.5 hover:bg-black/[0.02] dark:hover:bg-white/[0.08] transition-colors"
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span>Tukar Teks</span>
        </button>
        <button
          onClick={() => setInputText('')}
          className="h-10 rounded-lg bg-white/80 dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] text-xs font-mono flex items-center justify-center gap-1.5 hover:bg-black/[0.02] dark:hover:bg-white/[0.08] transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Bersihkan</span>
        </button>
        <button
          onClick={saveCurrentToHistory}
          className="h-10 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-mono font-medium flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity shadow-sm"
        >
          <BookmarkPlus className="w-3.5 h-3.5" />
          <span>Simpan Sesi</span>
        </button>
      </div>

      {/* Live Output Transformation Display */}
      <div className="backdrop-blur-md bg-white/70 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] p-4 rounded-xl shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-wider text-neutral-500">
            {mode === 'encrypt' ? 'Keluaran Transformasi (Ciphertext)' : 'Hasil Rekonstruksi (Plaintext)'}
          </span>
          <div className="flex items-center gap-1.5">
            <div className="flex items-center p-0.5 rounded bg-black/5 dark:bg-black/30 font-mono text-[10px]">
              {(['raw', 'blocks', 'hex'] as OutputFormat[]).map(fmt => (
                <button
                  key={fmt}
                  onClick={() => setOutputFormat(fmt)}
                  className={`px-1.5 py-0.5 rounded uppercase ${
                    outputFormat === fmt ? 'bg-white dark:bg-white/10 font-bold' : 'text-neutral-500'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
            <button
              onClick={() => copyToClipboard(formattedOutput)}
              className="px-2 py-0.5 rounded bg-black/5 dark:bg-white/10 hover:bg-black/10 font-mono text-xs flex items-center gap-1"
            >
              <Copy className="w-3 h-3" />
              <span>Salin</span>
            </button>
          </div>
        </div>

        <div className="p-3.5 bg-black/[0.03] dark:bg-black/50 rounded-lg font-mono text-base tracking-widest break-all select-all min-h-[4.5rem] flex items-center leading-relaxed text-neutral-900 dark:text-white">
          {error ? <span className="text-rose-500 text-xs tracking-normal">{error}</span> : (formattedOutput || '---')}
        </div>

        {/* Bento Metrics Matrix */}
        <div className="grid grid-cols-3 gap-2 font-mono pt-1">
          <div className="p-2 bg-black/[0.02] dark:bg-white/[0.02] rounded border border-black/[0.05] dark:border-white/[0.05] flex flex-col">
            <span className="text-[10px] text-neutral-400 uppercase">Entropy (H)</span>
            <span className="text-sm font-bold text-neutral-900 dark:text-white mt-0.5">{metrics.entropy}</span>
          </div>
          <div className="p-2 bg-black/[0.02] dark:bg-white/[0.02] rounded border border-black/[0.05] dark:border-white/[0.05] flex flex-col">
            <span className="text-[10px] text-neutral-400 uppercase">Coincidence Idx</span>
            <span className="text-sm font-bold text-emerald-500 mt-0.5">{metrics.ic}</span>
          </div>
          <div className="p-2 bg-black/[0.02] dark:bg-white/[0.02] rounded border border-black/[0.05] dark:border-white/[0.05] flex flex-col">
            <span className="text-[10px] text-neutral-400 uppercase">Digraf Modulo</span>
            <span className="text-sm font-bold text-neutral-900 dark:text-white mt-0.5">{metrics.digraphCount} Pasang</span>
          </div>
        </div>
      </div>
    </div>
  );
};
