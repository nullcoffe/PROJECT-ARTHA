<?php

date_default_timezone_set('Asia/Jakarta');

require_once __DIR__ . '/helpers/response.php';
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/models/User.php';
require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/middleware/auth.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

$requestUri = parse_url(
    $_SERVER['REQUEST_URI'] ?? '/',
    PHP_URL_PATH
);

$basePath = rtrim(
    dirname($_SERVER['SCRIPT_NAME'] ?? ''),
    '/'
);

if ($basePath !== '' && strpos($requestUri, $basePath) === 0) {
    $route = substr($requestUri, strlen($basePath));
} else {
    $route = $requestUri;
}

$route = '/' . trim($route, '/');

if ($route === '/index.php') {
    $route = '/';
}

if (isset($_GET['route'])) {
    $route = '/' . trim($_GET['route'], '/');
}

try {

    /*
    |--------------------------------------------------------------------------
    | Koneksi Database
    |--------------------------------------------------------------------------
    */

    if (!isset($conn) || !($conn instanceof mysqli)) {
        errorResponse(
            'Koneksi database MySQLi tidak tersedia.',
            500
        );
    }

    if ($conn->connect_error) {
        errorResponse(
            'Koneksi database gagal.',
            500
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Model dan Controller
    |--------------------------------------------------------------------------
    */

    $userModel = new User($conn);

    $authController = new AuthController(
        $userModel
    );

    /*
    |--------------------------------------------------------------------------
    | GET /
    |--------------------------------------------------------------------------
    */

    if ($route === '/' && $method === 'GET') {

        successResponse(
            'REST API ARTHA berhasil dijalankan.',
            [
                'application' => 'ARTHA',
                'version' => '1.0.0',
                'status' => 'running',
                'driver' => 'MySQLi'
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | GET /test-db
    |--------------------------------------------------------------------------
    */

    if ($route === '/test-db' && $method === 'GET') {

        $result = $conn->query(
            'SELECT DATABASE() AS nama_database'
        );

        if (!$result) {
            errorResponse(
                'Pengujian database gagal.',
                500
            );
        }

        $database = $result->fetch_assoc();

        successResponse(
            'Koneksi database berhasil.',
            [
                'database' => $database['nama_database'],
                'connection' => 'connected',
                'driver' => 'MySQLi'
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | POST /login
    |--------------------------------------------------------------------------
    */

    if ($route === '/login' && $method === 'POST') {

        $rawInput = file_get_contents('php://input');

        $input = json_decode(
            $rawInput,
            true
        );

        if (!is_array($input)) {

            errorResponse(
                'Format permintaan login tidak valid.',
                400
            );
        }

        $username = trim(
            $input['username'] ?? ''
        );

        $password = $input['password'] ?? '';

        $role = strtolower(
            trim($input['role'] ?? '')
        );

        /*
        |--------------------------------------------------------------------------
        | Validasi Input
        |--------------------------------------------------------------------------
        */

        if (
            $username === '' ||
            $password === '' ||
            $role === ''
        ) {

            errorResponse(
                'Username, password, dan jenis pengguna wajib diisi.',
                422
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Validasi Role
        |--------------------------------------------------------------------------
        */

        $allowedRoles = [
            'admin',
            'pemilik',
            'kasir'
        ];

        if (!in_array($role, $allowedRoles, true)) {

            errorResponse(
                'Jenis pengguna tidak valid.',
                422
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Proses Login
        |--------------------------------------------------------------------------
        */

        $loginResult = $authController->login(
            $username,
            $password
        );

        if (
            !isset($loginResult['success']) ||
            $loginResult['success'] !== true
        ) {

            errorResponse(
                $loginResult['message'] ??
                'Username atau password salah.',
                401
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Data Pengguna
        |--------------------------------------------------------------------------
        */

        $user = $loginResult['data'];

        /*
        |--------------------------------------------------------------------------
        | Validasi Role Database
        |--------------------------------------------------------------------------
        */

        $databaseRole = strtolower(
            trim($user['peran'] ?? '')
        );

        if ($databaseRole !== $role) {

            $authController->logout();

            errorResponse(
                'Jenis pengguna tidak sesuai dengan akun yang terdaftar.',
                403
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Tujuan Dashboard
        |--------------------------------------------------------------------------
        */

        $dashboardRoutes = [
            'admin' => 'admin/dashboard.php',
            'pemilik' => 'pemilik/dashboard.php',
            'kasir' => 'kasir/dashboard.php'
        ];

        /*
        |--------------------------------------------------------------------------
        | Respons Login Berhasil
        |--------------------------------------------------------------------------
        */

        successResponse(
            'Login berhasil.',
            [
                'user' => $user,
                'redirect' => $dashboardRoutes[$databaseRole]
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | POST /logout
    |--------------------------------------------------------------------------
    */

    if ($route === '/logout' && $method === 'POST') {

        $logoutResult = $authController->logout();

        successResponse(
            $logoutResult['message'],
            null
        );
    }

    /*
    |--------------------------------------------------------------------------
    | GET /me
    |--------------------------------------------------------------------------
    */

    if ($route === '/me' && $method === 'GET') {

        $currentUser = $authController->currentUser();

        if (!$currentUser['success']) {

            errorResponse(
                $currentUser['message'],
                401
            );
        }

        successResponse(
            $currentUser['message'],
            $currentUser['data']
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Endpoint Tidak Ditemukan
    |--------------------------------------------------------------------------
    */

    errorResponse(
        'Endpoint tidak ditemukan.',
        404
    );

} catch (Throwable $error) {

    error_log(
        '[ARTHA API ERROR] ' .
        $error->getMessage()
    );

    errorResponse(
        'Terjadi kesalahan pada server.',
        500
    );
}