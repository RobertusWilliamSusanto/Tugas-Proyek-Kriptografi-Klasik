export type CipherType = 'hill' | 'vigenere' | 'caesar' | 'affine' | 'playfair';
export type TransformMode = 'encrypt' | 'decrypt';
export type OutputFormat = 'raw' | 'blocks' | 'hex';
export type HistoryFilter = 'all' | CipherType;

export interface HillKey {
  k00: number;
  k01: number;
  k10: number;
  k11: number;
}

export interface AffineKey {
  a: number;
  b: number;
}

export interface HistoryItem {
  id: string;
  cipher: CipherType;
  cipherLabel: string;
  mode: TransformMode;
  timestamp: number;
  timeFormatted: string;
  plaintext: string;
  ciphertext: string;
  keyDetails: string;
  keyState?: {
    hillMatrix?: [number, number, number, number];
    vigenereKey?: string;
    caesarShift?: number;
    affineKey?: AffineKey;
    playfairKey?: string;
  };
  metrics: {
    entropy: string;
    ic: string;
  };
}

export interface SessionExportPayload {
  suite_version: string;
  exported_at: string;
  records_count: number;
  records: HistoryItem[];
}
