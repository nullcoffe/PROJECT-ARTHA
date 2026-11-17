<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/backend/api/config/database.php';
require_once __DIR__ . '/backend/api/models/User.php';
require_once __DIR__ . '/backend/api/controllers/AuthController.php';
require_once __DIR__ . '/backend/api/middleware/auth.php';

$userModel = new User($conn);
$authController = new AuthController($userModel);

$results = [];
$loginResult = null;

// Menguji koneksi database
$results['Koneksi MySQLi'] = $conn->ping();

// Menguji akses tabel pengguna
try {
    $query = $conn->query("SELECT COUNT(*) AS total FROM pengguna");
    $data = $query->fetch_assoc();

    $results['Akses tabel pengguna'] = true;
    $totalPengguna = $data['total'];

} catch (Exception $e) {
    $results['Akses tabel pengguna'] = false;
    $totalPengguna = 0;
}

// Menguji pencarian pengguna berdasarkan username
$foundUser = null;

if (isset($_POST['username']) && $_POST['username'] !== '') {
    $foundUser = $userModel->findByUsername($_POST['username']);
}

$results['Pencarian pengguna'] = $foundUser !== null;

// Memproses login ketika form dikirim
if (isset($_POST['action']) && $_POST['action'] === 'login') {

    $loginResult = $authController->login(
        $_POST['username'] ?? '',
        $_POST['password'] ?? ''
    );

}

// Menguji session dan hak akses
$currentUser = null;
$roleResult = false;

if (artha_is_authenticated()) {

    $currentUser = artha_current_user();

    try {
        artha_require_role([$currentUser['peran']]);
        $roleResult = true;

    } catch (RuntimeException $e) {
        $roleResult = false;
    }
}

// Memproses logout
if (isset($_POST['action']) && $_POST['action'] === 'logout') {
    $authController->logout();
    $currentUser = null;
    $roleResult = false;
}

function statusTest($status)
{
    return $status
        ? '<span style="color:green">BERHASIL</span>'
        : '<span style="color:red">GAGAL</span>';
}

?>

<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Pengujian Orang 1 - ARTHA</title>
</head>

<body>

<h2>Pengujian Backend ARTHA - Orang 1</h2>

<h3>1. Pengujian Database</h3>

<table border="1" cellpadding="8">
    <tr>
        <th>Komponen</th>
        <th>Status</th>
    </tr>

    <tr>
        <td>Koneksi MySQLi</td>
        <td><?= statusTest($results['Koneksi MySQLi']) ?></td>
    </tr>

    <tr>
        <td>Akses tabel pengguna</td>
        <td><?= statusTest($results['Akses tabel pengguna']) ?></td>
    </tr>

    <tr>
        <td>Jumlah pengguna</td>
        <td><?= $totalPengguna ?></td>
    </tr>
</table>

<h3>2. Pengujian Model User</h3>

<form method="POST">
    <label>Username:</label>
    <input type="text" name="username" required>

    <button type="submit" name="action" value="search">
        Cari Pengguna
    </button>
</form>

<?php if (isset($_POST['action']) && $_POST['action'] === 'search'): ?>

    <p>Status pencarian:
        <?= statusTest($foundUser !== null) ?>
    </p>

    <?php if ($foundUser !== null): ?>

        <p>ID: <?= htmlspecialchars((string) $foundUser['id_pengguna']) ?></p>
        <p>Nama: <?= htmlspecialchars($foundUser['nama_lengkap']) ?></p>
        <p>Username: <?= htmlspecialchars($foundUser['nama_pengguna']) ?></p>
        <p>Role: <?= htmlspecialchars($foundUser['peran']) ?></p>

    <?php else: ?>

        <p>Pengguna tidak ditemukan.</p>

    <?php endif; ?>

<?php endif; ?>

<h3>3. Pengujian Autentikasi</h3>

<form method="POST">
    <label>Username:</label>
    <input type="text" name="username" required>

    <br><br>

    <label>Password:</label>
    <input type="password" name="password" required>

    <br><br>

    <button type="submit" name="action" value="login">
        Login
    </button>
</form>

<?php if ($loginResult !== null): ?>

    <p>
        Hasil login:
        <?= statusTest($loginResult['success']) ?>
    </p>

    <p><?= htmlspecialchars($loginResult['message']) ?></p>

<?php endif; ?>

<h3>4. Pengujian Session dan Hak Akses</h3>

<p>Status session:
    <?= statusTest(artha_is_authenticated()) ?>
</p>

<?php if ($currentUser !== null): ?>

    <p>Nama: <?= htmlspecialchars($currentUser['nama_lengkap']) ?></p>

    <p>Role: <?= htmlspecialchars($currentUser['peran']) ?></p>

    <p>Hak akses:
        <?= statusTest($roleResult) ?>
    </p>

<?php endif; ?>

<h3>5. Pengujian Logout</h3>

<form method="POST">
    <button type="submit" name="action" value="logout">
        Logout
    </button>
</form>

<?php if (isset($_POST['action']) && $_POST['action'] === 'logout'): ?>

    <p>Status logout:
        <?= statusTest(!artha_is_authenticated()) ?>
    </p>

<?php endif; ?>

</body>
</html>