<?php

// Entry Point dan Routing
// 1. Konfigurasi dasar
date_default_timezone_set('Asia/Jakarta');

// 2. Memanggil helper response
require_once __DIR__ . '/helpers/response.php';

// 3. Memanggil koneksi database MySQLi
require_once __DIR__ . '/config/database.php';

// 4. MENGAMBIL INFORMASI REQUEST
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

$requestUri = parse_url(
    $_SERVER['REQUEST_URI'] ?? '/',
    PHP_URL_PATH
);

// Mengambil direktori dasar API
$basePath = rtrim(
    dirname($_SERVER['SCRIPT_NAME'] ?? ''),
    '/'
);

// Mengambil route dari URL
if (strpos($requestUri, $basePath) === 0) {
    $route = substr($requestUri, strlen($basePath));
} else {
    $route = $requestUri;
}

$route = '/' . trim($route, '/');

// Menangani akses langsung melalui index.php
if ($route === '/index.php') {
    $route = '/';
}

// Mendukung parameter route
if (isset($_GET['route'])) {
    $route = '/' . trim($_GET['route'], '/');
}

// 5. ROUTING REST API
try {
    // ROUTE: GET /
    // Mengecek apakah REST API aktif
    if ($route === '/' && $method === 'GET') {

        successResponse(
            'REST API ARTHA berhasil dijalankan.',
            [
                'application' => 'ARTHA',
                'version' => '1.0.0',
                'status' => 'running'
            ]
        );
    }

    // ROUTE: GET /test-db
    // Menguji koneksi database MySQLi
    if ($route === '/test-db' && $method === 'GET') {

        // Memeriksa ketersediaan koneksi
        if (!isset($conn) || !($conn instanceof mysqli)) {

            errorResponse(
                'Koneksi database MySQLi tidak tersedia.',
                500
            );
        }

        // Memeriksa koneksi database
        if ($conn->connect_error) {

            errorResponse(
                'Koneksi database gagal.',
                500
            );
        }

        // Menjalankan query pengujian
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

        // Mengirim respons berhasil
        successResponse(
            'Koneksi database berhasil.',
            [
                'database' => $database['nama_database'],
                'connection' => 'connected',
                'driver' => 'MySQLi'
            ]
        );
    }

    // ROUTE TIDAK DITEMUKAN
    errorResponse(
        'Endpoint tidak ditemukan.',
        404
    );


} catch (Throwable $error) {

    // Mencatat error pada log server
    error_log(
        '[ARTHA API ERROR] ' . $error->getMessage()
    );

    errorResponse(
        'Terjadi kesalahan pada server.',
        500
    );

}