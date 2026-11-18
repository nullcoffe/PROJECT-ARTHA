<?php

class User
{
    private $conn;

    // Menerima koneksi database dari database.php
    public function __construct(mysqli $conn)
    {
        $this->conn = $conn;
    }

    // Mencari pengguna berdasarkan username
    public function findByUsername($username)
    {
        $sql = "SELECT 
                    id_pengguna,
                    nama_lengkap,
                    nama_pengguna,
                    kata_sandi,
                    peran
                FROM pengguna
                WHERE nama_pengguna = ?
                LIMIT 1";

        $stmt = $this->conn->prepare($sql);

        if (!$stmt) {
            throw new Exception("Gagal menyiapkan query pengguna.");
        }

        $stmt->bind_param("s", $username);
        $stmt->execute();

        $result = $stmt->get_result();
        $user = $result->fetch_assoc();

        $stmt->close();

        return $user ?: null;
    }

    // Mencari pengguna berdasarkan ID
    public function findById($idPengguna)
    {
        $sql = "SELECT
                    id_pengguna,
                    nama_lengkap,
                    nama_pengguna,
                    kata_sandi,
                    peran
                FROM pengguna
                WHERE id_pengguna = ?
                LIMIT 1";

        $stmt = $this->conn->prepare($sql);

        if (!$stmt) {
            throw new Exception("Gagal menyiapkan query pengguna.");
        }

        $stmt->bind_param("i", $idPengguna);
        $stmt->execute();

        $result = $stmt->get_result();
        $user = $result->fetch_assoc();

        $stmt->close();

        return $user ?: null;
    }
}

?>