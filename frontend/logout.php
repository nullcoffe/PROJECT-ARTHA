<?php

// Memulai pengelolaan session
require_once __DIR__ . '/../backend/api/middleware/auth.php';

// Mencegah halaman logout disimpan dalam cache browser
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');

// Mengakhiri session pengguna
artha_logout_session();

// Mengarahkan pengguna kembali ke halaman login
header('Location: index.php');
exit;