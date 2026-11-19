<?php require_once __DIR__ . '/../assets/cache-busting.php'; ?>
<?php
// Halaman cetak struk transaksi Kasir
?>

<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#FFFDF0">

    <title>Struk Transaksi | ARTHA</title>

    <!-- CSS utama -->
    <link rel="stylesheet" href="<?= artha_asset('../assets/css/shared/variables.css') ?>">
    <link rel="stylesheet" href="<?= artha_asset('../assets/css/shared/reset.css') ?>">

    <!-- CSS desktop -->
    <link rel="stylesheet" href="<?= artha_asset('../assets/css/web/layout.css') ?>">
    <link rel="stylesheet" href="<?= artha_asset('../assets/css/web/sidebar.css') ?>">
    <link rel="stylesheet" href="<?= artha_asset('../assets/css/web/header.css') ?>">

    <!-- CSS mobile -->
    <link rel="stylesheet" href="<?= artha_asset('../assets/css/mobile/layout.css') ?>">
    <link rel="stylesheet" href="<?= artha_asset('../assets/css/mobile/sidebar.css') ?>">
    <link rel="stylesheet" href="<?= artha_asset('../assets/css/mobile/header.css') ?>">

    <!-- CSS halaman struk mobile -->
    <link rel="stylesheet" href="<?= artha_asset('../assets/css/mobile/kasir/cetakStruk.css') ?>">

    <!-- CSS halaman struk desktop dan pengaturan cetak -->
    <link rel="stylesheet" href="<?= artha_asset('../assets/css/web/kasir/cetakStruk.css') ?>">

    <!-- CSS notifikasi -->
    <link rel="stylesheet" href="<?= artha_asset('../assets/css/shared/notificationPopup.css') ?>">

</head>

<body class="cashier-page">

    <input class="sidebar-checkbox" type="checkbox" id="sidebar-toggle">

    <div class="dashboard-layout">

        <!-- Sidebar navigasi -->
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

                <a class="nav-item" href="pembayaran.php">

                    <img class="nav-icon" src="<?= artha_asset('../assets/icons/sidebar/pembayaran.svg') ?>" alt="">

                    <span>Pembayaran</span>

                </a>

                <a class="nav-item active" href="cetakStruk.php">

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

        <!-- Konten utama -->
        <main class="main-content">

            <!-- Header halaman -->
            <header class="dashboard-header">

                <div class="header-left">

                    <label class="hamburger-btn" for="sidebar-toggle" aria-label="Buka menu">

                        <img src="<?= artha_asset('../assets/icons/actions/hamburger.svg') ?>" alt="">

                    </label>

                    <h1>Struk Transaksi</h1>

                    <a class="mobile-brand" href="dashboard.php">

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

            <h1 class="mobile-page-title">Struk Transaksi</h1>

            <!-- Area struk transaksi -->
            <section class="receipt-area">

                <div class="receipt-paper">

                    <h2>TOKO ARTHA</h2>

                    <p class="receipt-subtitle">
                        Struk Penjualan
                    </p>

                    <div class="receipt-dash"></div>

                    <div class="receipt-line receipt-transaction">
                        <span>No Transaksi</span>
                        <span id="receipt-transaction-id">-</span>
                    </div>

                    <div class="receipt-line">

                        <span>Tanggal</span>

                        <span id="receipt-date">-</span>

                    </div>

                    <div class="receipt-dash"></div>

                    <div id="receipt-items">
                        <!-- Daftar produk dimuat melalui JavaScript -->
                    </div>

                    <div class="receipt-dash"></div>

                    <div class="receipt-line total">

                        <strong>TOTAL</strong>

                        <strong id="receipt-total">Rp 0</strong>

                    </div>

                    <div class="receipt-line">

                        <span>Metode Pembayaran</span>

                        <span id="receipt-method">-</span>

                    </div>

                    <div class="receipt-line">

                        <span>Uang Diterima</span>

                        <span id="receipt-received">Rp 0</span>

                    </div>

                    <div class="receipt-line">

                        <strong>Kembali</strong>

                        <strong id="receipt-change">Rp 0</strong>

                    </div>

                    <p class="receipt-thanks">
                        Terima kasih telah berbelanja
                    </p>

                </div>

                <!-- Tombol tindakan struk -->
                <div class="receipt-actions">

                    <button type="button" class="button-primary" id="btn-print">
                        Cetak Struk
                    </button>

                    <button type="button" class="button-light" id="btn-save-pdf">
                        Simpan PDF
                    </button>

                    <a href="transaksiPOS.php" class="button-primary">
                        Transaksi Baru
                    </a>

                </div>

            </section>

        </main>

    </div>

    <!-- JavaScript konfigurasi -->
    <script src="<?= artha_asset('../assets/js/config.js') ?>" defer></script>

    <!-- Library untuk menyimpan struk sebagai PDF -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.3/html2pdf.bundle.min.js" defer></script>

    <!-- JavaScript popup dan navigasi -->
    <script src="<?= artha_asset('../assets/js/shared/popup.js') ?>" defer></script>
    <script src="<?= artha_asset('../assets/js/navigation.js') ?>" defer></script>
    <script src="<?= artha_asset('../assets/js/api.js') ?>" defer></script>

    <!-- JavaScript cetak struk -->
    <script src="<?= artha_asset('../assets/js/kasir/cetakStruk.js') ?>" defer></script>

</body>

</html>