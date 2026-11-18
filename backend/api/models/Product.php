<?php

class Product
{
    private $conn;

    public function __construct(mysqli $conn)
    {
        $this->conn = $conn;
    }

    /**
     * Mengambil seluruh produk aktif.
     */
    public function getAll(): array
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
                ORDER BY id_produk ASC";

        $result = $this->conn->query($sql);

        if (!$result) {
            throw new RuntimeException(
                'Gagal mengambil data produk.'
            );
        }

        return $result->fetch_all(MYSQLI_ASSOC);
    }

    /**
     * Mengambil seluruh produk nonaktif.
     */
    public function getInactive(): array
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
                WHERE status_produk = 'nonaktif'
                ORDER BY id_produk ASC";

        $result = $this->conn->query($sql);

        if (!$result) {
            throw new RuntimeException(
                'Gagal mengambil data produk nonaktif.'
            );
        }

        return $result->fetch_all(MYSQLI_ASSOC);
    }

    /**
     * Mengambil satu produk berdasarkan ID.
     */
    public function findById(int $id): ?array
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
                WHERE id_produk = ?
                AND status_produk = 'aktif'
                LIMIT 1";

        $stmt = $this->conn->prepare($sql);

        if (!$stmt) {
            throw new RuntimeException(
                'Gagal menyiapkan pencarian produk.'
            );
        }

        $stmt->bind_param('i', $id);
        $stmt->execute();

        $product = $stmt->get_result()->fetch_assoc();

        $stmt->close();

        return $product ?: null;
    }

    /**
     * Menambahkan produk baru.
     */
    public function create(
        string $kode,
        string $nama,
        string $satuan,
        float $harga,
        float $stok,
        float $stokMinimum
    ): int {

        $this->assertUniqueCode($kode);

        $sql = "INSERT INTO produk (
                    kode_produk,
                    nama_produk,
                    satuan,
                    harga,
                    stok,
                    stok_minimum,
                    status_produk
                ) VALUES (?, ?, ?, ?, ?, ?, 'aktif')";

        $stmt = $this->conn->prepare($sql);

        if (!$stmt) {
            throw new RuntimeException(
                'Gagal menyiapkan penyimpanan produk.'
            );
        }

        $stmt->bind_param(
            'sssddd',
            $kode,
            $nama,
            $satuan,
            $harga,
            $stok,
            $stokMinimum
        );

        try {
            $stmt->execute();
            $id = (int) $this->conn->insert_id;
        } catch (mysqli_sql_exception $error) {
            $this->handleDatabaseError($error);
        } finally {
            $stmt->close();
        }

        return $id;
    }

    /**
     * Memperbarui informasi produk.
     */
    public function update(
        int $id,
        string $kode,
        string $nama,
        string $satuan,
        float $harga,
        float $stokMinimum
    ): bool {

        if ($this->findById($id) === null) {
            throw new RuntimeException(
                'Produk tidak ditemukan.'
            );
        }

        $this->assertUniqueCode($kode, $id);

        $sql = "UPDATE produk
                SET kode_produk = ?,
                    nama_produk = ?,
                    satuan = ?,
                    harga = ?,
                    stok_minimum = ?
                WHERE id_produk = ?
                AND status_produk = 'aktif'";

        $stmt = $this->conn->prepare($sql);

        if (!$stmt) {
            throw new RuntimeException(
                'Gagal menyiapkan perubahan produk.'
            );
        }

        $stmt->bind_param(
            'sssddi',
            $kode,
            $nama,
            $satuan,
            $harga,
            $stokMinimum,
            $id
        );

        try {
            $stmt->execute();
        } catch (mysqli_sql_exception $error) {
            $this->handleDatabaseError($error);
        } finally {
            $stmt->close();
        }

        return true;
    }

    /**
     * Mengaktifkan kembali produk nonaktif.
     */
    public function activate(int $id): bool
    {
        $sql = "UPDATE produk
                SET status_produk = 'aktif'
                WHERE id_produk = ?
                AND status_produk = 'nonaktif'";

        $stmt = $this->conn->prepare($sql);

        if (!$stmt) {
            throw new RuntimeException(
                'Gagal menyiapkan aktivasi produk.'
            );
        }

        $stmt->bind_param('i', $id);

        try {
            $stmt->execute();

            $activated = $stmt->affected_rows > 0;
        } finally {
            $stmt->close();
        }

        return $activated;
    }

    /**
     * Hybrid Delete.
     * Hapus permanen jika tidak ada relasi.
     * Nonaktifkan jika masih memiliki relasi.
     */
    public function delete(int $id): string
    {
        $product = $this->findById($id);

        if ($product === null) {
            throw new RuntimeException(
                'Produk tidak ditemukan.'
            );
        }

        $stmt = $this->conn->prepare(
            "DELETE FROM produk
             WHERE id_produk = ?
             AND status_produk = 'aktif'"
        );

        if (!$stmt) {
            throw new RuntimeException(
                'Gagal menyiapkan penghapusan produk.'
            );
        }

        $stmt->bind_param('i', $id);

        try {
            $stmt->execute();

            if ($stmt->affected_rows > 0) {
                return 'deleted';
            }

        } catch (mysqli_sql_exception $error) {

            if ((int) $error->getCode() !== 1451) {
                throw $error;
            }

        } finally {
            $stmt->close();
        }

        $stmt = $this->conn->prepare(
            "UPDATE produk
             SET status_produk = 'nonaktif'
             WHERE id_produk = ?
             AND status_produk = 'aktif'"
        );

        if (!$stmt) {
            throw new RuntimeException(
                'Gagal menyiapkan penonaktifan produk.'
            );
        }

        $stmt->bind_param('i', $id);

        try {
            $stmt->execute();

            if ($stmt->affected_rows > 0) {
                return 'deactivated';
            }

            throw new RuntimeException(
                'Produk gagal dinonaktifkan.'
            );

        } finally {
            $stmt->close();
        }
    }

    /**
     * Memastikan kode produk tidak duplikat.
     */
    private function assertUniqueCode(
        string $kode,
        ?int $excludeId = null
    ): void {

        $sql = "SELECT id_produk
                FROM produk
                WHERE kode_produk = ?";

        if ($excludeId !== null) {
            $sql .= " AND id_produk <> ?";
        }

        $sql .= " LIMIT 1";

        $stmt = $this->conn->prepare($sql);

        if (!$stmt) {
            throw new RuntimeException(
                'Gagal memvalidasi kode produk.'
            );
        }

        if ($excludeId !== null) {
            $stmt->bind_param(
                'si',
                $kode,
                $excludeId
            );
        } else {
            $stmt->bind_param('s', $kode);
        }

        $stmt->execute();

        $exists = $stmt->get_result()->num_rows > 0;

        $stmt->close();

        if ($exists) {
            throw new RuntimeException(
                'Kode produk sudah digunakan.'
            );
        }
    }

    /**
     * Menangani kesalahan database.
     */
    private function handleDatabaseError(
        mysqli_sql_exception $error
    ): void {

        if ((int) $error->getCode() === 1062) {
            throw new RuntimeException(
                'Kode produk sudah digunakan.'
            );
        }

        throw new RuntimeException(
            'Operasi produk gagal diproses.'
        );
    }
}