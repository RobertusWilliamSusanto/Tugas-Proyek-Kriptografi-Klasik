<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CryptoController extends Controller
{
    public function index() {
        $datas = DB::select('SELECT * FROM history_kripto ORDER BY waktu DESC');
        return view('kripto.index')->with('datas', $datas);
    }

    public function create() {
        return view('kripto.kalkulator');
    }

    public function store(Request $request) {
        $algoritma = $request->algoritma;
        $jenis_proses = $request->jenis_proses; 
        $kunci = strtoupper(preg_replace('/[^A-Z]/', '', $request->kunci ?? 'KUNCI')); 
        
        $isFile = false;
        $originalFileName = 'hasil';
        
        if ($request->hasFile('file_input')) {
            $isFile = true;
            $file = $request->file('file_input');
            $originalFileName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $fileContent = file_get_contents($file->getRealPath());

            if ($jenis_proses == 'Enkripsi') {
                $input_teks = base64_encode($fileContent);
            } else {
                $input_teks = $fileContent;
            }
        } else {
            $input_teks = $request->teks_asli ?? '';
        }

        // --- Ekstraksi Huruf agar Base64 / Spasi Tidak Rusak ---
        preg_match_all('/[a-zA-Z]/', $input_teks, $matches);
        $cleanLetters = strtoupper(implode('', $matches[0]));
        $encryptedLetters = "";

        // --- PROSES ALGORITMA ---
        switch ($algoritma) {
            case 'Vigenere':
                $encryptedLetters = $this->vigenere($cleanLetters, $kunci, $jenis_proses);
                break;
            case 'Affine':
                $a = (int) $request->kunci_a;
                $b = (int) $request->kunci_b;
                $encryptedLetters = $this->affine($cleanLetters, $a, $b, $jenis_proses);
                break;
            case 'Playfair':
                $encryptedLetters = $this->playfair($cleanLetters, $kunci, $jenis_proses);
                break;
            case 'Hill':
                $encryptedLetters = $this->hill($cleanLetters, $kunci, $jenis_proses);
                break;
            case 'Enigma':
                $encryptedLetters = $this->enigma($cleanLetters, $kunci);
                break;
            default:
                $encryptedLetters = "ERROR";
                break;
        }

        // Tangkap pesan error dari algoritma (jika kunci salah)
        if (strpos($encryptedLetters, 'Error:') === 0) {
            return redirect()->back()->with('success', $encryptedLetters);
        }

        // --- Gabungkan kembali huruf yang sudah dienkripsi ke posisi aslinya ---
        $hasil_teks = '';
        $letterIdx = 0;
        for ($i = 0; $i < strlen($input_teks); $i++) {
            if (preg_match('/[a-zA-Z]/', $input_teks[$i])) {
                $isLower = ctype_lower($input_teks[$i]);
                $encChar = $encryptedLetters[$letterIdx] ?? 'X';
                $hasil_teks .= $isLower ? strtolower($encChar) : $encChar;
                $letterIdx++;
            } else {
                $hasil_teks .= $input_teks[$i];
            }
        }
        
        // Simpan ke database
        $db_input = strlen($input_teks) > 100 ? substr($input_teks, 0, 100) . '... [FILE]' : $input_teks;
        $db_output = strlen($hasil_teks) > 100 ? substr($hasil_teks, 0, 100) . '... [FILE]' : $hasil_teks;

        DB::insert(
            'INSERT INTO history_kripto (teks_asli, teks_hasil, algoritma, jenis_proses) VALUES (?, ?, ?, ?)',
            [$db_input, $db_output, $algoritma, $jenis_proses]
        );

        // Download jika file
        if ($isFile) {
            if ($jenis_proses == 'Enkripsi') {
                return response($hasil_teks)
                        ->header('Content-Type', 'text/plain')
                        ->header('Content-Disposition', 'attachment; filename="' . $originalFileName . '_cipher.txt"');
            } else {
                $decodedFile = base64_decode($hasil_teks);
                return response($decodedFile)
                        ->header('Content-Type', 'application/octet-stream')
                        ->header('Content-Disposition', 'attachment; filename="' . $originalFileName . '_asli"');
            }
        }

        return redirect()->route('kripto.index')->with('success', 'Proses Kriptografi Berhasil!');
    }

    // --- PRIVATE FUNCTIONS (LOGIKA KRIPTOGRAFI KLASIK) ---

    private function vigenere($text, $key, $mode) {
        if ($text == '') return '';
        if (empty($key)) $key = 'A';
        $result = '';
        $keyLen = strlen($key);

        for ($i = 0; $i < strlen($text); $i++) {
            $char = ord($text[$i]) - 65;
            $shift = ord($key[$i % $keyLen]) - 65;
            if ($mode == 'Dekripsi') $shift = 26 - $shift;
            $result .= chr((($char + $shift) % 26) + 65);
        }
        return $result;
    }

    private function affine($text, $a, $b, $mode) {
        if ($text == '') return '';
        $result = '';
        $a_inv = 0;
        for ($i = 0; $i < 26; $i++) {
            if (($a * $i) % 26 == 1) { $a_inv = $i; break; }
        }
        if ($a_inv == 0) return "Error: Kunci A ($a) tidak valid (harus saling prima dengan 26)";

        for ($i = 0; $i < strlen($text); $i++) {
            $x = ord($text[$i]) - 65;
            if ($mode == 'Enkripsi') {
                $newChar = (($a * $x) + $b) % 26;
            } else {
                $newChar = ($a_inv * ($x - $b)) % 26;
                if ($newChar < 0) $newChar += 26;
            }
            $result .= chr($newChar + 65);
        }
        return $result;
    }

    private function playfair($text, $key, $mode) {
        if ($text == '') return '';
        if (empty($key)) $key = 'KEY';
        
        $key = str_replace('J', 'I', $key);
        $alphabet = "ABCDEFGHIKLMNOPQRSTUVWXYZ";
        $matrixString = implode('', array_unique(str_split($key . $alphabet)));
        $matrix = array_chunk(str_split($matrixString), 5);
        
        $text = str_replace('J', 'I', $text);
        if (strlen($text) % 2 != 0) $text .= 'X'; 
        
        $result = '';
        for ($i = 0; $i < strlen($text); $i += 2) {
            $c1 = $text[$i]; $c2 = $text[$i+1];
            if ($c1 == $c2) $c2 = ($c2 == 'X') ? 'Z' : 'X'; 
            
            $r1 = $c1_1 = $r2 = $c2_2 = 0;
            for ($r = 0; $r < 5; $r++) {
                for ($c = 0; $c < 5; $c++) {
                    if ($matrix[$r][$c] == $c1) { $r1 = $r; $c1_1 = $c; }
                    if ($matrix[$r][$c] == $c2) { $r2 = $r; $c2_2 = $c; }
                }
            }

            if ($r1 == $r2) { 
                $shift = ($mode == 'Enkripsi') ? 1 : 4;
                $result .= $matrix[$r1][($c1_1 + $shift) % 5] . $matrix[$r2][($c2_2 + $shift) % 5];
            } elseif ($c1_1 == $c2_2) { 
                $shift = ($mode == 'Enkripsi') ? 1 : 4;
                $result .= $matrix[($r1 + $shift) % 5][$c1_1] . $matrix[($r2 + $shift) % 5][$c2_2];
            } else { 
                $result .= $matrix[$r1][$c2_2] . $matrix[$r2][$c1_1];
            }
        }
        if (strlen($result) > strlen(str_replace('J', 'I', $text))) {
            $result = substr($result, 0, -1);
        }
        return $result;
    }

    private function hill($text, $key, $mode) {
        if ($text == '') return '';
        
        // Pastikan kunci minimal 4 huruf untuk matriks 2x2
        while (strlen($key) < 4) { $key .= "A"; }
        
        $k11 = ord($key[0]) - 65; $k12 = ord($key[1]) - 65;
        $k21 = ord($key[2]) - 65; $k22 = ord($key[3]) - 65;
        
        $det = ($k11 * $k22) - ($k12 * $k21);
        $det = (($det % 26) + 26) % 26;
        
        // --- VALIDASI MATEMATIKA YANG JUJUR ---
        // Determinan tidak boleh genap dan tidak boleh kelipatan 13
        if ($det % 2 == 0 || $det % 13 == 0) {
            return "Error: Kunci '$key' tidak valid! Determinan matriksnya ($det) tidak memiliki invers modulo 26. Coba gunakan kunci lain seperti 'DDCF' atau 'GYBN'.";
        }
        
        $det_inv = 0;
        for ($i = 0; $i < 26; $i++) {
            if (($det * $i) % 26 == 1) { $det_inv = $i; break; }
        }

        if ($mode == 'Dekripsi') {
            $temp_k11 = ($k22 * $det_inv) % 26;
            $temp_k12 = ((-$k12 * $det_inv) % 26 + 26) % 26;
            $temp_k21 = ((-$k21 * $det_inv) % 26 + 26) % 26;
            $temp_k22 = ($k11 * $det_inv) % 26;
            $k11 = $temp_k11; $k12 = $temp_k12; $k21 = $temp_k21; $k22 = $temp_k22;
        }

        $padded = false;
        if (strlen($text) % 2 != 0) { $text .= 'X'; $padded = true; }

        $result = '';
        for ($i = 0; $i < strlen($text); $i += 2) {
            $p1 = ord($text[$i]) - 65; $p2 = ord($text[$i+1]) - 65;
            $c1 = (($k11 * $p1) + ($k12 * $p2)) % 26;
            $c2 = (($k21 * $p1) + ($k22 * $p2)) % 26;
            $result .= chr($c1 + 65) . chr($c2 + 65);
        }
        
        if ($padded) $result = substr($result, 0, -1);
        return $result;
    }

    private function enigma($text, $key) {
        if ($text == '') return '';
        
        $rotors = [
            "EKMFLGDQVZNTOWYHXUSPAIBRCJ",
            "AJDKSIRUXBLHWTMCQGZNPYFVOE",
            "BDFHJLCPRTXVZNYEIWGAKMUSQO"
        ];
        $reflector = "YRUHQSLDPXNGOKMIEBFZCWVJAT";
        
        if (strlen($key) < 3) $key .= "AAA";
        $pos = [ord($key[0]) - 65, ord($key[1]) - 65, ord($key[2]) - 65];

        $result = '';
        for ($i = 0; $i < strlen($text); $i++) {
            $pos[0] = ($pos[0] + 1) % 26;
            if ($pos[0] == 0) {
                $pos[1] = ($pos[1] + 1) % 26;
                if ($pos[1] == 0) $pos[2] = ($pos[2] + 1) % 26;
            }

            $charIdx = ord($text[$i]) - 65;
            
            for ($r = 0; $r < 3; $r++) {
                $charIdx = (ord($rotors[$r][($charIdx + $pos[$r]) % 26]) - 65 - $pos[$r] + 26) % 26;
            }
            $charIdx = ord($reflector[$charIdx]) - 65;
            for ($r = 2; $r >= 0; $r--) {
                $targetChar = chr(($charIdx + $pos[$r]) % 26 + 65);
                $charIdx = (strpos($rotors[$r], $targetChar) - $pos[$r] + 26) % 26;
            }
            $result .= chr($charIdx + 65);
        }
        return $result;
    }
}