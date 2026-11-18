<?php

require_once __DIR__ . '/../models/Transaction.php';

class TransactionController
{
    private Transaction $transactionModel;

    public function __construct(Transaction $transactionModel)
    {
        $this->transactionModel = $transactionModel;
    }

    // Mengambil seluruh transaksi untuk Admin.
    public function index(): void
    {
        $transactions = $this->transactionModel->getAll();

        successResponse(
            'Data transaksi berhasil diambil.',
            $transactions
        );
    }

    // Mengambil katalog produk aktif untuk Kasir.
    public function products(): void
    {
        $products = $this->transactionModel->getCashierProducts();

        successResponse(
            'Katalog produk berhasil diambil.',
            $products
        );
    }

    // Menyimpan transaksi penjualan Kasir.
    public function store(array $input, array $user): void
    {
        $userId = (int) ($user['id_pengguna'] ?? 0);

        if ($userId <= 0) {
            errorResponse(
                'Identitas Kasir tidak valid.',
                401
            );
        }

        $result = $this->transactionModel->createSale(
            $userId,
            $input
        );

        successResponse(
            'Transaksi berhasil disimpan.',
            $result,
            201
        );
    }


    // Mengambil detail struk berdasarkan nomor transaksi.
    public function receipt(string $number, array $user): void
    {
        $userId = (int) ($user['id_pengguna'] ?? 0);

        if ($userId <= 0) {
            errorResponse(
                'Identitas Kasir tidak valid.',
                401
            );
        }

        if ($number === 'latest') {
            $receipt = $this->transactionModel->getLatestReceipt(
                $userId
            );
        } else {
            $receipt = $this->transactionModel->getReceiptByNumber(
                $number,
                $userId
            );
        }

        if ($receipt === null) {
            errorResponse(
                'Transaksi tidak ditemukan atau bukan milik akun Kasir ini.',
                404
            );
        }

        successResponse(
            'Data struk berhasil diambil.',
            $receipt
        );
    }

    // Mengambil ringkasan dashboard Kasir.
    public function cashierDashboard(array $user): void
    {
        $userId = (int) ($user['id_pengguna'] ?? 0);

        if ($userId <= 0) {
            errorResponse(
                'Identitas Kasir tidak valid.',
                401
            );
        }

        $data = $this->transactionModel->getCashierDashboard(
            $userId
        );

        successResponse(
            'Dashboard Kasir berhasil dimuat.',
            $data
        );
    }
}

?>