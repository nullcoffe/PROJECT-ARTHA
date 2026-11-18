<?php

require_once __DIR__ . '/../models/Transaction.php';

class TransactionController
{
    private Transaction $transactionModel;

    public function __construct(Transaction $transactionModel)
    {
        $this->transactionModel = $transactionModel;
    }

    public function index(): void
    {
        $transactions = $this->transactionModel->getAll();

        successResponse(
            'Data transaksi berhasil diambil.',
            $transactions
        );
    }
}
?>