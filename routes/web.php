<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CryptoController;

// Mengarahkan halaman utama (localhost:8000) ke riwayat kripto
Route::get('/', [CryptoController::class, 'index'])->name('kripto.index');

// Mengarahkan ke form kalkulator
Route::get('kalkulator', [CryptoController::class, 'create'])->name('kripto.create');

// Memproses data dari form
Route::post('proses', [CryptoController::class, 'store'])->name('kripto.store');