import { mod, modInverse } from './cryptoMath';
import { HillKey, AffineKey } from '../types/crypto';

// 1. Hill Cipher 2x2
export function transformHill(
  text: string,
  matrix: HillKey,
  isEncrypt: boolean
): { result: string; error?: string } {
  const { k00, k01, k10, k11 } = matrix;
  const det = (k00 * k11) - (k01 * k10);
  const detMod26 = mod(det, 26);
  const invDet = modInverse(detMod26, 26);

  if (invDet === null) {
    return {
      result: '',
      error: 'Matriks singular dalam ℤ₂₆ (gcd(det, 26) ≠ 1). Invers modular tidak ditemukan.'
    };
  }

  let m00 = mod(k00, 26);
  let m01 = mod(k01, 26);
  let m10 = mod(k10, 26);
  let m11 = mod(k11, 26);

  if (!isEncrypt) {
    m00 = mod(k11 * invDet, 26);
    m01 = mod(-k01 * invDet, 26);
    m10 = mod(-k10 * invDet, 26);
    m11 = mod(k00 * invDet, 26);
  }

  let clean = text.toUpperCase().replace(/[^A-Z]/g, '');
  if (clean.length % 2 !== 0) {
    clean += 'X'; // Pertahankan panjang genap
  }

  let out = '';
  for (let i = 0; i < clean.length; i += 2) {
    const p1 = clean.charCodeAt(i) - 65;
    const p2 = clean.charCodeAt(i + 1) - 65;
    const c1 = mod(m00 * p1 + m01 * p2, 26);
    const c2 = mod(m10 * p1 + m11 * p2, 26);
    out += String.fromCharCode(c1 + 65, c2 + 65);
  }

  return { result: out };
}

// 2. Vigenère Cipher
export function transformVigenere(
  text: string,
  rawKey: string,
  isEncrypt: boolean
): { result: string; error?: string } {
  const cleanKey = rawKey.toUpperCase().replace(/[^A-Z]/g, '');
  if (!cleanKey.length) {
    return { result: '', error: 'Kunci Vigenère harus berisi minimal 1 karakter alfabet (A-Z).' };
  }

  let out = '';
  let kIdx = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (/[A-Za-z]/.test(ch)) {
      const isUpper = ch === ch.toUpperCase();
      const base = isUpper ? 65 : 97;
      const p = ch.charCodeAt(0) - base;
      const k = cleanKey.charCodeAt(kIdx % cleanKey.length) - 65;
      const c = isEncrypt ? mod(p + k, 26) : mod(p - k, 26);
      out += String.fromCharCode(c + base);
      kIdx++;
    } else {
      out += ch;
    }
  }

  return { result: out };
}

// 3. Caesar Shift
export function transformCaesar(
  text: string,
  shift: number,
  isEncrypt: boolean
): { result: string } {
  const s = isEncrypt ? shift : -shift;
  const out = text
    .split('')
    .map(ch => {
      if (/[a-z]/.test(ch)) return String.fromCharCode(mod(ch.charCodeAt(0) - 97 + s, 26) + 97);
      if (/[A-Z]/.test(ch)) return String.fromCharCode(mod(ch.charCodeAt(0) - 65 + s, 26) + 65);
      return ch;
    })
    .join('');
  return { result: out };
}

// 4. Affine Cipher
export function transformAffine(
  text: string,
  key: AffineKey,
  isEncrypt: boolean
): { result: string; error?: string } {
  const { a, b } = key;
  const invA = modInverse(a, 26);
  if (invA === null) {
    return { result: '', error: `Nilai a (${a}) tidak relatif prima dengan 26. Dekripsi mustahil.` };
  }

  const out = text
    .split('')
    .map(ch => {
      if (/[A-Za-z]/.test(ch)) {
        const isUpper = ch === ch.toUpperCase();
        const base = isUpper ? 65 : 97;
        const x = ch.charCodeAt(0) - base;
        const y = isEncrypt ? mod(a * x + b, 26) : mod(invA * (x - b), 26);
        return String.fromCharCode(y + base);
      }
      return ch;
    })
    .join('');

  return { result: out };
}

// 5. Playfair Cipher (Pemisahan Logika Enkripsi & Dekripsi)
export function transformPlayfair(
  text: string,
  rawKey: string,
  isEncrypt: boolean
): { result: string; error?: string } {
  const key = (
    rawKey.toUpperCase().replace(/[^A-Z]/g, '').replace(/J/g, 'I') +
    'ABCDEFGHIKLMNOPQRSTUVWXYZ'
  );

  const seen = new Set<string>();
  const matrixChars: string[] = [];
  for (let i = 0; i < key.length; i++) {
    const c = key[i];
    if (!seen.has(c)) {
      seen.add(c);
      matrixChars.push(c);
    }
  }

  const pos: Record<string, { r: number; c: number }> = {};
  for (let i = 0; i < 25; i++) {
    pos[matrixChars[i]] = { r: Math.floor(i / 5), c: i % 5 };
  }

  const cleanText = text.toUpperCase().replace(/[^A-Z]/g, '').replace(/J/g, 'I');
  if (!cleanText.length) return { result: '' };

  const digraphs: string[] = [];

  if (isEncrypt) {
    // ENKRIPSI: Aturan penanganan huruf kembar & padding akhir
    for (let i = 0; i < cleanText.length; i++) {
      const c1 = cleanText[i];
      const c2 = cleanText[i + 1];

      if (!c2) {
        // Teks ganjil di akhir: pad dengan 'X', atau 'Q' jika karakter terakhir adalah 'X'
        digraphs.push(c1 + (c1 === 'X' ? 'Q' : 'X'));
      } else if (c1 === c2) {
        // Huruf kembar 'XX' disubstitusi jadi 'XQ', lainnya 'X'
        const filler = c1 === 'X' ? 'Q' : 'X';
        digraphs.push(c1 + filler);
      } else {
        digraphs.push(c1 + c2);
        i++; // Karakter c2 sudah berpasangan
      }
    }
  } else {
    // DEKRIPSI: Dipotong murni per 2 karakter (chunk pairs) tanpa menyisipkan filler
    for (let i = 0; i < cleanText.length; i += 2) {
      const c1 = cleanText[i];
      const c2 = cleanText[i + 1] || 'X';
      digraphs.push(c1 + c2);
    }
  }

  const shift = isEncrypt ? 1 : 4;
  let out = '';

  for (let i = 0; i < digraphs.length; i++) {
    const pair = digraphs[i];
    const p1 = pos[pair[0]] || { r: 0, c: 0 };
    const p2 = pos[pair[1]] || { r: 0, c: 0 };

    if (p1.r === p2.r) {
      // Baris sama
      out += matrixChars[p1.r * 5 + mod(p1.c + shift, 5)];
      out += matrixChars[p2.r * 5 + mod(p2.c + shift, 5)];
    } else if (p1.c === p2.c) {
      // Kolom sama
      out += matrixChars[mod(p1.r + shift, 5) * 5 + p1.c];
      out += matrixChars[mod(p2.r + shift, 5) * 5 + p2.c];
    } else {
      // Persegi panjang
      out += matrixChars[p1.r * 5 + p2.c];
      out += matrixChars[p2.r * 5 + p1.c];
    }
  }

  return { result: out };
}
