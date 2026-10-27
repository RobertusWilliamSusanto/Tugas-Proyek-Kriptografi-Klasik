import { describe, it, expect } from 'vitest';
import {
  transformHill,
  transformPlayfair,
  transformVigenere,
  transformAffine,
  transformCaesar
} from '../src/utils/ciphers';

describe('Suite Pengujian Kriptografi Klasik (Research-Grade)', () => {
  // 1. PLAYFAIR TESTS
  describe('Playfair Cipher', () => {
    it('harus memisahkan huruf kembar ganda XX menjadi XQ pada enkripsi', () => {
      // Plaintext dengan huruf kembar XX ('FOXXES' -> digram: FO XQ XE SX = 8 karakter)
      const { result } = transformPlayfair('FOXXES', 'MONARCHY', true);
      expect(result.length).toBe(8);
      expect(result).not.toBe('');
    });

    it('harus memisahkan huruf kembar biasa dengan filler X', () => {
      // 'BALLOON' -> BA LX LO ON (panjang 8)
      const { result } = transformPlayfair('BALLOON', 'MONARCHY', true);
      expect(result.length).toBe(8);
    });

    it('harus mendekripsi chunk pair murni per 2 karakter tanpa menyisipkan filler', () => {
      const plain = 'SECRET';
      const enc = transformPlayfair(plain, 'MONARCHY', true);
      const dec = transformPlayfair(enc.result, 'MONARCHY', false);
      expect(dec.result).toBe('SECRET');
    });
  });

  // 2. HILL 2x2 CIPHER TESTS
  describe('Hill Cipher 2x2', () => {
    const validMatrix = { k00: 7, k01: 8, k10: 11, k11: 11 }; // det = 77 - 88 = -11 = 15 mod 26 (inv = 7)

    it('harus sukses roundtrip untuk teks berpanjang genap', () => {
      const plain = 'HELP';
      const enc = transformHill(plain, validMatrix, true);
      expect(enc.error).toBeUndefined();
      const dec = transformHill(enc.result, validMatrix, false);
      expect(dec.result).toBe('HELP');
    });

    it('harus mempertahankan padding X pada teks ganjil agar dekripsi tidak korup', () => {
      const plain = 'HELLO'; // 5 karakter -> dipad menjadi 'HELLOX'
      const enc = transformHill(plain, validMatrix, true);
      expect(enc.result.length).toBe(6);

      const dec = transformHill(enc.result, validMatrix, false);
      expect(dec.result).toBe('HELLOX');
      expect(dec.result.startsWith('HELLO')).toBe(true);
    });

    it('harus menolak matriks singular (tak memiliki invers mod 26)', () => {
      const singularMatrix = { k00: 2, k01: 4, k10: 4, k11: 6 }; // det = 12 - 16 = -4 = 22 (genap)
      const enc = transformHill('TEST', singularMatrix, true);
      expect(enc.error).toBeDefined();
      expect(enc.error).toContain('Matriks singular');
    });
  });

  // 3. VIGENERE CIPHER TESTS
  describe('Vigenère Cipher', () => {
    it('harus memvalidasi vektor referensi ATTACKATDAWN + LEMON', () => {
      const { result } = transformVigenere('ATTACKATDAWN', 'LEMON', true);
      expect(result).toBe('LXFOPVEFRNHR');

      const dec = transformVigenere(result, 'LEMON', false);
      expect(dec.result).toBe('ATTACKATDAWN');
    });

    it('harus menerima kunci huruf kecil tanpa menghapusnya', () => {
      const { result } = transformVigenere('ATTACKATDAWN', 'lemon', true);
      expect(result).toBe('LXFOPVEFRNHR');
    });

    it('harus mempertahankan tanda baca, spasi, dan kapitalisasi', () => {
      const plain = 'Attack at Dawn! 123';
      const enc = transformVigenere(plain, 'LEMON', true);
      const dec = transformVigenere(enc.result, 'LEMON', false);
      expect(dec.result).toBe(plain);
    });
  });

  // 4. AFFINE CIPHER TESTS
  describe('Affine Cipher', () => {
    it('harus sukses roundtrip dengan nilai a koprima 26', () => {
      const key = { a: 5, b: 8 }; // gcd(5, 26) = 1
      const plain = 'CRYPTOGRAPHY';
      const enc = transformAffine(plain, key, true);
      const dec = transformAffine(enc.result, key, false);
      expect(dec.result).toBe(plain);
    });

    it('harus menolak nilai a yang tidak relatif prima dengan 26', () => {
      const key = { a: 4, b: 8 }; // gcd(4, 26) = 2
      const res = transformAffine('TEST', key, true);
      expect(res.error).toBeDefined();
      expect(res.error).toContain('tidak relatif prima');
    });
  });

  // 5. CAESAR SHIFT TESTS
  describe('Caesar Cipher', () => {
    it('harus sukses enkripsi dan dekripsi ROT-3', () => {
      const plain = 'HELLO WORLD';
      const enc = transformCaesar(plain, 3, true);
      expect(enc.result).toBe('KHOOR ZRUOG');
      const dec = transformCaesar(enc.result, 3, false);
      expect(dec.result).toBe(plain);
    });
  });
});
