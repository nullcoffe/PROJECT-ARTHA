<?php

class Transaction
{
    private mysqli $conn;

    public function __construct(mysqli $conn)
    {
        $this->conn = $conn;
    }

    /**
     * Mengambil seluruh transaksi untuk halaman Admin.
     */
    public function getAll(): array
    {
        $sql = "SELECT
                    t.id_transaksi,
                    t.nomor_transaksi,
                    t.tanggal_transaksi,
                    t.total_bayar
                FROM transaksi t
                ORDER BY
                    t.tanggal_transaksi DESC,
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

    /**
     * Mengambil produk aktif untuk katalog Kasir.
     */

    /**
     * Mengambil katalog produk aktif untuk halaman Kasir.
     */
    public function getCashierProducts(): array
    {
        $sql = "SELECT
                    id_produk,
                    kode_produk,
                    nama_produk,
                    satuan,
                    harga,
                    stok,
                    stok_minimum
                FROM produk
                WHERE status_produk = 'aktif'
                ORDER BY kode_produk ASC";

        $result = $this->conn->query($sql);

        if (!$result) {
            throw new RuntimeException(
                'Gagal mengambil katalog produk.'
            );
        }

        return $result->fetch_all(MYSQLI_ASSOC);
    }

    /**
     * Menyimpan transaksi penjualan Kasir.
     *
     * Harga produk selalu diambil dari database.
     * Stok diperiksa dan dikunci sebelum transaksi disimpan.
     * Transaksi, detail transaksi, dan riwayat stok
     * disimpan dalam satu database transaction.
     */
    public function createSale(
        int $userId,
        array $input
    ): array {

        if ($userId <= 0) {
            throw new InvalidArgumentException(
                'Pengguna kasir tidak valid.'
            );
        }

        $items = $input['items'] ?? null;
        $received = $input['uang_diterima'] ?? null;

        if (
            !is_array($items) ||
            count($items) === 0
        ) {
            throw new InvalidArgumentException(
                'Keranjang transaksi masih kosong.'
            );
        }

        if (
            !is_numeric($received) ||
            !is_finite((float) $received) ||
            (float) $received < 0
        ) {
            throw new InvalidArgumentException(
                'Nominal uang diterima tidak valid.'
            );
        }

        // Menggabungkan produk yang sama dalam keranjang.
        $quantities = [];

        foreach ($items as $item) {

            if (!is_array($item)) {
                throw new InvalidArgumentException(
                    'Format detail produk tidak valid.'
                );
            }

            $productId = filter_var(
                $item['id_produk'] ?? null,
                FILTER_VALIDATE_INT
            );

            $quantity = $item['jumlah'] ?? null;

            if (
                !$productId ||
                !is_numeric($quantity) ||
                !is_finite((float) $quantity) ||
                (float) $quantity <= 0
            ) {
                throw new InvalidArgumentException(
                    'ID produk atau jumlah pembelian tidak valid.'
                );
            }

            $quantities[$productId] =
                ($quantities[$productId] ?? 0) +
                (float) $quantity;
        }

        // Memulai transaksi database.
        $this->conn->begin_transaction();

        try {

            // Mengunci data produk agar stok tidak berubah
            // akibat transaksi lain selama proses pembayaran.
            $productStmt = $this->conn->prepare(
                "SELECT
                    id_produk,
                    kode_produk,
                    nama_produk,
                    satuan,
                    harga,
                    stok
                 FROM produk
                 WHERE id_produk = ?
                 AND status_produk = 'aktif'
                 FOR UPDATE"
            );

            if (!$productStmt) {
                throw new RuntimeException(
                    'Gagal menyiapkan validasi produk.'
                );
            }

            $saleItems = [];
            $total = 0.0;

            foreach ($quantities as $productId => $quantity) {

                $productStmt->bind_param(
                    'i',
                    $productId
                );

                $productStmt->execute();

                $product = $productStmt
                    ->get_result()
                    ->fetch_assoc();

                if (!$product) {
                    throw new RuntimeException(
                        "Produk dengan ID {$productId} tidak ditemukan atau sudah dinonaktifkan."
                    );
                }

                $stockBefore = (float) $product['stok'];

                if ($quantity > $stockBefore) {
                    throw new RuntimeException(
                        "Stok {$product['nama_produk']} tidak mencukupi. Stok tersedia: {$stockBefore} {$product['satuan']}."
                    );
                }

                $price = (float) $product['harga'];

                $subtotal = round(
                    $price * $quantity,
                    2
                );

                $total = round(
                    $total + $subtotal,
                    2
                );

                $saleItems[] = [
                    'id_produk' => (int) $product['id_produk'],
                    'kode_produk' => $product['kode_produk'],
                    'nama_produk' => $product['nama_produk'],
                    'satuan' => $product['satuan'],
                    'jumlah' => $quantity,
                    'harga_satuan' => $price,
                    'subtotal' => $subtotal,
                    'stok_sebelum' => $stockBefore,
                    'stok_sesudah' => $stockBefore - $quantity
                ];
            }

            $productStmt->close();

            // Memastikan pembayaran mencukupi.
            $receivedAmount = round(
                (float) $received,
                2
            );

            if ($receivedAmount < $total) {
                throw new InvalidArgumentException(
                    'Uang yang diterima kurang dari total pembayaran.'
                );
            }

            $change = round(
                $receivedAmount - $total,
                2
            );

            // Membuat nomor transaksi unik.
            $number =
                'TRX-' .
                date('YmdHis') .
                '-' .
                strtoupper(bin2hex(random_bytes(4)));

            // Menyimpan transaksi utama.
            $transactionStmt = $this->conn->prepare(
                "INSERT INTO transaksi (
                    id_pengguna,
                    nomor_transaksi,
                    tanggal_transaksi,
                    total_bayar,
                    uang_diterima,
                    uang_kembalian
                ) VALUES (?, ?, NOW(), ?, ?, ?)"
            );

            if (!$transactionStmt) {
                throw new RuntimeException(
                    'Gagal menyiapkan penyimpanan transaksi.'
                );
            }

            $transactionStmt->bind_param(
                'isddd',
                $userId,
                $number,
                $total,
                $receivedAmount,
                $change
            );

            $transactionStmt->execute();

            $transactionId = (int) $this->conn->insert_id;

            $transactionStmt->close();

            // Menyiapkan penyimpanan detail transaksi.
            $detailStmt = $this->conn->prepare(
                "INSERT INTO detail_transaksi (
                    id_transaksi,
                    id_produk,
                    jumlah,
                    harga_satuan,
                    subtotal
                ) VALUES (?, ?, ?, ?, ?)"
            );

            if (!$detailStmt) {
                throw new RuntimeException(
                    'Gagal menyiapkan detail transaksi.'
                );
            }

            // Menyiapkan pembaruan stok.
            $stockStmt = $this->conn->prepare(
                "UPDATE produk
                 SET stok = ?
                 WHERE id_produk = ?
                 AND stok >= ?
                 AND status_produk = 'aktif'"
            );

            if (!$stockStmt) {
                throw new RuntimeException(
                    'Gagal menyiapkan pembaruan stok.'
                );
            }

            // Menyiapkan pencatatan riwayat stok.
            $historyStmt = $this->conn->prepare(
                "INSERT INTO riwayat_stok (
                    id_produk,
                    id_pengguna,
                    id_transaksi,
                    tanggal_perubahan,
                    stok_sebelum,
                    stok_sesudah
                ) VALUES (?, ?, ?, NOW(), ?, ?)"
            );

            if (!$historyStmt) {
                throw new RuntimeException(
                    'Gagal menyiapkan riwayat stok.'
                );
            }

            // Menyimpan detail dan memperbarui stok.
            foreach ($saleItems as $item) {

                $productId = $item['id_produk'];
                $quantity = $item['jumlah'];
                $price = $item['harga_satuan'];
                $subtotal = $item['subtotal'];

                $stockBefore = $item['stok_sebelum'];
                $stockAfter = $item['stok_sesudah'];

                $detailStmt->bind_param(
                    'iiddd',
                    $transactionId,
                    $productId,
                    $quantity,
                    $price,
                    $subtotal
                );

                $detailStmt->execute();

                $stockStmt->bind_param(
                    'did',
                    $stockAfter,
                    $productId,
                    $quantity
                );

                $stockStmt->execute();

                if ($stockStmt->affected_rows !== 1) {
                    throw new RuntimeException(
                        "Gagal memperbarui stok {$item['nama_produk']}."
                    );
                }

                $historyStmt->bind_param(
                    'iiidd',
                    $productId,
                    $userId,
                    $transactionId,
                    $stockBefore,
                    $stockAfter
                );

                $historyStmt->execute();
            }

            $detailStmt->close();
            $stockStmt->close();
            $historyStmt->close();

            // Menyimpan seluruh perubahan secara bersamaan.
            $this->conn->commit();

            return [
                'id_transaksi' => $transactionId,
                'nomor_transaksi' => $number,
                'tanggal_transaksi' => date('Y-m-d H:i:s'),
                'total_bayar' => $total,
                'uang_diterima' => $receivedAmount,
                'uang_kembalian' => $change,
                'items' => $saleItems
            ];

        } catch (Throwable $error) {

            // Membatalkan seluruh perubahan jika terjadi kegagalan.
            $this->conn->rollback();

            throw $error;
        }
    }



    /**
     * Mengambil struk transaksi terakhir milik Kasir.
     */
    public function getLatestReceipt(int $userId): ?array
    {
        if ($userId <= 0) {
            throw new InvalidArgumentException(
                'ID pengguna tidak valid.'
            );
        }

        $stmt = $this->conn->prepare(
            "SELECT nomor_transaksi
             FROM transaksi
             WHERE id_pengguna = ?
             ORDER BY tanggal_transaksi DESC, id_transaksi DESC
             LIMIT 1"
        );

        if (!$stmt) {
            throw new RuntimeException(
                'Gagal mencari transaksi terakhir.'
            );
        }

        $stmt->bind_param('i', $userId);
        $stmt->execute();

        $row = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if (!$row) {
            return null;
        }

        return $this->getReceiptByNumber(
            $row['nomor_transaksi'],
            $userId
        );
    }

    /**
     * Mengambil satu struk transaksi berdasarkan nomor transaksi.
     * Kasir hanya dapat membuka transaksi miliknya sendiri.
     */
    public function getReceiptByNumber(string $number, int $userId): ?array
    {
        $number = trim($number);

        if ($number === '' || $userId <= 0) {
            throw new InvalidArgumentException(
                'Nomor transaksi atau identitas Kasir tidak valid.'
            );
        }

        $transactionSql = "SELECT
                                id_transaksi,
                                id_pengguna,
                                nomor_transaksi,
                                tanggal_transaksi,
                                total_bayar,
                                uang_diterima,
                                uang_kembalian
                           FROM transaksi
                           WHERE nomor_transaksi = ?
                           AND id_pengguna = ?
                           LIMIT 1";

        $transactionStmt = $this->conn->prepare($transactionSql);

        if (!$transactionStmt) {
            throw new RuntimeException(
                'Gagal menyiapkan data struk transaksi.'
            );
        }

        $transactionStmt->bind_param('si', $number, $userId);
        $transactionStmt->execute();

        $transaction = $transactionStmt->get_result()->fetch_assoc();
        $transactionStmt->close();

        if (!$transaction) {
            return null;
        }

        $transactionId = (int) $transaction['id_transaksi'];

        $detailSql = "SELECT
                            dt.id_produk,
                            p.kode_produk,
                            p.nama_produk,
                            p.satuan,
                            dt.jumlah,
                            dt.harga_satuan,
                            dt.subtotal
                      FROM detail_transaksi dt
                      INNER JOIN produk p
                        ON p.id_produk = dt.id_produk
                      WHERE dt.id_transaksi = ?
                      ORDER BY dt.id_detail_transaksi ASC";

        $detailStmt = $this->conn->prepare($detailSql);

        if (!$detailStmt) {
            throw new RuntimeException(
                'Gagal menyiapkan detail struk transaksi.'
            );
        }

        $detailStmt->bind_param('i', $transactionId);
        $detailStmt->execute();

        $detailResult = $detailStmt->get_result();
        $items = [];

        while ($row = $detailResult->fetch_assoc()) {
            $items[] = [
                'id_produk' => (int) $row['id_produk'],
                'kode_produk' => $row['kode_produk'],
                'nama_produk' => $row['nama_produk'],
                'satuan' => $row['satuan'],
                'jumlah' => (float) $row['jumlah'],
                'harga_satuan' => (float) $row['harga_satuan'],
                'subtotal' => (float) $row['subtotal']
            ];
        }

        $detailStmt->close();

        if (empty($items)) {
            throw new RuntimeException(
                'Detail produk untuk transaksi ini tidak ditemukan.'
            );
        }

        $date = new DateTime($transaction['tanggal_transaksi']);

        return [
            'id_transaksi' => $transactionId,
            'nomor_transaksi' => $transaction['nomor_transaksi'],
            'tanggal_transaksi' => $date->format('Y-m-d H:i:s'),
            'total_bayar' => (float) $transaction['total_bayar'],
            'uang_diterima' => (float) $transaction['uang_diterima'],
            'uang_kembalian' => (float) ($transaction['uang_kembalian'] ?? 0),
            'metode_pembayaran' => 'Tunai',
            'items' => $items
        ];
    }

    /**
     * Mengambil ringkasan dashboard berdasarkan akun Kasir.
     */
    public function getCashierDashboard(int $userId): array
    {
        if ($userId <= 0) {
            throw new InvalidArgumentException(
                'ID pengguna tidak valid.'
            );
        }

        // Ringkasan penjualan hari ini.
        $sql = "SELECT
                    COALESCE(SUM(total_bayar), 0) AS total_penjualan,
                    COUNT(*) AS jumlah_transaksi
                FROM transaksi
                WHERE id_pengguna = ?
                AND tanggal_transaksi >= CURDATE()
                AND tanggal_transaksi < CURDATE() + INTERVAL 1 DAY";

        $stmt = $this->conn->prepare($sql);

        if (!$stmt) {
            throw new RuntimeException(
                'Gagal mengambil ringkasan penjualan.'
            );
        }

        $stmt->bind_param('i', $userId);
        $stmt->execute();

        $summary = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        // Menghitung produk aktif.
        $productSql = "SELECT COUNT(*) AS total_produk
                    FROM produk
                    WHERE status_produk = 'aktif'";

        $productResult = $this->conn->query($productSql);

        if (!$productResult) {
            throw new RuntimeException(
                'Gagal menghitung produk aktif.'
            );
        }

        $productData = $productResult->fetch_assoc();

        // Mengambil lima transaksi terakhir milik Kasir.
        $historySql = "SELECT
                            nomor_transaksi,
                            tanggal_transaksi,
                            total_bayar
                    FROM transaksi
                    WHERE id_pengguna = ?
                    ORDER BY tanggal_transaksi DESC,
                                id_transaksi DESC
                    LIMIT 5";

        $historyStmt = $this->conn->prepare($historySql);

        if (!$historyStmt) {
            throw new RuntimeException(
                'Gagal mengambil riwayat transaksi.'
            );
        }

        $historyStmt->bind_param('i', $userId);
        $historyStmt->execute();

        $result = $historyStmt->get_result();

        $history = [];

        while ($row = $result->fetch_assoc()) {
            $date = new DateTime(
                $row['tanggal_transaksi']
            );

            $history[] = [
                'id' => $row['nomor_transaksi'],
                'waktu' => $date->format('H:i'),
                'tanggal' => $date->format('d/m/Y'),
                'total' => (float) $row['total_bayar'],
                'status' => 'Selesai'
            ];
        }

        $historyStmt->close();

        return [
            'total_penjualan' => (float) $summary['total_penjualan'],
            'jumlah_transaksi' => (int) $summary['jumlah_transaksi'],
            'total_produk' => (int) $productData['total_produk'],
            'transaksi_terbaru' => $history
        ];
    }
}
?>