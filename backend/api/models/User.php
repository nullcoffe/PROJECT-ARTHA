
<?php

class User
{
    private mysqli $conn;

    public function __construct(mysqli $conn)
    {
        $this->conn = $conn;
    }

    /**
     * Mengambil seluruh data pengguna.
     */
    public function getAll(): array
    {
        $sql = "SELECT id_pengguna, nama_lengkap, nama_pengguna, peran
                FROM pengguna
                ORDER BY id_pengguna ASC";

        $result = $this->conn->query($sql);

        if (!$result) {
            throw new RuntimeException('Gagal mengambil daftar pengguna.');
        }

        return $result->fetch_all(MYSQLI_ASSOC);
    }

    /**
     * Mencari pengguna berdasarkan username.
     */
    public function findByUsername(string $username): ?array
    {
        $sql = "SELECT id_pengguna, nama_lengkap, nama_pengguna,
                       kata_sandi AS kata_sandi, peran
                FROM pengguna
                WHERE nama_pengguna = ?
                LIMIT 1";

        $stmt = $this->conn->prepare($sql);

        if (!$stmt) {
            throw new RuntimeException('Gagal menyiapkan pencarian pengguna.');
        }

        $stmt->bind_param('s', $username);
        $stmt->execute();

        $user = $stmt->get_result()->fetch_assoc();

        $stmt->close();

        return $user ?: null;
    }

    /**
     * Mencari pengguna berdasarkan ID.
     */
    public function findById(int $idPengguna): ?array
    {
        $sql = "SELECT id_pengguna, nama_lengkap, nama_pengguna,
                       kata_sandi AS kata_sandi, peran
                FROM pengguna
                WHERE id_pengguna = ?
                LIMIT 1";

        $stmt = $this->conn->prepare($sql);

        if (!$stmt) {
            throw new RuntimeException('Gagal menyiapkan pencarian pengguna.');
        }

        $stmt->bind_param('i', $idPengguna);
        $stmt->execute();

        $user = $stmt->get_result()->fetch_assoc();

        $stmt->close();

        return $user ?: null;
    }

    /**
     * Menambahkan pengguna baru.
     */
    public function create(
        string $namaLengkap,
        string $namaPengguna,
        string $password,
        string $peran
    ): int {

        $this->assertUniqueUsername($namaPengguna);
        $this->assertOwnerLimit($peran);

        $passwordHash = password_hash(
            $password,
            PASSWORD_DEFAULT
        );

        if ($passwordHash === false) {
            throw new RuntimeException('Kata sandi gagal diproses.');
        }

        $sql = "INSERT INTO pengguna
                (nama_lengkap, nama_pengguna, kata_sandi, peran)
                VALUES (?, ?, ?, ?)";

        $stmt = $this->conn->prepare($sql);

        if (!$stmt) {
            throw new RuntimeException('Gagal menyiapkan penyimpanan pengguna.');
        }

        $stmt->bind_param(
            'ssss',
            $namaLengkap,
            $namaPengguna,
            $passwordHash,
            $peran
        );

        try {
            $stmt->execute();
            $id = (int) $this->conn->insert_id;
        } catch (mysqli_sql_exception $error) {
            $this->throwDatabaseError($error);
        } finally {
            $stmt->close();
        }

        return $id;
    }

    /**
     * Mengubah data pengguna.
     * Password kosong berarti password tidak diubah.
     */
    public function update(
        int $idPengguna,
        string $namaLengkap,
        string $namaPengguna,
        string $peran,
        string $password = ''
    ): bool {

        if ($this->findById($idPengguna) === null) {
            throw new RuntimeException('Pengguna tidak ditemukan.');
        }

        $this->assertUniqueUsername(
            $namaPengguna,
            $idPengguna
        );

        $this->assertOwnerLimit(
            $peran,
            $idPengguna
        );

        if ($password !== '') {

            $passwordHash = password_hash(
                $password,
                PASSWORD_DEFAULT
            );

            if ($passwordHash === false) {
                throw new RuntimeException('Kata sandi gagal diproses.');
            }

            $sql = "UPDATE pengguna
                    SET nama_lengkap = ?,
                        nama_pengguna = ?,
                        peran = ?,
                        kata_sandi = ?
                    WHERE id_pengguna = ?";

            $stmt = $this->conn->prepare($sql);

            if (!$stmt) {
                throw new RuntimeException('Gagal menyiapkan perubahan pengguna.');
            }

            $stmt->bind_param(
                'ssssi',
                $namaLengkap,
                $namaPengguna,
                $peran,
                $passwordHash,
                $idPengguna
            );

        } else {

            $sql = "UPDATE pengguna
                    SET nama_lengkap = ?,
                        nama_pengguna = ?,
                        peran = ?
                    WHERE id_pengguna = ?";

            $stmt = $this->conn->prepare($sql);

            if (!$stmt) {
                throw new RuntimeException('Gagal menyiapkan perubahan pengguna.');
            }

            $stmt->bind_param(
                'sssi',
                $namaLengkap,
                $namaPengguna,
                $peran,
                $idPengguna
            );
        }

        try {
            $stmt->execute();
        } catch (mysqli_sql_exception $error) {
            $this->throwDatabaseError($error);
        } finally {
            $stmt->close();
        }

        return true;
    }

    /**
     * Mengupdate password pengguna.
     */
    public function updatePassword(int $idPengguna, string $passwordHash): bool
    {
        $sql = "UPDATE pengguna
                SET kata_sandi = ?
                WHERE id_pengguna = ?";

        $stmt = $this->conn->prepare($sql);

        if (!$stmt) {
            throw new RuntimeException('Gagal menyiapkan pembaruan password.');
        }

        $stmt->bind_param('si', $passwordHash, $idPengguna);
        $stmt->execute();

        $updated = $stmt->affected_rows > 0;

        $stmt->close();

        return $updated;
    }

    /**
     * Menghapus pengguna.
     */
    public function delete(int $idPengguna): bool
    {
        $sql = "DELETE FROM pengguna
                WHERE id_pengguna = ?";

        $stmt = $this->conn->prepare($sql);

        if (!$stmt) {
            throw new RuntimeException('Gagal menyiapkan penghapusan pengguna.');
        }

        $stmt->bind_param('i', $idPengguna);
        $stmt->execute();

        $deleted = $stmt->affected_rows > 0;

        $stmt->close();

        return $deleted;
    }

    /**
     * Memastikan username tidak digunakan akun lain.
     */
    private function assertUniqueUsername(
        string $username,
        ?int $excludeId = null
    ): void {

        $sql = "SELECT id_pengguna
                FROM pengguna
                WHERE nama_pengguna = ?";

        if ($excludeId !== null) {
            $sql .= " AND id_pengguna <> ?";
        }

        $sql .= " LIMIT 1";

        $stmt = $this->conn->prepare($sql);

        if (!$stmt) {
            throw new RuntimeException('Gagal memvalidasi username.');
        }

        if ($excludeId !== null) {
            $stmt->bind_param('si', $username, $excludeId);
        } else {
            $stmt->bind_param('s', $username);
        }

        $stmt->execute();

        $exists = $stmt->get_result()->num_rows > 0;

        $stmt->close();

        if ($exists) {
            throw new RuntimeException(
                'Username sudah digunakan. Silakan gunakan username lain.'
            );
        }
    }

    /**
     * Membatasi hanya satu akun Pemilik.
     */
    private function assertOwnerLimit(
        string $role,
        ?int $excludeId = null
    ): void {

        if ($role !== 'pemilik') {
            return;
        }

        $sql = "SELECT id_pengguna
                FROM pengguna
                WHERE peran = 'pemilik'";

        if ($excludeId !== null) {
            $sql .= " AND id_pengguna <> ?";
        }

        $sql .= " LIMIT 1";

        $stmt = $this->conn->prepare($sql);

        if (!$stmt) {
            throw new RuntimeException('Gagal memvalidasi jenis pengguna.');
        }

        if ($excludeId !== null) {
            $stmt->bind_param('i', $excludeId);
        }

        $stmt->execute();

        $exists = $stmt->get_result()->num_rows > 0;

        $stmt->close();

        if ($exists) {
            throw new RuntimeException(
                'Sistem ARTHA hanya mengizinkan satu akun Pemilik.'
            );
        }
    }

    /**
     * Menangani kesalahan database.
     */
    private function throwDatabaseError(
        mysqli_sql_exception $error
    ): void {

        if ((int) $error->getCode() === 1062) {
            throw new RuntimeException(
                'Username sudah digunakan. Silakan gunakan username lain.'
            );
        }

        throw new RuntimeException(
            'Operasi data pengguna gagal diproses.'
        );
    }
}

?>