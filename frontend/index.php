<?php require_once __DIR__ . '/assets/cache-busting.php'; ?>
<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#FFFDF0">

    <title>Login | ARTHA</title>

    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="<?= artha_asset('assets/images/Logo.svg') ?>">

    <!-- CSS utama -->
    <link rel="stylesheet" href="<?= artha_asset('assets/css/shared/variables.css') ?>">
    <link rel="stylesheet" href="<?= artha_asset('assets/css/shared/reset.css') ?>">

    <!-- CSS halaman login -->
    <link rel="stylesheet" href="<?= artha_asset('assets/css/web/auth.css') ?>">
    <link rel="stylesheet" href="<?= artha_asset('assets/css/mobile/auth.css') ?>">
    <link rel="stylesheet" href="<?= artha_asset('assets/css/web/loginValidation.css') ?>">

    <!-- CSS popup -->
    <link rel="stylesheet" href="<?= artha_asset('assets/css/shared/notificationPopup.css') ?>">

</head>

<body class="auth-page">

    <main class="auth-shell">

        <!-- Branding ARTHA untuk desktop -->
        <section class="auth-brand-panel" aria-label="Tentang ARTHA">

            <a href="index.php" class="auth-brand" aria-label="ARTHA">

                <img src="<?= artha_asset('assets/images/Logo.svg') ?>" alt="Logo ARTHA" class="auth-logo">

                <span>ARTHA</span>

            </a>

            <div class="auth-brand-copy">

                <h1>
                    Sistem Penjualan<br>
                    dan Analisis Produk
                </h1>

                <p>
                    Kelola transaksi, stok, dan analisis pola pembelian
                    dalam satu platform
                </p>

            </div>

        </section>

        <!-- Form login -->
        <section class="auth-form-panel">

            <!-- Branding ARTHA untuk tampilan mobile -->
            <div class="auth-mobile-intro">

                <a href="index.php" class="auth-mobile-brand" aria-label="ARTHA">

                    <img src="<?= artha_asset('assets/images/Logo.svg') ?>" alt="Logo ARTHA">

                    <span>ARTHA</span>

                </a>

                <h1>
                    Sistem Penjualan dan Analisis Produk
                </h1>

                <p>
                    Kelola transaksi, stok, dan analisis pola pembelian
                    dalam satu platform
                </p>

            </div>

            <div class="auth-form-wrap">

                <!-- Judul halaman login -->
                <div class="auth-heading">

                    <h2>Selamat Datang!</h2>

                    <p>
                        Silahkan masuk dengan akun anda
                    </p>

                </div>

                <!-- Login oleh pengguna -->
                <form class="login-form" novalidate>

                    <!-- Input username -->
                    <div class="login-field">

                        <label for="username">Username</label>

                        <div class="login-validation-message" id="username-error" role="alert" hidden>

                            <span class="login-validation-icon">!</span>

                            <span class="login-validation-text">
                                Username wajib diisi.
                            </span>

                        </div>

                        <div class="login-input-wrap">

                            <img src="<?= artha_asset('assets/icons/login/user.svg') ?>" alt="" class="login-field-icon">

                            <input
                                type="text"
                                id="username"
                                name="username"
                                placeholder="Masukkan Username anda"
                                autocomplete="username"
                                required
                            >

                        </div>

                    </div>

                    <!-- Input kata sandi -->
                    <div class="login-field">

                        <label for="password">Kata sandi</label>

                        <div class="login-validation-message" id="password-error" role="alert" hidden>

                            <span class="login-validation-icon">!</span>

                            <span class="login-validation-text">
                                Kata sandi wajib diisi.
                            </span>

                        </div>

                        <div class="login-input-wrap login-password-wrap">

                            <img src="<?= artha_asset('assets/icons/login/lock.svg') ?>" alt="" class="login-field-icon">

                            <input
                                type="password"
                                id="password"
                                name="password"
                                placeholder="Masukkan Kata Sandi anda"
                                autocomplete="current-password"
                                required
                            >

                            <button
                                type="button"
                                class="login-password-toggle"
                                aria-label="Tampilkan kata sandi"
                                aria-pressed="false"
                            >
                                <!-- Ikon mata dikendalikan oleh JavaScript -->
                            </button>

                        </div>

                    </div>

                    <!-- Pilihan jenis pengguna -->
                    <div class="login-field">

                        <label id="role-label">Jenis Pengguna</label>

                        <div class="login-validation-message" id="role-error" role="alert" hidden>

                            <span class="login-validation-icon">!</span>

                            <span class="login-validation-text">
                                Silakan pilih jenis pengguna.
                            </span>

                        </div>

                        <details class="role-picker">

                            <!-- Tombol pilihan jenis pengguna -->
                            <summary class="role-picker-trigger role-control" id="role-control">

                                <img
                                    src="<?= artha_asset('assets/icons/login/manyuser.svg') ?>"
                                    alt=""
                                    class="role-trigger-icon"
                                >

                                <span class="role-current role-default" id="role-current-label">
                                    -Pilih-
                                </span>

                                <span class="role-current role-admin">
                                    Admin
                                </span>

                                <span class="role-current role-owner">
                                    Pemilik
                                </span>

                                <span class="role-current role-cashier">
                                    Kasir
                                </span>

                                <span class="role-chevron" aria-hidden="true"></span>

                            </summary>

                            <!-- Daftar jenis pengguna -->
                            <div class="role-picker-menu">

                                <label class="role-option" for="role-admin">

                                    <input
                                        type="radio"
                                        name="jenis_pengguna"
                                        id="role-admin"
                                        value="admin"
                                        required
                                    >

                                    <img src="<?= artha_asset('assets/icons/login/manyuser.svg') ?>" alt="">

                                    <span>Admin</span>

                                </label>

                                <label class="role-option" for="role-owner">

                                    <input
                                        type="radio"
                                        name="jenis_pengguna"
                                        id="role-owner"
                                        value="pemilik"
                                    >

                                    <img src="<?= artha_asset('assets/icons/login/manyuser.svg') ?>" alt="">

                                    <span>Pemilik</span>

                                </label>

                                <label class="role-option" for="role-cashier">

                                    <input
                                        type="radio"
                                        name="jenis_pengguna"
                                        id="role-cashier"
                                        value="kasir"
                                    >

                                    <img src="<?= artha_asset('assets/icons/login/manyuser.svg') ?>" alt="">

                                    <span>Kasir</span>

                                </label>

                            </div>

                        </details>

                    </div>

                    <!-- Tombol masuk -->
                    <button type="submit" class="login-button">

                        <span>Masuk</span>

                        <span class="login-arrow" aria-hidden="true">
                            ⟶
                        </span>

                    </button>

                </form>

            </div>

        </section>

    </main>

    <!-- JavaScript konfigurasi -->
    <script src="<?= artha_asset('assets/js/config.js') ?>" defer></script>

    <!-- JavaScript API -->
    <script src="<?= artha_asset('assets/js/api.js') ?>" defer></script>

    <!-- JavaScript popup -->
    <script src="<?= artha_asset('assets/js/shared/popup.js') ?>" defer></script>

    <!-- JavaScript login -->
    <script src="<?= artha_asset('assets/js/auth.js') ?>" defer></script>

</body>
</html>