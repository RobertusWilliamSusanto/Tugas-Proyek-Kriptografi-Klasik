@extends('kripto.layout')

@section('content')
<div class="row justify-content-center">
    <div class="col-md-8">
        <div class="card shadow-sm">
            <div class="card-header bg-primary text-white">
                <h5 class="mb-0">Kalkulator Enkripsi & Dekripsi (Teks & File)</h5>
            </div>
            <div class="card-body">
                <form method="POST" action="{{ route('kripto.store') }}" enctype="multipart/form-data">
                    @csrf
                    
                    <div class="mb-3">
                        <label class="form-label fw-bold">Opsi 1: Ketik Teks</label>
                        <textarea class="form-control" name="teks_asli" rows="4" placeholder="Masukkan teks di sini... (kosongkan jika memilih upload file)"></textarea>
                    </div>

                    <div class="mb-4 p-3 bg-light border rounded">
                        <label class="form-label fw-bold text-primary">Opsi 2: Upload File (Gambar, Audio, Video, dll)</label>
                        <input type="file" class="form-control" name="file_input">
                        <small class="text-muted">Jika mengunggah file, kolom Teks di atas akan diabaikan.</small>
                    </div>

                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label class="form-label fw-bold">Algoritma</label>
                            <select class="form-select" name="algoritma" id="algoritmaSelect" required>
                                <option value="Vigenere">Vigenere Cipher</option>
                                <option value="Affine">Affine Cipher</option>
                                <option value="Playfair">Playfair Cipher</option>
                                <option value="Hill">Hill Cipher</option>
                                <option value="Enigma">Enigma Cipher</option>
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label fw-bold">Jenis Proses</label>
                            <select class="form-select" name="jenis_proses" required>
                                <option value="Enkripsi">Enkripsi</option>
                                <option value="Dekripsi">Dekripsi</option>
                            </select>
                        </div>
                    </div>

                    <div class="mb-3" id="kunciTeksDiv">
                        <label class="form-label fw-bold">Kunci (Teks)</label>
                        <input type="text" class="form-control" name="kunci" placeholder="Masukkan kata kunci (huruf saja)">
                    </div>

                    <div class="row mb-3 d-none" id="kunciAffineDiv">
                        <div class="col-md-6">
                            <label class="form-label fw-bold">Kunci A (Multiplier)</label>
                            <input type="number" class="form-control" name="kunci_a" placeholder="Harus relatif prima dgn 26">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label fw-bold">Kunci B (Shift)</label>
                            <input type="number" class="form-control" name="kunci_b" placeholder="Angka pergeseran">
                        </div>
                    </div>

                    <div class="d-grid">
                        <button type="submit" class="btn btn-success btn-lg">Proses Kriptografi</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
    document.getElementById('algoritmaSelect').addEventListener('change', function() {
        var algo = this.value;
        var divTeks = document.getElementById('kunciTeksDiv');
        var divAffine = document.getElementById('kunciAffineDiv');

        if (algo === 'Affine') {
            divTeks.classList.add('d-none');
            divAffine.classList.remove('d-none');
        } else {
            divTeks.classList.remove('d-none');
            divAffine.classList.add('d-none');
        }
    });
</script>
@endpush