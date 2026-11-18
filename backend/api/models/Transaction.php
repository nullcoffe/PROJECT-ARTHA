<?php

class Transaction
{
    private mysqli $conn;

    public function __construct(mysqli $conn)
    {
        $this->conn = $conn;
    }

    public function getAll(): array
    {
        $sql = "SELECT
                    t.id_transaksi,
                    t.nomor_transaksi,
                    t.tanggal_transaksi,
                    t.total_bayar
                FROM transaksi t
                ORDER BY t.tanggal_transaksi DESC,
                         t.id_transaksi DESC";

        $result = $this->conn->query($sql);

        if (!$result) {
            throw new RuntimeException(
                'Gagal mengambil data transaksi.'
            );
        }

        $transactions = $result->fetch_all(MYSQLI_ASSOC);

        if (empty($transactions)) {
            return [];
        }

        $detailSql = "SELECT
                        dt.id_transaksi,
                        p.nama_produk
                      FROM detail_transaksi dt
                      INNER JOIN produk p
                        ON p.id_produk = dt.id_produk
                      ORDER BY dt.id_transaksi";

        $detailResult = $this->conn->query($detailSql);

        if (!$detailResult) {
            throw new RuntimeException(
                'Gagal mengambil detail transaksi.'
            );
        }

        $products = [];

        while ($detail = $detailResult->fetch_assoc()) {
            $id = (int) $detail['id_transaksi'];

            $products[$id][] = $detail['nama_produk'];
        }

        foreach ($transactions as &$transaction) {
            $id = (int) $transaction['id_transaksi'];

            $date = new DateTime(
                $transaction['tanggal_transaksi']
            );

            $transaction = [
                'id' => $transaction['nomor_transaksi'],
                'date' => $date->format('d/m/y'),
                'year' => $date->format('Y'),
                'month' => $date->format('m'),
                'total' => (float) $transaction['total_bayar'],
                'products' => array_values(
                    array_unique($products[$id] ?? [])
                )
            ];
        }

        unset($transaction);

        return $transactions;
    }
}
?>