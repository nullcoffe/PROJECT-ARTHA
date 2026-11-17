<?php

// Memulai session jika belum aktif
function artha_start_session()
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    $isHttps = (
        isset($_SERVER['HTTPS']) &&
        $_SERVER['HTTPS'] !== 'off'
    );

    ini_set('session.use_strict_mode', '1');

    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => $isHttps,
        'httponly' => true,
        'samesite' => 'Lax'
    ]);

    session_start();
}

// Menyimpan data pengguna ke dalam session setelah login
function artha_login_session(array $user)
{
    artha_start_session();

    session_regenerate_id(true);

    $_SESSION['user'] = [
        'id_pengguna' => (int) $user['id_pengguna'],
        'nama_lengkap' => $user['nama_lengkap'],
        'nama_pengguna' => $user['nama_pengguna'],
        'peran' => $user['peran']
    ];
}

// Mengambil data pengguna yang sedang login
function artha_current_user()
{
    artha_start_session();

    return $_SESSION['user'] ?? null;
}

// Memeriksa apakah pengguna sudah login
function artha_is_authenticated()
{
    return artha_current_user() !== null;
}

// Memastikan pengguna sudah login sebelum mengakses fitur
function artha_require_auth()
{
    $user = artha_current_user();

    if ($user === null) {
        throw new RuntimeException(
            'Anda harus login terlebih dahulu.',
            401
        );
    }

    return $user;
}

// Memeriksa apakah role pengguna memiliki izin akses
function artha_require_role(array $allowedRoles)
{
    $user = artha_require_auth();

    if (!in_array($user['peran'], $allowedRoles, true)) {
        throw new RuntimeException(
            'Anda tidak memiliki hak akses.',
            403
        );
    }

    return $user;
}

// Mengakhiri session dan menghapus cookie pengguna
function artha_logout_session()
{
    artha_start_session();

    $_SESSION = [];

    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();

        setcookie(
            session_name(),
            '',
            [
                'expires' => time() - 42000,
                'path' => $params['path'],
                'domain' => $params['domain'],
                'secure' => $params['secure'],
                'httponly' => $params['httponly'],
                'samesite' => $params['samesite'] ?? 'Lax'
            ]
        );
    }

    session_destroy();
}