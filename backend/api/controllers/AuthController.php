<?php

require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../middleware/auth.php';

class AuthController
{
    private $userModel;

    public function __construct(User $userModel)
    {
        $this->userModel = $userModel;
    }

    // Memproses login pengguna berdasarkan username dan password
    public function login($username, $password)
    {
        $username = trim($username);

        if ($username === '' || $password === '') {
            return [
                'success' => false,
                'message' => 'Username dan password wajib diisi.'
            ];
        }

        $user = $this->userModel->findByUsername($username);

        if ($user === null) {
            return [
                'success' => false,
                'message' => 'Username atau password salah.'
            ];
        }

        if ($password !== $user['kata_sandi']) {
            return [
                'success' => false,
                'message' => 'Username atau password salah.'
            ];
        }

        // Menyimpan identitas pengguna ke session
        artha_login_session($user);

        return [
            'success' => true,
            'message' => 'Login berhasil.',
            'data' => [
                'id_pengguna' => (int) $user['id_pengguna'],
                'nama_lengkap' => $user['nama_lengkap'],
                'nama_pengguna' => $user['nama_pengguna'],
                'peran' => $user['peran']
            ]
        ];
    }

    // Mengakhiri session pengguna
    public function logout()
    {
        artha_logout_session();

        return [
            'success' => true,
            'message' => 'Logout berhasil.'
        ];
    }

    // Mengambil informasi pengguna yang sedang login
    public function currentUser()
    {
        $user = artha_current_user();

        if ($user === null) {
            return [
                'success' => false,
                'message' => 'Pengguna belum login.'
            ];
        }

        return [
            'success' => true,
            'message' => 'Data pengguna berhasil ditemukan.',
            'data' => $user
        ];
    }
}

?>