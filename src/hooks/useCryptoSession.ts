import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CipherType,
  TransformMode,
  OutputFormat,
  HistoryItem,
  HillKey,
  AffineKey,
  SessionExportPayload
} from '../types/crypto';
import {
  transformHill,
  transformVigenere,
  transformCaesar,
  transformAffine,
  transformPlayfair
} from '../utils/ciphers';
import { computeEntropy, computeIC, mod } from '../utils/cryptoMath';

const STORAGE_KEY = 'classical_crypto_session_v1';

function isValidHistoryItem(item: unknown): item is HistoryItem {
  if (typeof item !== 'object' || item === null) return false;
  const rec = item as Record<string, unknown>;
  return (
    typeof rec.id === 'string' &&
    typeof rec.plaintext === 'string' &&
    typeof rec.ciphertext === 'string' &&
    typeof rec.cipher === 'string' &&
    ['hill', 'vigenere', 'caesar', 'affine', 'playfair'].includes(rec.cipher)
  );
}

export function useCryptoSession() {
  const [cipher, setCipher] = useState<CipherType>('hill');
  const [mode, setMode] = useState<TransformMode>('encrypt');
  const [inputText, setInputText] = useState('DEFENDTHEFORTRESS');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('raw');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Status Ekspor untuk Proteksi Tab & State Penampung JSON
  const [hasUnexportedHistory, setHasUnexportedHistory] = useState(false);
  const [stagedJson, setStagedJson] = useState<string | null>(null);

  // Parameter Kunci
  const [hillMatrix, setHillMatrix] = useState<HillKey>({ k00: 7, k01: 8, k10: 11, k11: 11 });
  const [vigenereKey, setVigenereKey] = useState('LEMON');
  const [caesarShift, setCaesarShift] = useState(3);
  const [affineKey, setAffineKey] = useState<AffineKey>({ a: 5, b: 8 });
  const [playfairKey, setPlayfairKey] = useState('MONARCHY');

  // History State
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Gagal memuat sesi sessionStorage', e);
    }
    return [
      {
        id: 'HIL-9821',
        cipher: 'hill',
        cipherLabel: 'HILL 2X2',
        mode: 'encrypt',
        timestamp: Date.now() - 120000,
        timeFormatted: '2 mnt lalu',
        plaintext: 'DEFENDTHEFORTRESS',
        ciphertext: 'PHHWXVEQJMRVYXOPXX',
        keyDetails: '[7, 8 ; 11, 11] det(K)=15',
        keyState: { hillMatrix: [7, 8, 11, 11] },
        metrics: { entropy: '3.63', ic: '0.0382' }
      }
    ];
  });

  // Sinkronisasi sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.error('SessionStorage overflow', e);
    }
  }, [history]);

  // Proteksi BeforeUnload jika terdapat data belum diekspor
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (history.length > 0 && hasUnexportedHistory) {
        e.preventDefault();
        e.returnValue = 'Terdapat rekaman riwayat yang belum diekspor ke file JSON. Yakin ingin keluar?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [history.length, hasUnexportedHistory]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  }, []);

  const clearStagedJson = useCallback(() => {
    setStagedJson(null);
  }, []);

  // Pipeline Transformasi Reaktif
  const transformationResult = useMemo<{ result: string; error?: string }>(() => {
    const isEnc = mode === 'encrypt';
    switch (cipher) {
      case 'hill':
        return transformHill(inputText, hillMatrix, isEnc);
      case 'vigenere':
        return transformVigenere(inputText, vigenereKey, isEnc);
      case 'caesar':
        return transformCaesar(inputText, caesarShift, isEnc);
      case 'affine':
        return transformAffine(inputText, affineKey, isEnc);
      case 'playfair':
        return transformPlayfair(inputText, playfairKey, isEnc);
      default:
        return { result: inputText };
    }
  }, [cipher, mode, inputText, hillMatrix, vigenereKey, caesarShift, affineKey, playfairKey]);

  // Format Luaran
  const formattedOutput = useMemo(() => {
    const raw = transformationResult.result;
    if (outputFormat === 'blocks') {
      return raw.replace(/\s+/g, '').match(/.{1,5}/g)?.join(' ') || raw;
    }
    if (outputFormat === 'hex') {
      return Array.from(raw)
        .map(c => '0x' + c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0'))
        .join(' ');
    }
    return raw;
  }, [transformationResult.result, outputFormat]);

  // Metrik Kuantitatif
  const metrics = useMemo(() => ({
    entropy: computeEntropy(transformationResult.result),
    ic: computeIC(transformationResult.result),
    digraphCount: Math.ceil(inputText.replace(/[^A-Za-z]/g, '').length / 2)
  }), [transformationResult.result, inputText]);

  // Format Deskripsi Kunci Akurat
  const resolveKeyDetails = useCallback((): string => {
    switch (cipher) {
      case 'hill': {
        const rawDet = (hillMatrix.k00 * hillMatrix.k11) - (hillMatrix.k01 * hillMatrix.k10);
        return `[${hillMatrix.k00}, ${hillMatrix.k01} ; ${hillMatrix.k10}, ${hillMatrix.k11}] det(K)=${mod(rawDet, 26)}`;
      }
      case 'vigenere':
        return `Kunci: ${vigenereKey || 'KUNCI'}`;
      case 'caesar':
        return `Pergeseran: ${caesarShift} (ROT-${caesarShift})`;
      case 'affine':
        return `a=${affineKey.a}, b=${affineKey.b}`;
      case 'playfair':
        return `Matriks Kunci: ${playfairKey || 'MONARCHY'}`;
      default:
        return '-';
    }
  }, [cipher, hillMatrix, vigenereKey, caesarShift, affineKey, playfairKey]);

  const swapText = useCallback(() => {
    if (!transformationResult.result) return;
    setInputText(transformationResult.result);
    setMode(prev => (prev === 'encrypt' ? 'decrypt' : 'encrypt'));
    showToast('Teks ditukar dan mode diselaraskan.');
  }, [transformationResult.result, showToast]);

  const saveCurrentToHistory = useCallback(() => {
    // Validasi pencegahan error kunci
    if (transformationResult.error) {
      showToast(`Peringatan Kunci: ${transformationResult.error}`);
      return;
    }

    if (!inputText.trim()) {
      showToast('Teks masukan kosong.');
      return;
    }

    const id = `${cipher.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newItem: HistoryItem = {
      id,
      cipher,
      cipherLabel: cipher === 'hill' ? 'HILL 2X2' : cipher.toUpperCase(),
      mode,
      timestamp: Date.now(),
      timeFormatted: 'Baru saja',
      plaintext: inputText,
      ciphertext: transformationResult.result,
      keyDetails: resolveKeyDetails(),
      keyState: {
        hillMatrix: [hillMatrix.k00, hillMatrix.k01, hillMatrix.k10, hillMatrix.k11],
        vigenereKey,
        caesarShift,
        affineKey,
        playfairKey
      },
      metrics: {
        entropy: metrics.entropy,
        ic: metrics.ic
      }
    };

    setHistory(prev => [newItem, ...prev]);
    setHasUnexportedHistory(true);
    showToast('Riwayat berhasil diarsipkan.');
  }, [
    cipher,
    mode,
    inputText,
    transformationResult,
    resolveKeyDetails,
    hillMatrix,
    vigenereKey,
    caesarShift,
    affineKey,
    playfairKey,
    metrics,
    showToast
  ]);

  const deleteHistoryItem = useCallback((id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
    setHasUnexportedHistory(true);
    showToast('Entri riwayat dihapus.');
  }, [showToast]);

  const clearAllHistory = useCallback(() => {
    setHistory([]);
    sessionStorage.removeItem(STORAGE_KEY);
    setHasUnexportedHistory(false);
    showToast('Semua riwayat dibersihkan.');
  }, [showToast]);

  // Robust loading with optional chaining
  const loadFromHistory = useCallback(
    (item: HistoryItem, onLoaded?: () => void) => {
      setInputText(item.plaintext);
      setCipher(item.cipher);
      setMode(item.mode);

      if (item.keyState?.hillMatrix) {
        const [k00, k01, k10, k11] = item.keyState.hillMatrix;
        setHillMatrix({ k00, k01, k10, k11 });
      }
      if (item.keyState?.vigenereKey) setVigenereKey(item.keyState.vigenereKey);
      if (item.keyState?.caesarShift !== undefined) setCaesarShift(item.keyState.caesarShift);
      if (item.keyState?.affineKey) setAffineKey(item.keyState.affineKey);
      if (item.keyState?.playfairKey) setPlayfairKey(item.keyState.playfairKey);

      showToast(`Parameter #${item.id} dimuat ke kalkulator.`);
      if (onLoaded) onLoaded();
    },
    [showToast]
  );

  const exportSessionJson = useCallback(() => {
    const payload: SessionExportPayload = {
      suite_version: '1.2.0',
      exported_at: new Date().toISOString(),
      records_count: history.length,
      records: history
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crypto-session-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setHasUnexportedHistory(false);
    showToast('Berkas JSON riwayat berhasil diunduh.');
  }, [history, showToast]);

  const importSessionJson = useCallback(
    (jsonString: string, importMode: 'merge' | 'replace') => {
      try {
        const parsed = JSON.parse(jsonString);
        if (!parsed || !Array.isArray(parsed.records)) {
          throw new Error("Struktur JSON tidak valid: Properti 'records' harus berupa array.");
        }

        const validRecords: HistoryItem[] = [];
        for (let i = 0; i < parsed.records.length; i++) {
          const item = parsed.records[i];
          if (!isValidHistoryItem(item)) {
            throw new Error(`Data record ke-${i + 1} tidak valid (properti id, plaintext, ciphertext, cipher harus string).`);
          }
          validRecords.push(item);
        }

        setHistory(prev => (importMode === 'replace' ? validRecords : [...validRecords, ...prev]));
        setHasUnexportedHistory(true);
        clearStagedJson();
        showToast(`Impor berhasil (${validRecords.length} entri disinkronkan).`);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Gagal memproses file JSON.';
        showToast(msg);
      }
    },
    [showToast, clearStagedJson]
  );

  return {
    cipher, setCipher,
    mode, setMode,
    inputText, setInputText,
    outputFormat, setOutputFormat,
    rawOutput: transformationResult.result,
    formattedOutput,
    error: transformationResult.error,
    metrics,
    // Keys
    hillMatrix, setHillMatrix,
    vigenereKey, setVigenereKey,
    caesarShift, setCaesarShift,
    affineKey, setAffineKey,
    playfairKey, setPlayfairKey,
    // History & JSON State
    history,
    stagedJson,
    setStagedJson,
    clearStagedJson,
    saveCurrentToHistory,
    deleteHistoryItem,
    clearAllHistory,
    loadFromHistory,
    exportSessionJson,
    importSessionJson,
    // Utilities
    swapText,
    toastMessage,
    showToast
  };
}
