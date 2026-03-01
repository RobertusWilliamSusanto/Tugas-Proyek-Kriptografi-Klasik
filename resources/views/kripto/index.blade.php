@extends('kripto.layout')

@section('content')
<div class="d-flex justify-content-between align-items-center mb-4 mt-2">
    <h4>Riwayat Proses Kriptografi</h4>
    <a href="{{ route('kripto.create') }}" class="btn btn-primary">Ke Kalkulator</a>
</div>

@if (Session::has('success'))
    <div class="alert alert-success alert-dismissible fade show" role="alert">
        {{ Session::get('success') }}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
@endif

<div class="card shadow-sm">
    <div class="card-body p-0">
        <div class="table-responsive">
            <table class="table table-hover table-striped mb-0">
                <thead class="table-dark">
                    <tr>
                        <th>Waktu</th>
                        <th>Algoritma</th>
                        <th>Proses</th>
                        <th>Input (Plaintext/Ciphertext)</th>
                        <th>Hasil Akhir</th> </tr>
                </thead>
                <tbody>
                    @forelse ($datas as $data)
                        <tr>
                            <td>{{ $data->waktu }}</td>
                            <td><span class="badge bg-secondary">{{ $data->algoritma }}</span></td>
                            <td>
                                @if($data->jenis_proses == 'Enkripsi')
                                    <span class="badge bg-danger">{{ $data->jenis_proses }}</span>
                                @else
                                    <span class="badge bg-success">{{ $data->jenis_proses }}</span>
                                @endif
                            </td>
                            <td>{{ $data->teks_asli }}</td>
                            <td class="fw-bold text-primary">{{ $data->teks_hasil }}</td> </tr>
                    @empty
                        <tr>
                            <td colspan="5" class="text-center py-4 text-muted">Belum ada riwayat kriptografi. Coba jalankan kalkulator!</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</div>
@endsection