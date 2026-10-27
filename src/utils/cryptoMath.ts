/**
 * Modul Aljabar Modular Euclidean & Kriptometri
 */

export function mod(n: number, m: number = 26): number {
  return ((n % m) + m) % m;
}

export function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
}

export function modInverse(a: number, m: number = 26): number | null {
  const cleanA = mod(a, m);
  for (let x = 1; x < m; x++) {
    if ((cleanA * x) % m === 1) return x;
  }
  return null;
}

/**
 * Menghitung Entropi Shannon (H).
 * Normalisasi toUpperCase() diterapkan agar karakter huruf kecil dan besar
 * diperhitungkan pada simbol alfabet yang identik.
 */
export function computeEntropy(text: string): string {
  const clean = text.toUpperCase().replace(/[^A-Z]/g, '');
  if (!clean.length) return '0.00';

  const freqs: Record<string, number> = {};
  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    freqs[char] = (freqs[char] || 0) + 1;
  }

  let entropy = 0;
  for (const char in freqs) {
    const p = freqs[char] / clean.length;
    entropy -= p * Math.log2(p);
  }
  return entropy.toFixed(2);
}

/**
 * Menghitung Indeks Koinsidensi (IC)
 */
export function computeIC(text: string): string {
  const clean = text.toUpperCase().replace(/[^A-Z]/g, '');
  const N = clean.length;
  if (N <= 1) return '0.0000';

  const counts = new Array<number>(26).fill(0);
  for (let i = 0; i < N; i++) {
    counts[clean.charCodeAt(i) - 65]++;
  }

  let sum = 0;
  for (let i = 0; i < 26; i++) {
    sum += counts[i] * (counts[i] - 1);
  }

  const ic = sum / (N * (N - 1));
  return ic.toFixed(4);
}
