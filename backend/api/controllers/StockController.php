<?php

require_once __DIR__ . '/../models/Stockmovement.php';

class StockController
{
    private Stockmovement $stockModel;

    public function __construct(Stockmovement $stockModel)
    {
        $this->stockModel = $stockModel;
    }

    /**
     * GET /admin/stock/history
     * Mengambil seluruh riwayat stok.
     */
    public function index(): void
    {
        $history = $this->stockModel->getAll();

        successResponse(
            'Riwayat stok berhasil diambil.',
            $history
        );
    }

    /**
     * GET /admin/stock/history/{id}
     * Mengambil riwayat stok berdasarkan produk.
     */
    public function show(int $id): void
    {
        if ($id <= 0) {
            errorResponse(
                'ID produk tidak valid.',
                422
            );
        }

        $history = $this->stockModel->getByProduct($id);

        successResponse(
            'Riwayat stok produk berhasil diambil.',
            $history
        );
    }

    /**
     * POST /admin/stock/adjust
     * Menambah stok dan/atau memperbarui harga.
     */
    public function adjust(array $input): void
    {
        $idProduk = filter_var(
            $input['id_produk'] ?? null,
            FILTER_VALIDATE_INT
        );

        if (!$idProduk || $idProduk <= 0) {
            errorResponse(
                'Produk harus dipilih.',
                422
            );
        }

        if (
            !array_key_exists('jumlah_tambah', $input) ||
            !is_numeric($input['jumlah_tambah'])
        ) {
            errorResponse(
                'Jumlah penambahan stok harus berupa angka.',
                422
            );
        }

        $jumlahTambah = (float) $input['jumlah_tambah'];

        if (
            $jumlahTambah < 0 ||
            floor($jumlahTambah) != $jumlahTambah
        ) {
            errorResponse(
                'Jumlah stok harus berupa bilangan bulat minimal 0.',
                422
            );
        }

        $hargaBaru = null;

        if (
            isset($input['harga_baru']) &&
            $input['harga_baru'] !== ''
        ) {
            if (!is_numeric($input['harga_baru'])) {
                errorResponse(
                    'Harga baru harus berupa angka.',
                    422
                );
            }

            $hargaBaru = (float) $input['harga_baru'];

            if ($hargaBaru < 0) {
                errorResponse(
                    'Harga baru tidak boleh negatif.',
                    422
                );
            }
        }

        if ($jumlahTambah == 0 && $hargaBaru === null) {
            errorResponse(
                'Masukkan penambahan stok atau harga baru.',
                422
            );
        }

        // Mengambil identitas admin dari session.
        $user = artha_require_role(['admin']);

        $result = $this->stockModel->adjustStock(
            $idProduk,
            (int) $user['id_pengguna'],
            $jumlahTambah,
            $hargaBaru
        );

        successResponse(
            'Penyesuaian stok berhasil disimpan.',
            $result
        );
    }
}

?>