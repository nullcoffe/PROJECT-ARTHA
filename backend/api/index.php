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