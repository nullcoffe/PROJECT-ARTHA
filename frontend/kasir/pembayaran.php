<?php require_once __DIR__ . '/../assets/cache-busting.php'; ?>

<?php
// Halaman pembayaran transaksi oleh Kasir
?>

<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#FFFDF0">

    <title>Kasir / Pembayaran | ARTHA</title>

    <!-- CSS utama -->
    <link rel="stylesheet" href="<?= artha_asset('../assets/css/shared/variables.css') ?>">
    <link rel="stylesheet" href="<?= artha_asset('../assets/css/shared/reset.css') ?>">
    <link rel="stylesheet" href="<?= artha_asset('../assets/css/shared/notificationPopup.css') ?>">

    <!-- CSS desktop -->
    <link rel="stylesheet" href="<?= artha_asset('../assets/css/web/layout.css') ?>">
    <link rel="stylesheet" href="<?= artha_asset('../assets/css/web/sidebar.css') ?>">
    <link rel="stylesheet" href="<?= artha_asset('../assets/css/web/header.css') ?>">

    <!-- CSS mobile -->
    <link rel="stylesheet" href="<?= artha_asset('../assets/css/mobile/layout.css') ?>">
    <link rel="stylesheet" href="<?= artha_asset('../assets/css/mobile/sidebar.css') ?>">
    <link rel="stylesheet" href="<?= artha_asset('../assets/css/mobile/header.css') ?>">

    <!-- CSS pembayaran -->
    <link rel="stylesheet" href="<?= artha_asset('../assets/css/web/kasir/pembayaran.css') ?>">
    <link rel="stylesheet" href="<?= artha_asset('../assets/css/mobile/kasir/pembayaran.css') ?>">

</head>

<body class="cashier-page payment-page">

    <input class="sidebar-checkbox" type="checkbox" id="sidebar-toggle">

    <div class="dashboard-layout">

        <!-- Sidebar Kasir -->
        <aside class="sidebar">

            <div class="sidebar-brand">

                <a href="dashboard.php" class="brand-left">

                    <img src="<?= artha_asset('../assets/images/Logo.svg') ?>" class="brand-logo" alt="Logo ARTHA">

                    <span class="brand-title">ARTHA</span>

                </a>

                <label class="sidebar-close" for="sidebar-toggle" aria-label="Tutup menu">
                    &times;
                </label>

            </div>

            <!-- Menu navigasi Kasir -->
            <nav class="sidebar-nav" aria-label="Navigasi kasir">

                <a class="nav-item" href="dashboard.php">

                    <img class="nav-icon" src="<?= artha_asset('../assets/icons/sidebar/dashboard.svg') ?>" alt="">

                    <span>Dashboard</span>

                </a>

                <a class="nav-item" href="transaksiPOS.php">

                    <img class="nav-icon" src="<?= artha_asset('../assets/icons/sidebar/transaksiPos.svg') ?>" alt="">

                    <span>Transaksi POS</span>

                </a>

                <a class="nav-item active" href="pembayaran.php">

                    <img class="nav-icon" src="<?= artha_asset('../assets/icons/sidebar/pembayaran.svg') ?>" alt="">

                    <span>Pembayaran</span>

                </a>

                <a class="nav-item" href="cetakStruk.php">

                    <img class="nav-icon" src="<?= artha_asset('../assets/icons/sidebar/cetakStruk.svg') ?>" alt="">

                    <span>Cetak Struk</span>

                </a>

                <a class="nav-item" href="cekStok.php">

                    <img class="nav-icon" src="<?= artha_asset('../assets/icons/sidebar/cekStok.svg') ?>" alt="">

                    <span>Cek Stok</span>

                </a>

                <!-- Keluar dari halaman Kasir -->
                <a class="nav-item logout" href="../logout.php">

                    <img class="nav-icon" src="<?= artha_asset('../assets/icons/actions/logout.svg') ?>" alt="">

                    <span>Keluar</span>

                </a>

            </nav>

        </aside>

        <label class="sidebar-overlay" for="sidebar-toggle" aria-label="Tutup menu"></label>

        <!-- Konten utama pembayaran -->
        <main class="main-content">

            <header class="dashboard-header">

                <div class="header-left">

                    <label class="hamburger-btn" for="sidebar-toggle" aria-label="Buka menu">

                        <img src="<?= artha_asset('../assets/icons/actions/hamburger.svg') ?>" alt="">

                    </label>

                    <h1>Kasir / Pembayaran</h1>

                    <a href="dashboard.php" class="mobile-brand">

                        <img src="<?= artha_asset('../assets/images/Logo.svg') ?>" alt="">

                        <span>ARTHA</span>

                    </a>

                </div>

                <div class="header-right">

                    <div class="user-profile">

                        <div class="profile-circle">

                            <img src="<?= artha_asset('../assets/icons/header/profile.svg') ?>" alt="">

                        </div>

                        <span>Kasir</span>

                    </div>

                </div>

            </header>

            <h1 class="mobile-page-title">
                Kasir / Pembayaran
            </h1>

            <div class="payment-layout">

                <!-- Ringkasan transaksi -->
                <section class="payment-summary">

                    <h2>Ringkasan Transaksi</h2>

                    <div class="payment-summary-table-wrap">

                        <table class="payment-table">

                            <thead>

                                <tr>
                                    <th>ID Produk</th>
                                    <th>Nama Produk</th>
                                    <th>Harga</th>
                                    <th>Qty</th>
                                    <th>Jumlah</th>
                                </tr>

                            </thead>

                            <tbody id="paymentTableBody">
                            </tbody>

                        </table>

                    </div>

                    <div class="payment-summary-total">

                        <strong>Total Transaksi</strong>

                        <b id="paymentTotal">Rp 0</b>

                    </div>

                </section>

                <!-- Form pembayaran -->
                <section class="payment-card">

                    <h2>Pembayaran</h2>

                    <div class="payment-field">

                        <label class="form-label">
                            Metode Pembayaran
                        </label>

                        <div class="method-box">

                            <input type="radio" name="payment-method" checked disabled>

                            <strong>Tunai</strong>

                        </div>

                    </div>

                    <!-- Input uang diterima -->
                    <div class="payment-field">

                        <label class="form-label" for="uang-diterima">
                            Uang Diterima
                        </label>

                        <div class="received-box">

                            <span>Rp</span>

                            <input
                                type="text"
                                id="uang-diterima"
                                value="0"
                                inputmode="numeric"
                                autocomplete="off"
                                placeholder="Masukkan nominal"
                            >

                        </div>

                    </div>

                    <!-- Pilihan nominal uang cepat -->
                    <div class="quick-amounts">

                        <a href="#uang-diterima">Rp 1.000</a>
                        <a href="#uang-diterima">Rp 2.000</a>
                        <a href="#uang-diterima">Rp 5.000</a>

                        <a href="#uang-diterima">Rp 10.000</a>
                        <a href="#uang-diterima">Rp 20.000</a>
                        <a href="#uang-diterima">Rp 50.000</a>

                        <a href="#uang-diterima">Rp 75.000</a>
                        <a href="#uang-diterima">Rp 100.000</a>
                        <a href="#uang-diterima">Rp 150.000</a>

                    </div>

                    <!-- Tampilan uang kembalian -->
                    <div class="change-box">

                        <strong>Kembalian</strong>

                        <strong class="change-value">
                            Rp 0
                        </strong>

                    </div>

                    <!-- Perhitungan pembayaran -->
                    <div class="payment-equation" id="paymentEquation">
                        Rp 0 − Rp 0
                    </div>

                    <!-- Tombol aksi pembayaran -->
                    <div class="payment-actions">

                        <a href="transaksiPOS.php" class="button-outline">

                            <img
                                src="<?= artha_asset('../assets/icons/actions/chevron-left.svg') ?>"
                                alt=""
                                class="action-arrow-icon"
                            >

                            Kembali

                        </a>

                        <a href="cetakStruk.php" class="button-primary" id="finishTransaction">

                            <img
                                src="<?= artha_asset('../assets/icons/actions/check.svg') ?>"
                                alt=""
                                class="action-check-icon"
                            >

                            Selesai Transaksi

                        </a>

                    </div>

                </section>

            </div>

        </main>

    </div>

    <script src="<?= artha_asset('../assets/js/config.js') ?>" defer></script>
    <script src="<?= artha_asset('../assets/js/api.js') ?>" defer></script>
    <script src="<?= artha_asset('../assets/js/shared/popup.js') ?>" defer></script>
    <script src="<?= artha_asset('../assets/js/navigation.js') ?>" defer></script>
    <script src="<?= artha_asset('../assets/js/kasir/pembayaran.js') ?>" defer></script>

</body>
</html>


</body>

</html>