<?php

date_default_timezone_set('Asia/Jakarta');

require_once __DIR__ . '/helpers/response.php';
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/models/User.php';
require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/middleware/auth.php';

require_once __DIR__ . '/models/Product.php';
require_once __DIR__ . '/controllers/ProductController.php';

require_once __DIR__ . '/models/Stockmovement.php';
require_once __DIR__ . '/controllers/StockController.php';

require_once __DIR__ . '/models/Transaction.php';
require_once __DIR__ . '/controllers/TransactionController.php';

require_once __DIR__ . '/services/AprioriService.php';
require_once __DIR__ . '/controllers/AprioriController.php';

$transactionModel = new Transaction($conn);

$transactionController = new TransactionController(
    $transactionModel
);

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

$requestUri = parse_url(
    $_SERVER['REQUEST_URI'] ?? '/',
    PHP_URL_PATH
);

$basePath = rtrim(
    dirname($_SERVER['SCRIPT_NAME'] ?? ''),
    '/'
);

if (
    $basePath !== '' &&
    strpos($requestUri, $basePath) === 0
) {
    $route = substr(
        $requestUri,
        strlen($basePath)
    );
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

    // Memastikan koneksi database tersedia.
    if (
        !isset($conn) ||
        !($conn instanceof mysqli)
    ) {
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

    // Inisialisasi model dan controller.
    $userModel = new User($conn);

    $authController = new AuthController(
        $userModel
    );

    $productModel = new Product($conn);

    $productController = new ProductController(
        $productModel
    );

    $stockModel = new Stockmovement($conn);

    $stockController = new StockController(
        $stockModel
    );

    // Inisialisasi service dan controller Apriori.
    $aprioriService = new AprioriService($conn);

    $aprioriController = new AprioriController(
        $aprioriService
    );

    // Endpoint utama API.
    if (
        $route === '/' &&
        $method === 'GET'
    ) {
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

    // Menguji koneksi database.
    if (
        $route === '/test-db' &&
        $method === 'GET'
    ) {
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

    // Memproses login pengguna.
    if (
        $route === '/login' &&
        $method === 'POST'
    ) {
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

        $loginResult = $authController->login(
            $username,
            $password
        );

        if (
            !isset($loginResult['success']) ||
            $loginResult['success'] !== true
        ) {
            errorResponse(
                $loginResult['message']
                    ?? 'Username atau password salah.',
                401
            );
        }

        $user = $loginResult['data'];

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

        $dashboardRoutes = [
            'admin' => 'admin/dashboard.php',
            'pemilik' => 'pemilik/dashboard.php',
            'kasir' => 'kasir/dashboard.php'
        ];

        successResponse(
            'Login berhasil.',
            [
                'user' => $user,
                'redirect' => $dashboardRoutes[$databaseRole]
            ]
        );
    }

    // Memproses logout pengguna.
    if (
        $route === '/logout' &&
        $method === 'POST'
    ) {
        $logoutResult = $authController->logout();

        successResponse(
            $logoutResult['message'],
            null
        );
    }

    // Mengambil informasi pengguna yang sedang login.
    if (
        $route === '/me' &&
        $method === 'GET'
    ) {
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

    // Mengambil seluruh pengguna untuk Admin.
    if (
        $route === '/admin/users' &&
        $method === 'GET'
    ) {
        artha_require_role(['admin']);

        $users = $userModel->getAll();

        successResponse(
            'Data pengguna berhasil diambil.',
            $users
        );
    }

    // Mengambil ringkasan Dashboard Admin dari MySQL.
    if (
        $route === '/admin/dashboard' &&
        $method === 'GET'
    ) {
        artha_require_role(['admin']);

        $year = isset($_GET['year'])
            ? (int) $_GET['year']
            : (int) date('Y');

        if ($year < 2000 || $year > 2100) {
            errorResponse(
                'Tahun laporan tidak valid.',
                422
            );
        }

        // Menghitung jumlah seluruh pengguna.
        $userResult = $conn->query(
            "SELECT COUNT(*) AS total
             FROM pengguna"
        );

        if (!$userResult) {
            throw new RuntimeException(
                'Gagal mengambil jumlah pengguna.'
            );
        }

        $totalPengguna = (int) $userResult
            ->fetch_assoc()['total'];

        // Menghitung jumlah produk aktif.
        $productResult = $conn->query(
            "SELECT COUNT(*) AS total
             FROM produk
             WHERE status_produk = 'aktif'"
        );

        if (!$productResult) {
            throw new RuntimeException(
                'Gagal mengambil jumlah produk.'
            );
        }

        $totalProduk = (int) $productResult
            ->fetch_assoc()['total'];

        // Menghitung jumlah produk dengan stok menipis.
        $stockResult = $conn->query(
            "SELECT COUNT(*) AS total
             FROM produk
             WHERE status_produk = 'aktif'
             AND stok <= stok_minimum"
        );

        if (!$stockResult) {
            throw new RuntimeException(
                'Gagal mengambil jumlah stok menipis.'
            );
        }

        $stokMenipis = (int) $stockResult
            ->fetch_assoc()['total'];

        // Menentukan rentang tanggal berdasarkan tahun.
        $startDate = sprintf(
            '%04d-01-01 00:00:00',
            $year
        );

        $endDate = sprintf(
            '%04d-01-01 00:00:00',
            $year + 1
        );

        // Mengambil total penjualan setiap bulan.
        $stmt = $conn->prepare(
            "SELECT
                MONTH(tanggal_transaksi) AS bulan,
                COALESCE(SUM(total_bayar), 0) AS total_penjualan
             FROM transaksi
             WHERE tanggal_transaksi >= ?
             AND tanggal_transaksi < ?
             GROUP BY MONTH(tanggal_transaksi)
             ORDER BY MONTH(tanggal_transaksi)"
        );

        if (!$stmt) {
            throw new RuntimeException(
                'Gagal menyiapkan grafik penjualan.'
            );
        }

        $stmt->bind_param(
            'ss',
            $startDate,
            $endDate
        );

        $stmt->execute();

        $result = $stmt->get_result();

        // Menyediakan 12 bulan, termasuk bulan tanpa transaksi.
        $penjualanBulanan = array_fill(0, 12, 0);

        while ($row = $result->fetch_assoc()) {
            $monthIndex = (int) $row['bulan'] - 1;

            if ($monthIndex >= 0 && $monthIndex < 12) {
                $penjualanBulanan[$monthIndex] =
                    (float) $row['total_penjualan'];
            }
        }

        $stmt->close();

        successResponse(
            'Dashboard Admin berhasil dimuat dari database.',
            [
                'total_pengguna' => $totalPengguna,
                'total_produk' => $totalProduk,
                'stok_menipis' => $stokMenipis,
                'tahun' => $year,
                'penjualan_bulanan' => $penjualanBulanan
            ]
        );
    }

    // Mengambil ringkasan Dashboard Pemilik dari database.
    if (
        $route === '/pemilik/dashboard' &&
        $method === 'GET'
    ) {
        artha_require_role(['pemilik']);

        $year = isset($_GET['year'])
            ? (int) $_GET['year']
            : (int) date('Y');

        if ($year < 2000 || $year > 2100) {
            errorResponse(
                'Tahun laporan tidak valid.',
                422
            );
        }

        // Mengambil omzet dan jumlah seluruh transaksi.
        $summaryResult = $conn->query(
            "SELECT
                COALESCE(SUM(total_bayar), 0) AS total_omzet,
                COUNT(*) AS jumlah_transaksi
             FROM transaksi"
        );

        if (!$summaryResult) {
            throw new RuntimeException(
                'Gagal mengambil ringkasan penjualan.'
            );
        }

        $summary = $summaryResult->fetch_assoc();

        // Mengambil jumlah aturan asosiasi pada analisis terakhir.
        // Jika tabel atau data Apriori belum tersedia,
        // dashboard tetap dapat menampilkan ringkasan penjualan.
        $totalRekomendasi = 0;

        try {
            $recommendationResult = $conn->query(
                "SELECT COUNT(aa.id_aturan_asosiasi) AS total_rekomendasi
                 FROM analisis_apriori ap
                 LEFT JOIN aturan_asosiasi aa
                    ON aa.id_analisis_apriori = ap.id_analisis_apriori
                 WHERE ap.id_analisis_apriori = (
                    SELECT id_analisis_apriori
                    FROM analisis_apriori
                    ORDER BY tanggal_analisis DESC,
                             id_analisis_apriori DESC
                    LIMIT 1
                 )"
            );

            if ($recommendationResult) {
                $recommendationRow =
                    $recommendationResult->fetch_assoc();

                $totalRekomendasi = (int) (
                    $recommendationRow['total_rekomendasi'] ?? 0
                );
            }
        } catch (Throwable $error) {
            error_log(
                '[ARTHA] Data rekomendasi Apriori belum tersedia: ' .
                $error->getMessage()
            );

            $totalRekomendasi = 0;
        }

        // Menentukan periode grafik berdasarkan tahun.
        $startDate = sprintf(
            '%04d-01-01 00:00:00',
            $year
        );

        $endDate = sprintf(
            '%04d-01-01 00:00:00',
            $year + 1
        );

        // Mengambil total penjualan setiap bulan.
        $salesStmt = $conn->prepare(
            "SELECT
                MONTH(tanggal_transaksi) AS bulan,
                COALESCE(SUM(total_bayar), 0) AS total_penjualan
             FROM transaksi
             WHERE tanggal_transaksi >= ?
             AND tanggal_transaksi < ?
             GROUP BY MONTH(tanggal_transaksi)
             ORDER BY MONTH(tanggal_transaksi)"
        );

        if (!$salesStmt) {
            throw new RuntimeException(
                'Gagal menyiapkan grafik penjualan Pemilik.'
            );
        }

        $salesStmt->bind_param(
            'ss',
            $startDate,
            $endDate
        );

        $salesStmt->execute();

        $salesResult = $salesStmt->get_result();

        // Menyediakan 12 bulan, termasuk bulan tanpa transaksi.
        $monthlySales = array_fill(0, 12, 0);

        while ($row = $salesResult->fetch_assoc()) {
            $monthIndex = (int) $row['bulan'] - 1;

            if ($monthIndex >= 0 && $monthIndex < 12) {
                $monthlySales[$monthIndex] =
                    (float) $row['total_penjualan'];
            }
        }

        $salesStmt->close();

        successResponse(
            'Dashboard Pemilik berhasil dimuat dari database.',
            [
                'total_omzet' => (float) $summary['total_omzet'],
                'jumlah_transaksi' => (int) $summary['jumlah_transaksi'],
                'total_rekomendasi' => $totalRekomendasi,
                'tahun' => $year,
                'penjualan_bulanan' => $monthlySales
            ]
        );
    }
    
        // Mengambil laporan penjualan untuk Pemilik.
        if (
            $route === '/pemilik/laporan' &&
            $method === 'GET'
        ) {
            artha_require_role(['pemilik']);

            $year = isset($_GET['year'])
                ? (int) $_GET['year']
                : (int) date('Y');

            if ($year < 2000 || $year > 2100) {
                errorResponse(
                    'Tahun laporan tidak valid.',
                    422
                );
            }

            $startDate = sprintf(
                '%04d-01-01 00:00:00',
                $year
            );

            $endDate = sprintf(
                '%04d-01-01 00:00:00',
                $year + 1
            );

            // Mengambil ringkasan transaksi dan produk unik.
            $summaryStmt = $conn->prepare(
                "SELECT
                    COUNT(DISTINCT t.id_transaksi) AS total_transaksi,
                    COUNT(DISTINCT dt.id_produk) AS produk_unik
                FROM transaksi t
                LEFT JOIN detail_transaksi dt
                    ON dt.id_transaksi = t.id_transaksi
                WHERE t.tanggal_transaksi >= ?
                AND t.tanggal_transaksi < ?"
            );

            if (!$summaryStmt) {
                throw new RuntimeException(
                    'Gagal menyiapkan ringkasan laporan.'
                );
            }

            $summaryStmt->bind_param(
                'ss',
                $startDate,
                $endDate
            );

            $summaryStmt->execute();

            $summary = $summaryStmt
                ->get_result()
                ->fetch_assoc();

            $summaryStmt->close();

            // Mengambil penjualan setiap bulan.
            $salesStmt = $conn->prepare(
                "SELECT
                    MONTH(tanggal_transaksi) AS bulan,
                    COALESCE(SUM(total_bayar), 0) AS total_penjualan
                FROM transaksi
                WHERE tanggal_transaksi >= ?
                AND tanggal_transaksi < ?
                GROUP BY MONTH(tanggal_transaksi)
                ORDER BY MONTH(tanggal_transaksi)"
            );

            if (!$salesStmt) {
                throw new RuntimeException(
                    'Gagal menyiapkan grafik penjualan.'
                );
            }

            $salesStmt->bind_param(
                'ss',
                $startDate,
                $endDate
            );

            $salesStmt->execute();

            $salesResult = $salesStmt->get_result();

            $monthlySales = array_fill(0, 12, 0);

            while ($row = $salesResult->fetch_assoc()) {
                $monthIndex = (int) $row['bulan'] - 1;

                if ($monthIndex >= 0 && $monthIndex < 12) {
                    $monthlySales[$monthIndex] =
                        (float) $row['total_penjualan'];
                }
            }

            $salesStmt->close();

            // Menghitung seluruh kuantitas produk yang terjual.
            $quantityStmt = $conn->prepare(
                "SELECT
                    COALESCE(SUM(dt.jumlah), 0) AS total_qty
                FROM transaksi t
                INNER JOIN detail_transaksi dt
                    ON dt.id_transaksi = t.id_transaksi
                WHERE t.tanggal_transaksi >= ?
                AND t.tanggal_transaksi < ?"
            );

            if (!$quantityStmt) {
                throw new RuntimeException(
                    'Gagal menghitung jumlah produk terjual.'
                );
            }

            $quantityStmt->bind_param(
                'ss',
                $startDate,
                $endDate
            );

            $quantityStmt->execute();

            $totalQuantity = (float) $quantityStmt
                ->get_result()
                ->fetch_assoc()['total_qty'];

            $quantityStmt->close();

            // Mengambil lima produk dengan jumlah penjualan tertinggi.
            $productStmt = $conn->prepare(
                "SELECT
                    p.id_produk,
                    p.kode_produk,
                    p.nama_produk,
                    p.satuan,
                    COALESCE(SUM(dt.jumlah), 0) AS jumlah_terjual
                FROM transaksi t
                INNER JOIN detail_transaksi dt
                    ON dt.id_transaksi = t.id_transaksi
                INNER JOIN produk p
                    ON p.id_produk = dt.id_produk
                WHERE t.tanggal_transaksi >= ?
                AND t.tanggal_transaksi < ?
                GROUP BY
                    p.id_produk,
                    p.kode_produk,
                    p.nama_produk,
                    p.satuan
                ORDER BY jumlah_terjual DESC, p.nama_produk ASC
                LIMIT 5"
            );

            if (!$productStmt) {
                throw new RuntimeException(
                    'Gagal mengambil laporan produk.'
                );
            }

            $productStmt->bind_param(
                'ss',
                $startDate,
                $endDate
            );

            $productStmt->execute();

            $productResult = $productStmt->get_result();

            $topProducts = [];

            while ($row = $productResult->fetch_assoc()) {
                $quantity = (float) $row['jumlah_terjual'];

                $contribution = $totalQuantity > 0
                    ? ($quantity / $totalQuantity) * 100
                    : 0;

                $topProducts[] = [
                    'id_produk' => (int) $row['id_produk'],
                    'kode_produk' => $row['kode_produk'],
                    'nama_produk' => $row['nama_produk'],
                    'satuan' => $row['satuan'],
                    'jumlah_terjual' => $quantity,
                    'kontribusi' => round($contribution, 2)
                ];
            }

            $productStmt->close();

            successResponse(
                'Laporan penjualan berhasil dimuat dari database.',
                [
                    'tahun' => $year,
                    'total_transaksi' => (int) $summary['total_transaksi'],
                    'produk_unik' => (int) $summary['produk_unik'],
                    'total_qty_terjual' => $totalQuantity,
                    'penjualan_bulanan' => $monthlySales,
                    'produk_terlaris' => $topProducts
                ]
            );
        }

    // Mengambil katalog produk aktif untuk Kasir.
    if (
        $route === '/kasir/products' &&
        $method === 'GET'
    ) {
        $currentUser = artha_require_auth();

        $role = strtolower(
            trim((string) ($currentUser['peran'] ?? ''))
        );

        if (!in_array($role, ['kasir', 'admin'], true)) {
            errorResponse(
                'Anda tidak memiliki hak akses.',
                403
            );
        }

        $transactionController->products();
    }

    // Menyimpan transaksi penjualan dari Kasir.
    if (
        $route === '/kasir/transactions' &&
        $method === 'POST'
    ) {
        $currentUser = artha_require_auth();

        $role = strtolower(
            trim((string) ($currentUser['peran'] ?? ''))
        );

        if ($role !== 'kasir') {
            errorResponse(
                'Hanya Kasir yang dapat membuat transaksi penjualan.',
                403
            );
        }

        $input = json_decode(
            file_get_contents('php://input'),
            true
        );

        if (!is_array($input)) {
            errorResponse(
                'Format transaksi tidak valid.',
                400
            );
        }

        $transactionController->store(
            $input,
            $currentUser
        );
    }

    // Mengambil struk transaksi milik Kasir yang sedang login.
    if (
        preg_match(
            '#^/kasir/transactions/([A-Za-z0-9-]+)$#',
            $route,
            $matches
        ) &&
        $method === 'GET'
    ) {
        $currentUser = artha_require_auth();

        $role = strtolower(
            trim((string) ($currentUser['peran'] ?? ''))
        );

        if ($role !== 'kasir') {
            errorResponse(
                'Hanya Kasir yang dapat mengakses struk ini.',
                403
            );
        }

        $transactionController->receipt(
            $matches[1],
            $currentUser
        );
    }

    // Mengambil seluruh transaksi untuk Admin.
    if (
        $route === '/admin/transactions' &&
        $method === 'GET'
    ) {
        artha_require_role(['admin']);

        $transactionController->index();
    }

    // GET /kasir/dashboard
    if (
        $route === '/kasir/dashboard' &&
        $method === 'GET'
    ) {
        $currentUser = artha_require_role(['kasir']);

        $transactionController->cashierDashboard(
            $currentUser
        );
    }

    // Menambahkan pengguna baru melalui Admin.
    if (
        $route === '/admin/users' &&
        $method === 'POST'
    ) {
        artha_require_role(['admin']);

        $rawInput = file_get_contents('php://input');

        $input = json_decode(
            $rawInput,
            true
        );

        if (!is_array($input)) {
            errorResponse(
                'Data pengguna tidak valid.',
                400
            );
        }

        $namaLengkap = trim(
            $input['nama_lengkap'] ?? ''
        );

        $namaPengguna = trim(
            $input['nama_pengguna'] ?? ''
        );

        $password = $input['password'] ?? '';

        $peran = strtolower(
            trim($input['peran'] ?? '')
        );

        if (
            $namaLengkap === '' ||
            $namaPengguna === '' ||
            $password === '' ||
            $peran === ''
        ) {
            errorResponse(
                'Semua data pengguna wajib diisi.',
                422
            );
        }

        if (!in_array(
            $peran,
            ['pemilik', 'kasir'],
            true
        )) {
            errorResponse(
                'Jenis pengguna tidak valid.',
                422
            );
        }

        if (strlen($password) < 8) {
            errorResponse(
                'Kata sandi minimal 8 karakter.',
                422
            );
        }

        $id = $userModel->create(
            $namaLengkap,
            $namaPengguna,
            $password,
            $peran
        );

        successResponse(
            'Pengguna berhasil ditambahkan.',
            [
                'id_pengguna' => (int) $id
            ],
            201
        );
    }

    // Memperbarui data pengguna melalui Admin.
    if (
        preg_match(
            '#^/admin/users/([0-9]+)$#',
            $route,
            $matches
        ) &&
        $method === 'PUT'
    ) {
        artha_require_role(['admin']);

        $id = (int) $matches[1];

        $rawInput = file_get_contents('php://input');

        $input = json_decode(
            $rawInput,
            true
        );

        if (!is_array($input)) {
            errorResponse(
                'Data pengguna tidak valid.',
                400
            );
        }

        $namaLengkap = trim(
            $input['nama_lengkap'] ?? ''
        );

        $namaPengguna = trim(
            $input['nama_pengguna'] ?? ''
        );

        $password = $input['password'] ?? '';

        $peran = strtolower(
            trim($input['peran'] ?? '')
        );

        if (
            $namaLengkap === '' ||
            $namaPengguna === '' ||
            $peran === ''
        ) {
            errorResponse(
                'Nama, username, dan jenis pengguna wajib diisi.',
                422
            );
        }

        if (!in_array(
            $peran,
            ['pemilik', 'kasir'],
            true
        )) {
            errorResponse(
                'Jenis pengguna tidak valid.',
                422
            );
        }

        if (
            $password !== '' &&
            strlen($password) < 8
        ) {
            errorResponse(
                'Kata sandi baru minimal 8 karakter.',
                422
            );
        }

        $userModel->update(
            $id,
            $namaLengkap,
            $namaPengguna,
            $peran,
            $password
        );

        successResponse(
            'Data pengguna berhasil diperbarui.'
        );
    }

    // Menghapus pengguna melalui Admin.
    if (
        preg_match(
            '#^/admin/users/([0-9]+)$#',
            $route,
            $matches
        ) &&
        $method === 'DELETE'
    ) {
        artha_require_role(['admin']);

        $id = (int) $matches[1];

        $currentUser = artha_current_user();

        if (
            $currentUser !== null &&
            (int) $currentUser['id_pengguna'] === $id
        ) {
            errorResponse(
                'Akun yang sedang digunakan tidak dapat dihapus.',
                422
            );
        }

        $deleted = $userModel->delete($id);

        if (!$deleted) {
            errorResponse(
                'Pengguna tidak ditemukan.',
                404
            );
        }

        successResponse(
            'Pengguna berhasil dihapus.'
        );
    }

    // Mengambil seluruh produk aktif untuk Admin.
    if (
        $route === '/admin/products' &&
        $method === 'GET'
    ) {
        artha_require_role(['admin']);

        $productController->index();
    }

    // Mengambil detail produk berdasarkan ID.
    if (
        preg_match(
            '#^/admin/products/([0-9]+)$#',
            $route,
            $matches
        ) &&
        $method === 'GET'
    ) {
        artha_require_role(['admin']);

        $productController->show(
            (int) $matches[1]
        );
    }

    // Mengambil daftar produk nonaktif.
    if (
        $route === '/admin/products/inactive' &&
        $method === 'GET'
    ) {
        artha_require_role(['admin']);

        $productController->inactive();
    }

    // Mengaktifkan kembali produk nonaktif.
    if (
        preg_match(
            '#^/admin/products/([0-9]+)/activate$#',
            $route,
            $matches
        ) &&
        $method === 'POST'
    ) {
        artha_require_role(['admin']);

        $productController->activate(
            (int) $matches[1]
        );
    }

    // Menambahkan produk baru.
    if (
        $route === '/admin/products' &&
        $method === 'POST'
    ) {
        artha_require_role(['admin']);

        $input = json_decode(
            file_get_contents('php://input'),
            true
        );

        if (!is_array($input)) {
            errorResponse(
                'Format data produk tidak valid.',
                400
            );
        }

        $productController->store($input);
    }

    // Memperbarui produk.
    if (
        preg_match(
            '#^/admin/products/([0-9]+)$#',
            $route,
            $matches
        ) &&
        $method === 'PUT'
    ) {
        artha_require_role(['admin']);

        $input = json_decode(
            file_get_contents('php://input'),
            true
        );

        if (!is_array($input)) {
            errorResponse(
                'Format perubahan produk tidak valid.',
                400
            );
        }

        $productController->update(
            (int) $matches[1],
            $input
        );
    }

    // Menghapus atau menonaktifkan produk.
    if (
        preg_match(
            '#^/admin/products/([0-9]+)$#',
            $route,
            $matches
        ) &&
        $method === 'DELETE'
    ) {
        artha_require_role(['admin']);

        $productController->destroy(
            (int) $matches[1]
        );
    }

    // Mengambil riwayat perubahan stok.
    if (
        $route === '/admin/stock/history' &&
        $method === 'GET'
    ) {
        artha_require_role(['admin']);

        $stockController->index();
    }

    // Mengambil detail riwayat stok.
    if (
        preg_match(
            '#^/admin/stock/history/([0-9]+)$#',
            $route,
            $matches
        ) &&
        $method === 'GET'
    ) {
        artha_require_role(['admin']);

        $stockController->show(
            (int) $matches[1]
        );
    }

    // Melakukan penyesuaian stok melalui Admin.
    if (
        $route === '/admin/stock/adjust' &&
        $method === 'POST'
    ) {
        artha_require_role(['admin']);

        $input = json_decode(
            file_get_contents('php://input'),
            true
        );

        if (!is_array($input)) {
            errorResponse(
                'Format penyesuaian stok tidak valid.',
                400
            );
        }

        $stockController->adjust($input);
    }

        // Menjalankan analisis Apriori untuk Pemilik.
    if (
        $route === '/pemilik/apriori/analyze' &&
        $method === 'POST'
    ) {
        $currentUser = artha_require_role(['pemilik']);

        $input = json_decode(
            file_get_contents('php://input'),
            true
        );

        if (!is_array($input)) {
            errorResponse(
                'Format parameter analisis tidak valid.',
                400
            );
        }

        $aprioriController->analyze(
            $input,
            $currentUser
        );
    }

    // Mengambil hasil analisis Apriori terakhir untuk Paket Promosi.
    if (
        $route === '/pemilik/apriori/latest' &&
        $method === 'GET'
    ) {
        $currentUser = artha_require_role(['pemilik']);

        $aprioriController->latest($currentUser);
    }

    /**
     * Mengambil seluruh produk untuk analisis Prioritas Stok Pemilik.
     */
    if (
        $route === '/pemilik/stock/priority' &&
        $method === 'GET'
    ) {
        artha_require_role(['pemilik']);

        $stockController->priority();
    }

    // Mengembalikan respons jika endpoint tidak ditemukan.
    errorResponse(
        'Endpoint tidak ditemukan.',
        404
    );

} catch (Throwable $error) {

    error_log(
        '[ARTHA API ERROR] ' .
        $error->getMessage()
    );

    $statusCode = (int) $error->getCode();

    if (!in_array(
        $statusCode,
        [401, 403, 404, 422],
        true
    )) {
        $statusCode = 500;
    }

    errorResponse(
        $error->getMessage(),
        $statusCode
    );
}