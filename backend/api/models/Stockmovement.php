<?php

class Stockmovement
{
    private mysqli $conn;

    public function __construct(mysqli $conn)
    {
        $this->conn = $conn;
    }

    /**
     * Mengambil riwayat perubahan stok.
     */
    public function getAll(): array
    {
        $sql = "SELECT
                    rs.id_riwayat_stok,
                    rs.id_produk,
                    p.kode_produk,
                    p.nama_produk,
                    rs.id_pengguna,
                    u.nama_lengkap,
                    rs.id_transaksi,
                    rs.tanggal_perubahan,
                    rs.stok_sebelum,
                    rs.stok_sesudah,
                    (rs.stok_sesudah - rs.stok_sebelum)
                        AS selisih_stok
                FROM riwayat_stok rs
                INNER JOIN produk p
                    ON p.id_produk = rs.id_produk
                INNER JOIN pengguna u
                    ON u.id_pengguna = rs.id_pengguna
                ORDER BY
                    rs.tanggal_perubahan DESC,
                    rs.id_riwayat_stok DESC";

        $result = $this->conn->query($sql);

        if (!$result) {
            throw new RuntimeException(
                'Gagal mengambil riwayat stok.'
            );
        }

        return $result->fetch_all(MYSQLI_ASSOC);
    }

    /**
     * Mengambil riwayat stok berdasarkan produk.
     */
    public function getByProduct(int $idProduk): array
    {
        $sql = "SELECT
                    rs.id_riwayat_stok,
                    rs.id_produk,
                    p.kode_produk,
                    p.nama_produk,
                    rs.id_pengguna,
                    u.nama_lengkap,
                    rs.id_transaksi,
                    rs.tanggal_perubahan,
                    rs.stok_sebelum,
                    rs.stok_sesudah,
                    (rs.stok_sesudah - rs.stok_sebelum)
                        AS selisih_stok
                FROM riwayat_stok rs
                INNER JOIN produk p
                    ON p.id_produk = rs.id_produk
                INNER JOIN pengguna u
                    ON u.id_pengguna = rs.id_pengguna
                WHERE rs.id_produk = ?
                ORDER BY
                    rs.tanggal_perubahan DESC,
                    rs.id_riwayat_stok DESC";

        $stmt = $this->conn->prepare($sql);

        if (!$stmt) {
            throw new RuntimeException(
                'Gagal menyiapkan riwayat produk.'
            );
        }

        $stmt->bind_param('i', $idProduk);
        $stmt->execute();

        $result = $stmt->get_result()->fetch_all(
            MYSQLI_ASSOC
        );

        $stmt->close();

        return $result;
    }

    /**
     * Penyesuaian stok manual.
     * id_transaksi tidak diisi karena perubahan
     * ini bukan transaksi penjualan.
     */
    public function adjustStock(
        int $idProduk,
        int $idPengguna,
        float $jumlahTambah,
        ?float $hargaBaru = null
    ): array {

        if ($jumlahTambah < 0) {
            throw new RuntimeException(
                'Jumlah penambahan stok tidak valid.'
            );
        }

        if ($jumlahTambah == 0 && $hargaBaru === null) {
            throw new RuntimeException(
                'Tidak ada perubahan yang dilakukan.'
            );
        }

        if ($hargaBaru !== null && $hargaBaru < 0) {
            throw new RuntimeException(
                'Harga produk tidak boleh negatif.'
            );
        }

        $this->conn->begin_transaction();

        try {

            // Mengunci baris produk selama proses perubahan.
            $sql = "SELECT stok, harga
                    FROM produk
                    WHERE id_produk = ?
                    FOR UPDATE";

            $stmt = $this->conn->prepare($sql);

            if (!$stmt) {
                throw new RuntimeException(
                    'Gagal mengambil data stok produk.'
                );
            }

            $stmt->bind_param('i', $idProduk);
            $stmt->execute();

            $product = $stmt->get_result()->fetch_assoc();

            $stmt->close();

            if (!$product) {
                throw new RuntimeException(
                    'Produk tidak ditemukan.'
                );
            }

            $stokSebelum = (float) $product['stok'];

            $stokSesudah = $stokSebelum + $jumlahTambah;

            // Memperbarui stok dan harga jika diperlukan.
            if ($hargaBaru !== null) {

                $sql = "UPDATE produk
                        SET stok = ?,
                            harga = ?
                        WHERE id_produk = ?";

                $stmt = $this->conn->prepare($sql);

                if (!$stmt) {
                    throw new RuntimeException(
                        'Gagal memperbarui stok dan harga.'
                    );
                }

                $stmt->bind_param(
                    'ddi',
                    $stokSesudah,
                    $hargaBaru,
                    $idProduk
                );

            } else {

                $sql = "UPDATE produk
                        SET stok = ?
                        WHERE id_produk = ?";

                $stmt = $this->conn->prepare($sql);

                if (!$stmt) {
                    throw new RuntimeException(
                        'Gagal memperbarui stok.'
                    );
                }

                $stmt->bind_param(
                    'di',
                    $stokSesudah,
                    $idProduk
                );
            }

            $stmt->execute();
            $stmt->close();

            // Mencatat perubahan stok manual.
            // id_transaksi otomatis NULL.
            if ($jumlahTambah > 0) {

                $sql = "INSERT INTO riwayat_stok (
                            id_produk,
                            id_pengguna,
                            tanggal_perubahan,
                            stok_sebelum,
                            stok_sesudah
                        ) VALUES (?, ?, NOW(), ?, ?)";

                $stmt = $this->conn->prepare($sql);

                if (!$stmt) {
                    throw new RuntimeException(
                        'Gagal menyiapkan riwayat stok.'
                    );
                }

                $stmt->bind_param(
                    'iidd',
                    $idProduk,
                    $idPengguna,
                    $stokSebelum,
                    $stokSesudah
                );

                $stmt->execute();
                $stmt->close();
            }

            $this->conn->commit();

            return [
                'id_produk' => $idProduk,
                'stok_sebelum' => $stokSebelum,
                'stok_sesudah' => $stokSesudah,
                'jumlah_ditambahkan' => $jumlahTambah,
                'harga' => $hargaBaru ?? (float) $product['harga']
            ];

        } catch (Throwable $error) {

            $this->conn->rollback();

            throw $error;
        }
    }
}