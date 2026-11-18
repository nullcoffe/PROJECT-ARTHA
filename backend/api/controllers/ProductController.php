<?php

require_once __DIR__ . '/../models/Product.php';

class ProductController
{
    private Product $productModel;

    public function __construct(Product $productModel)
    {
        $this->productModel = $productModel;
    }

    /**
     * GET /admin/products
     * Mengambil seluruh produk.
     */
    public function index(): void
    {
        $products = $this->productModel->getAll();

        successResponse(
            'Data produk berhasil diambil.',
            $products
        );
    }

    /**
     * GET /admin/products/{id}
     * Mengambil detail produk.
     */
    public function show(int $id): void
    {
        if ($id <= 0) {
            errorResponse('ID produk tidak valid.', 422);
        }

        $product = $this->productModel->findById($id);

        if ($product === null) {
            errorResponse('Produk tidak ditemukan.', 404);
        }

        successResponse(
            'Detail produk berhasil diambil.',
            $product
        );
    }

    /**
     * POST /admin/products
     * Menambahkan produk baru.
     */
    public function store(array $input): void
    {
        $kode = trim($input['kode_produk'] ?? '');
        $nama = trim($input['nama_produk'] ?? '');
        $satuan = trim($input['satuan'] ?? '');

        if (
            $kode === '' ||
            $nama === '' ||
            $satuan === ''
        ) {
            errorResponse(
                'Kode, nama, dan satuan produk wajib diisi.',
                422
            );
        }

        if (
            !is_numeric($input['harga'] ?? null) ||
            !is_numeric($input['stok'] ?? null) ||
            !is_numeric($input['stok_minimum'] ?? null)
        ) {
            errorResponse(
                'Harga, stok, dan stok minimum harus berupa angka.',
                422
            );
        }

        $harga = (float) $input['harga'];
        $stok = (float) $input['stok'];
        $stokMinimum = (float) $input['stok_minimum'];

        if (
            $harga < 0 ||
            $stok < 0 ||
            $stokMinimum < 0
        ) {
            errorResponse(
                'Harga dan stok tidak boleh bernilai negatif.',
                422
            );
        }

        $id = $this->productModel->create(
            $kode,
            $nama,
            $satuan,
            $harga,
            $stok,
            $stokMinimum
        );

        successResponse(
            'Produk berhasil ditambahkan.',
            [
                'id_produk' => $id
            ],
            201
        );
    }

    /**
     * PUT /admin/products/{id}
     * Memperbarui informasi produk.
     */
    public function update(int $id, array $input): void
    {
        if ($id <= 0) {
            errorResponse('ID produk tidak valid.', 422);
        }

        $kode = trim($input['kode_produk'] ?? '');
        $nama = trim($input['nama_produk'] ?? '');
        $satuan = trim($input['satuan'] ?? '');

        if (
            $kode === '' ||
            $nama === '' ||
            $satuan === ''
        ) {
            errorResponse(
                'Kode, nama, dan satuan produk wajib diisi.',
                422
            );
        }

        if (
            !is_numeric($input['harga'] ?? null) ||
            !is_numeric($input['stok_minimum'] ?? null)
        ) {
            errorResponse(
                'Harga dan stok minimum harus berupa angka.',
                422
            );
        }

        $harga = (float) $input['harga'];
        $stokMinimum = (float) $input['stok_minimum'];

        if ($harga < 0 || $stokMinimum < 0) {
            errorResponse(
                'Harga dan stok minimum tidak boleh negatif.',
                422
            );
        }

        $this->productModel->update(
            $id,
            $kode,
            $nama,
            $satuan,
            $harga,
            $stokMinimum
        );

        successResponse(
            'Produk berhasil diperbarui.'
        );
    }

    /**
     * GET /admin/products/inactive
     * Mengambil daftar produk nonaktif.
     */
    public function inactive(): void
    {
        $products = $this->productModel->getInactive();

        successResponse(
            'Data produk nonaktif berhasil diambil.',
            $products
        );
    }

    /**
     * POST /admin/products/{id}/activate
     * Mengaktifkan kembali produk.
     */
    public function activate(int $id): void
    {
        if ($id <= 0) {
            errorResponse(
                'ID produk tidak valid.',
                422
            );
        }

        $activated = $this->productModel->activate($id);

        if (!$activated) {
            errorResponse(
                'Produk tidak ditemukan atau sudah aktif.',
                404
            );
        }

        successResponse(
            'Produk berhasil diaktifkan kembali.',
            [
                'id_produk' => $id,
                'status_produk' => 'aktif'
            ]
        );
    }

    /**
     * DELETE /admin/products/{id}
     * Menghapus produk.
     */

    public function destroy(int $id): void
    {
        if ($id <= 0) {
            errorResponse(
                'ID produk tidak valid.',
                422
            );
        }

        $result = $this->productModel->delete($id);

        if ($result === 'deleted') {
            successResponse(
                'Produk berhasil dihapus permanen.',
                [
                    'action' => 'deleted'
                ]
            );
        }

        if ($result === 'deactivated') {
            successResponse(
                'Produk memiliki riwayat atau relasi sehingga berhasil dinonaktifkan. Riwayat tetap aman.',
                [
                    'action' => 'deactivated'
                ]
            );
        }
    }
}