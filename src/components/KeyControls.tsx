import React from 'react';
import { CipherType, TransformMode, HillKey, AffineKey } from '../types/crypto';
import { gcd, mod, modInverse } from '../utils/cryptoMath';
import { Grid3x3, Key, ArrowLeftRight } from 'lucide-react';

interface KeyControlsProps {
  cipher: CipherType;
  mode: TransformMode;
  hillMatrix: HillKey;
  setHillMatrix: React.Dispatch<React.SetStateAction<HillKey>>;
  vigenereKey: string;
  setVigenereKey: (k: string) => void;
  caesarShift: number;
  setCaesarShift: (s: number) => void;
  affineKey: AffineKey;
  setAffineKey: React.Dispatch<React.SetStateAction<AffineKey>>;
  playfairKey: string;
  setPlayfairKey: (k: string) => void;
  onInvertHill: () => void;
}

export const KeyControls: React.FC<KeyControlsProps> = ({
  cipher,
  mode,
  hillMatrix, setHillMatrix,
  vigenereKey, setVigenereKey,
  caesarShift, setCaesarShift,
  affineKey, setAffineKey,
  playfairKey, setPlayfairKey,
  onInvertHill
}) => {
  const rawDet = (hillMatrix.k00 * hillMatrix.k11) - (hillMatrix.k01 * hillMatrix.k10);
  const modDet = mod(rawDet, 26);
  const g = gcd(modDet, 26);
  const invDet = modInverse(modDet, 26);
  const isHillValid = g === 1 && invDet !== null;

  const modA = mod(affineKey.a, 26);
  const gcdA = gcd(modA, 26);
  const invA = modInverse(modA, 26);
  const isAffineValid = gcdA === 1 && invA !== null;

  return (
    <div className="backdrop-blur-md bg-white/70 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] p-4 rounded-xl shadow-sm">
      {/* 1. HILL CIPHER PARAMETERS */}
      {cipher === 'hill' && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between pb-1">
            <span className="font-mono text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
              <Grid3x3 className="w-3.5 h-3.5" />
              Matriks Kunci K ∈ GL(2, ℤ₂₆)
            </span>
            <div className="flex items-center gap-2">
              {mode === 'decrypt' && (
                <span className="text-[10px] text-neutral-400 hidden sm:inline" title="Inversi modular diterapkan otomatis saat dekripsi">
                  (Otomatis saat dekripsi)
                </span>
              )}
              <button
                onClick={onInvertHill}
                disabled={mode === 'decrypt'}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-colors flex items-center gap-1 ${
                  mode === 'decrypt'
                    ? 'opacity-40 cursor-not-allowed bg-black/5 dark:bg-white/5 text-neutral-400'
                    : 'bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 cursor-pointer'
                }`}
                title={
                  mode === 'decrypt'
                    ? 'Fungsi dekripsi secara otomatis menghitung invers modular matriks K⁻¹ secara matematis. Tombol ini dikunci guna mencegah inversi ganda.'
                    : 'Hitung Invers Modular Matriks K⁻¹'
                }
                type="button"
              >
                <ArrowLeftRight className="w-3 h-3" />
                <span>K⁻¹ Invers</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Grid 2x2 */}
            <div className="md:col-span-5 flex items-center justify-center gap-2 p-2 bg-black/[0.03] dark:bg-black/30 rounded-lg">
              <span className="text-neutral-400 font-mono text-xl select-none">[</span>
              <div className="grid grid-cols-2 gap-2">
                {(['k00', 'k01', 'k10', 'k11'] as const).map(k => (
                  <input
                    key={k}
                    type="number"
                    value={hillMatrix[k]}
                    onChange={e => setHillMatrix(prev => ({ ...prev, [k]: parseInt(e.target.value) || 0 }))}
                    className="w-14 h-10 text-center font-mono text-base font-semibold rounded bg-white dark:bg-white/10 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                  />
                ))}
              </div>
              <span className="text-neutral-400 font-mono text-xl select-none">]</span>
            </div>

            {/* Inspeksi Determinan */}
            <div className="md:col-span-7 flex flex-col gap-1 p-2.5 bg-black/[0.02] dark:bg-white/[0.02] rounded-lg font-mono text-xs">
              <div className="flex justify-between text-neutral-500">
                <span>ad - bc = {rawDet}</span>
                <span className="font-semibold text-neutral-900 dark:text-white">det(K) ≡ {modDet} mod 26</span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>gcd(det, 26) = {g}</span>
                <span className="text-emerald-500">{invDet !== null ? `det⁻¹ ≡ ${invDet}` : 'Tak Ada'}</span>
              </div>
              <div
                className={`mt-1 py-0.5 px-2 rounded text-center font-medium ${
                  isHillValid ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                }`}
              >
                {isHillValid ? 'Matriks Valid & Invertibel' : 'Singular: Tidak Dapat Didekripsi'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. VIGENERE PARAMETERS */}
      {cipher === 'vigenere' && (
        <div className="flex flex-col gap-2">
          <label className="font-mono text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5" />
            Kata Kunci Alfabet (A-Z)
          </label>
          <input
            type="text"
            value={vigenereKey}
            onChange={e => setVigenereKey(e.target.value.toUpperCase())}
            placeholder="CONTOH: LEMON"
            className="w-full h-11 px-3 font-mono text-sm tracking-widest uppercase rounded-lg bg-white dark:bg-black/30 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-1 focus:ring-neutral-400"
          />
        </div>
      )}

      {/* 3. CAESAR PARAMETERS */}
      {cipher === 'caesar' && (
        <div className="flex flex-col gap-2">
          <div className="flex justify-between font-mono text-xs text-neutral-500">
            <span>Pergeseran Karakter (Shift)</span>
            <span className="font-bold text-neutral-900 dark:text-white">ROT-{caesarShift}</span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="1"
              max="25"
              value={caesarShift}
              onChange={e => setCaesarShift(parseInt(e.target.value))}
              className="w-full accent-neutral-900 dark:accent-white cursor-pointer"
            />
            <span className="w-8 font-mono text-right text-sm font-bold">{caesarShift}</span>
          </div>
        </div>
      )}

      {/* 4. AFFINE PARAMETERS */}
      {cipher === 'affine' && (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-mono text-xs text-neutral-500">Pengali a [gcd(a,26)=1]</label>
              <input
                type="number"
                value={affineKey.a}
                onChange={e => setAffineKey(prev => ({ ...prev, a: parseInt(e.target.value) || 1 }))}
                className="h-10 text-center font-mono rounded bg-white dark:bg-black/30 border border-black/10 dark:border-white/10"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-mono text-xs text-neutral-500">Pergeseran b [0..25]</label>
              <input
                type="number"
                value={affineKey.b}
                onChange={e => setAffineKey(prev => ({ ...prev, b: parseInt(e.target.value) || 0 }))}
                className="h-10 text-center font-mono rounded bg-white dark:bg-black/30 border border-black/10 dark:border-white/10"
              />
            </div>
          </div>

          {/* Inspeksi Visual Real-Time gcd(a, 26) */}
          <div className="flex flex-col gap-1 p-2.5 bg-black/[0.02] dark:bg-white/[0.02] rounded-lg font-mono text-xs">
            <div className="flex justify-between items-center text-neutral-500">
              <span>gcd(a mod 26, 26) = gcd({modA}, 26) = <strong className="text-neutral-900 dark:text-white">{gcdA}</strong></span>
              <span className={isAffineValid ? 'text-emerald-500 font-semibold' : 'text-rose-500 font-semibold'}>
                {isAffineValid ? `a⁻¹ ≡ ${invA} mod 26` : 'Tak Ada Invers'}
              </span>
            </div>
            <div
              className={`mt-1 py-0.5 px-2 rounded text-center font-medium ${
                isAffineValid
                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
              }`}
            >
              {isAffineValid
                ? 'Kunci a Valid: Koprima dengan 26'
                : `Non-Koprima: gcd(${modA}, 26) = ${gcdA} ≠ 1 (Gagal Dekripsi)`}
            </div>
          </div>
        </div>
      )}

      {/* 5. PLAYFAIR PARAMETERS */}
      {cipher === 'playfair' && (
        <div className="flex flex-col gap-2">
          <label className="font-mono text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Kunci Matriks 5×5 (I/J Disatukan)
          </label>
          <input
            type="text"
            value={playfairKey}
            onChange={e => setPlayfairKey(e.target.value.toUpperCase())}
            placeholder="CONTOH: MONARCHY"
            className="w-full h-11 px-3 font-mono text-sm tracking-widest uppercase rounded-lg bg-white dark:bg-black/30 border border-black/10 dark:border-white/10 focus:outline-none"
          />
        </div>
      )}
    </div>
  );
};
