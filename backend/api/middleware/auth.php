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
        'lifetime' => 600,
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

// Memeriksa apakah role pengguna memiliki izin akses.
function artha_require_role(array $allowedRoles)
{
    $user = artha_require_auth();

    // Normalisasi role pengguna.
    $userRole = strtolower(
        trim((string) ($user['peran'] ?? ''))
    );

    // Normalisasi seluruh role yang diizinkan.
    $allowedRoles = array_map(
        function ($role) {
            return strtolower(trim((string) $role));
        },
        $allowedRoles
    );

    if (
        $userRole === '' ||
        !in_array($userRole, $allowedRoles, true)
    ) {
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


function artha_require_page_role(array $allowedRoles)
{
    artha_start_session();

    // Mencegah halaman terlindungi tersimpan di cache browser.
    if (!headers_sent()) {
        header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
        header('Pragma: no-cache');
        header('Expires: 0');
    }

    // 1. Periksa apakah pengguna sudah login.
    if (
        !isset($_SESSION['user']) ||
        !is_array($_SESSION['user'])
    ) {
        header('Location: /artha/frontend/index.php');
        exit;
    }

    // 2. Ambil role pengguna dari session.
    $user = $_SESSION['user'];

    $userRole = strtolower(
        trim((string) ($user['peran'] ?? ''))
    );

    // 3. Normalisasi role yang diperbolehkan.
    $allowedRoles = array_map(
        function ($role) {
            return strtolower(trim((string) $role));
        },
        $allowedRoles
    );

    // 4. Periksa kesesuaian role.
    if (
        $userRole === '' ||
        !in_array($userRole, $allowedRoles, true)
    ) {
        http_response_code(403);

        // Nama role untuk ditampilkan pada popup.
        $roleLabels = [
            'admin' => 'Admin',
            'pemilik' => 'Pemilik',
            'kasir' => 'Kasir'
        ];

        $currentRole = $roleLabels[$userRole] ?? 'Pengguna';

        $requiredRoles = array_map(
            function ($role) use ($roleLabels) {
                return $roleLabels[$role] ?? ucfirst($role);
            },
            $allowedRoles
        );

        $requiredRoleText = implode(' atau ', $requiredRoles);

        // Menentukan dashboard berdasarkan role pengguna.
        $dashboardRoutes = [
            'admin' => '/artha/frontend/admin/dashboard.php',
            'pemilik' => '/artha/frontend/pemilik/dashboard.php',
            'kasir' => '/artha/frontend/kasir/dashboard.php'
        ];

        $redirectUrl = $dashboardRoutes[$userRole]
            ?? '/artha/frontend/index.php';

        // Memastikan data session tersimpan sebelum halaman popup dikirim.
        session_write_close();
        ?>

        <!DOCTYPE html>
        <html lang="id">

        <head>
            <meta charset="UTF-8">

            <meta name="viewport"
                  content="width=device-width, initial-scale=1.0">

            <meta name="theme-color" content="#FFFDF0">

            <title>Akses Ditolak | ARTHA</title>

            <!-- CSS popup ARTHA -->
            <link rel="stylesheet"
                  href="/artha/frontend/assets/css/shared/variables.css">

            <link rel="stylesheet"
                  href="/artha/frontend/assets/css/shared/reset.css">

            <link rel="stylesheet"
                  href="/artha/frontend/assets/css/shared/notificationPopup.css">

        </head>

        <body>

            <!-- JavaScript popup ARTHA -->
            <script src="/artha/frontend/assets/js/shared/popup.js"></script>

            <script>
                document.addEventListener("DOMContentLoaded", function () {

                    // Tampilkan popup apabila role tidak sesuai.
                    window.arthaPopup.error(
                        "Anda login sebagai <?= htmlspecialchars($currentRole, ENT_QUOTES, 'UTF-8') ?>. Halaman ini hanya dapat diakses oleh <?= htmlspecialchars($requiredRoleText, ENT_QUOTES, 'UTF-8') ?>.",
                        {
                            title: "Gagal Memuat Halaman",
                            confirmText: "Mengerti"
                        }
                    ).then(function () {

                        // Kembali ke dashboard sesuai role pengguna.
                        window.location.replace(
                            <?= json_encode($redirectUrl) ?>
                        );

                    });

                });
            </script>

        </body>

        </html>

        <?php

        exit;
    }

    // 5. Role sesuai, halaman boleh diakses.
    return $user;
}