
<?php
require_once __DIR__ . '/../assets/cache-busting.php';
require_once '../../backend/api/middleware/auth.php';

artha_require_page_role(['pemilik']);
?>

<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Prioritas Penambahan Stok | ARTHA</title>

    <!-- Shared CSS -->
    <link rel="stylesheet" href="<?= artha_asset('../assets/css/shared/variables.css') ?>">
    <link rel="stylesheet" href="<?= artha_asset('../assets/css/shared/reset.css') ?>">

    <!-- Web CSS -->
    <link rel="stylesheet" href="<?= artha_asset('../assets/css/web/layout.css') ?>">
    <link rel="stylesheet" href="<?= artha_asset('../assets/css/web/sidebar.css') ?>">
    <link rel="stylesheet" href="<?= artha_asset('../assets/css/web/header.css') ?>">
    <link rel="stylesheet" href="<?= artha_asset('../assets/css/web/pemilik/prioritasStok.css') ?>">

    <!-- Mobile CSS -->
    <link rel="stylesheet" href="<?= artha_asset('../assets/css/mobile/layout.css') ?>">
    <link rel="stylesheet" href="<?= artha_asset('../assets/css/mobile/sidebar.css') ?>">
    <link rel="stylesheet" href="<?= artha_asset('../assets/css/mobile/header.css') ?>">

    <link rel="stylesheet" href="<?= artha_asset('../assets/css/mobile/pemilik/prioritasStok.css') ?>">
    <link rel="stylesheet" href="<?= artha_asset('../assets/css/shared/notificationPopup.css') ?>">
</head>

<body>

    <!-- Kontrol Sidebar -->
    <input
        type="checkbox"
        id="sidebar-toggle"
        class="sidebar-checkbox"
        aria-label="Buka sidebar"
    >

    <div class="dashboard-layout">

        <!-- Sidebar Pemilik -->
        <aside class="sidebar">

            <div class="sidebar-brand">

                <div class="brand-left">

                    <img
                        src="<?= artha_asset('../assets/images/Logo.svg') ?>"
                        alt="Logo ARTHA"
                        class="brand-logo"
                    >

                    <span class="brand-title">ARTHA</span>

                </div>

                <label
                    for="sidebar-toggle"
                    class="close-sidebar-btn"
                    aria-label="Tutup sidebar"
                >
                    <img
                        src="<?= artha_asset('../assets/icons/actions/cancel.svg') ?>"
                        alt=""
                    >
                </label>

            </div>

            <!-- Menu Pemilik -->
            <nav class="sidebar-nav">

                <a href="dashboard.php" class="nav-item">

                    <img
                        src="<?= artha_asset('../assets/icons/sidebar/dashboard.svg') ?>"
                        alt=""
                        class="nav-icon"
                    >

                    <span>Dashboard</span>

                </a>

                <a href="laporan.php" class="nav-item">

                    <img
                        src="<?= artha_asset('../assets/icons/sidebar/laporan.svg') ?>"
                        alt=""
                        class="nav-icon"
                    >

                    <span>Laporan</span>

                </a>

                <a href="analisisApriori.php" class="nav-item">

                    <img
                        src="<?= artha_asset('../assets/icons/sidebar/analisisApriori.svg') ?>"
                        alt=""
                        class="nav-icon"
                    >

                    <span>Analisis Apriori</span>

                </a>

                <a href="paketPromosi.php" class="nav-item">

                    <img
                        src="<?= artha_asset('../assets/icons/sidebar/paketPromosi.svg') ?>"
                        alt=""
                        class="nav-icon"
                    >

                    <span>Paket Promosi</span>

                </a>

                <a
                    href="prioritasStok.php"
                    class="nav-item active"
                    aria-current="page"
                >

                    <img
                        src="<?= artha_asset('../assets/icons/sidebar/prioritasStok.svg') ?>"
                        alt=""
                        class="nav-icon"
                    >

                    <span>Prioritas Stok</span>

                </a>

                <a href="../logout.php" class="nav-item logout">

                    <img
                        src="<?= artha_asset('../assets/icons/actions/logout.svg') ?>"
                        alt=""
                        class="nav-icon"
                    >

                    <span>Keluar</span>

                </a>

            </nav>

        </aside>

        <!-- Hamburger Mobile -->
        <label
            for="sidebar-toggle"
            class="hamburger-btn"
            aria-label="Buka sidebar"
        >
            <img
                src="<?= artha_asset('../assets/icons/actions/hamburger.svg') ?>"
                alt=""
            >
        </label>

        <!-- Overlay Sidebar -->
        <label
            for="sidebar-toggle"
            class="sidebar-overlay"
            aria-label="Tutup sidebar"
        ></label>

        <!-- Konten Utama -->
        <main class="main-content">

            <!-- Header -->
            <header class="dashboard-header">

                <h1>Prioritas Penambahan Stok</h1>

                <div class="header-right">

                    <div class="user-profile">

                        <div class="profile-circle">

                            <img
                                src="<?= artha_asset('../assets/icons/header/profile.svg') ?>"
                                alt=""
                            >

                        </div>

                        <span>Pemilik</span>

                    </div>

                </div>

            </header>

            <!-- Konten Halaman -->
            <div class="page-container">

                <main class="owner-stock-content">

                    <!-- Statistik Stok -->
                    <section class="stock-statistics">

                        <article class="stock-stat-card">

                            <p>Produk Prioritas</p>

                            <h2 id="stat-priority">0</h2>

                        </article>

                        <article class="stock-stat-card">

                            <p>Dibawah minimum</p>

                            <h2 id="stat-below-minimum">0</h2>

                        </article>

                        <article class="stock-stat-card">

                            <p>Item dipantau</p>

                            <h2 id="stat-monitored">0</h2>

                        </article>

                    </section>

                    <!-- Tabel Prioritas Stok -->
                    <section class="stock-table-card">

                        <div class="stock-table-wrapper">

                            <table class="stock-table">

                                <thead>

                                    <tr>

                                        <th>Produk</th>

                                        <th>Stok</th>

                                        <th>Batas minimum</th>

                                        <th>Prioritas</th>

                                    </tr>

                                </thead>

                                <tbody id="priority-stock-body">

                                    <tr>
                                        <td colspan="4" class="empty-state-cell">
                                            Memuat data prioritas stok...
                                        </td>
                                    </tr>

                                </tbody>

                            </table>

                        </div>

                    </section>

                </main>

            </div>

        </main>

    </div>

    <!-- Popup ARTHA -->
    <script
        src="<?= artha_asset('../assets/js/shared/popup.js') ?>"
        defer
    ></script>

    <!-- JavaScript Prioritas Stok -->
    <script
        src="<?= artha_asset('../assets/js/pemilik/prioritas-stok.js') ?>"
        defer
    ></script>

    <!-- Navigasi -->
    <script
        src="<?= artha_asset('../assets/js/navigation.js') ?>"
        defer
    ></script>

</body>
</html>
