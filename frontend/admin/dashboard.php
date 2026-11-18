<?php

// Memuat sistem session dan pemeriksaan role
require_once '../../backend/api/middleware/auth.php';

// Hanya pengguna dengan role Admin yang boleh mengakses halaman ini
artha_require_page_role(['admin']);

// Mencegah halaman tetap tampil dari cache setelah logout
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');

?>

<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#FFFDF0">

    <title>Dashboard Admin | ARTHA</title>

    <!-- CSS utama -->
    <link rel="stylesheet" href="../assets/css/shared/variables.css">
    <link rel="stylesheet" href="../assets/css/shared/reset.css">

    <!-- CSS desktop -->
    <link rel="stylesheet" href="../assets/css/web/layout.css">
    <link rel="stylesheet" href="../assets/css/web/sidebar.css">
    <link rel="stylesheet" href="../assets/css/web/header.css">

    <!-- CSS mobile -->
    <link rel="stylesheet" href="../assets/css/mobile/layout.css">
    <link rel="stylesheet" href="../assets/css/mobile/sidebar.css">
    <link rel="stylesheet" href="../assets/css/mobile/header.css">

    <!-- CSS dashboard Admin -->
    <link rel="stylesheet" href="../assets/css/web/admin/dashboard.css">
    <link rel="stylesheet" href="../assets/css/mobile/admin/dashboard.css">

    <!-- CSS popup -->
    <link rel="stylesheet" href="../assets/css/shared/popup.css">
    <link rel="stylesheet" href="../assets/css/shared/notificationPopup.css">

</head>

<body>

    <input
        type="checkbox"
        id="sidebar-toggle"
        class="sidebar-checkbox"
        aria-label="Buka atau tutup navigasi"
    >

    <div class="dashboard-layout">

        <!-- Sidebar Admin -->
        <aside class="sidebar" aria-label="Navigasi Admin">

            <div class="sidebar-brand">

                <div class="brand-left">

                    <img
                        src="../assets/images/Logo.svg"
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

                    <img src="../assets/icons/actions/cancel.svg" alt="">

                </label>

            </div>

            <!-- Menu navigasi Admin -->
            <nav class="sidebar-nav">

                <!-- Dashboard -->
                <a
                    href="dashboard.php"
                    class="nav-item active"
                    aria-current="page"
                >

                    <img
                        src="../assets/icons/sidebar/dashboard.svg"
                        alt=""
                        class="nav-icon"
                    >

                    <span>Dashboard</span>

                </a>

                <!-- Pengguna -->
                <a href="pengguna.php" class="nav-item">

                    <img
                        src="../assets/icons/sidebar/pengguna.svg"
                        alt=""
                        class="nav-icon"
                    >

                    <span>Pengguna</span>

                </a>

                <!-- Produk dan stok -->
                <a href="produk&amp;stok.php" class="nav-item">

                    <img
                        src="../assets/icons/sidebar/produk&amp;stok.svg"
                        alt=""
                        class="nav-icon"
                    >

                    <span>Produk &amp; Stok</span>

                </a>

                <!-- Transaksi -->
                <a href="transaksi.php" class="nav-item">

                    <img
                        src="../assets/icons/sidebar/transaksi.svg"
                        alt=""
                        class="nav-icon"
                    >

                    <span>Transaksi</span>

                </a>

                <!-- Keluar dari akun -->
                <a href="../logout.php" class="nav-item logout">

                    <img
                        src="../assets/icons/actions/logout.svg"
                        alt=""
                        class="nav-icon"
                    >

                    <span>Keluar</span>

                </a>

            </nav>

        </aside>

        <!-- Konten utama dashboard -->
        <main class="main-content">

            <!-- Header dashboard -->
            <header class="dashboard-header">

                <div class="header-left">

                    <label
                        for="sidebar-toggle"
                        class="hamburger-btn"
                        aria-label="Buka sidebar"
                    >

                        <img
                            src="../assets/icons/actions/hamburger.svg"
                            alt=""
                        >

                    </label>

                    <a
                        href="dashboard.php"
                        class="mobile-brand"
                        aria-label="ARTHA"
                    >

                        <img src="../assets/images/Logo.svg" alt="">

                        <span>ARTHA</span>

                    </a>

                    <h1 class="desktop-page-title">
                        Dashboard Admin
                    </h1>

                </div>

                <div class="header-right">

                    <div class="admin-profile">

                        <div class="profile-circle">

                            <img
                                src="../assets/icons/header/profile.svg"
                                alt=""
                            >

                        </div>

                        <span>Admin</span>

                    </div>

                </div>

            </header>

            <h1 class="mobile-page-title">
                Dashboard Admin
            </h1>

            <div class="page-container admin-dashboard-content">

                <!-- Ringkasan data dashboard -->
                <section
                    class="admin-statistics"
                    aria-label="Ringkasan dashboard"
                >

                    <article class="admin-stat-card">

                        <div class="admin-stat-icon">

                            <img
                                src="../assets/icons/cards/jumlahproduk.svg"
                                alt=""
                            >

                        </div>

                        <div class="admin-stat-info">

                            <p>Total Jumlah Produk</p>

                            <h2 id="adminTotalProduk" aria-live="polite">
                                60
                            </h2>

                        </div>

                    </article>

                    <article class="admin-stat-card">

                        <div class="admin-stat-icon admin-users-icon">

                            <img
                                src="../assets/icons/cards/multiuser.svg"
                                alt=""
                            >

                        </div>

                        <div class="admin-stat-info">

                            <p>Total Jumlah<br>Pengguna</p>

                            <h2 id="adminTotalPengguna" aria-live="polite">
                                8
                            </h2>

                        </div>

                    </article>

                    <article class="admin-stat-card">

                        <div class="admin-stat-icon">

                            <img
                                src="../assets/icons/cards/stoktipis.svg"
                                alt=""
                            >

                        </div>

                        <div class="admin-stat-info">

                            <p>Total Stok Menipis</p>

                            <h2 id="adminStokMenipis" aria-live="polite">
                                6
                            </h2>

                        </div>

                    </article>

                </section>

                <!-- Grafik penjualan bulanan -->
                <section
                    class="admin-chart-card"
                    aria-labelledby="admin-chart-title"
                >

                    <div class="admin-chart-header">

                        <h2 id="admin-chart-title">
                            Tren Penjualan Bulanan
                        </h2>

                        <!-- Pilihan tahun grafik -->
                        <select
                            id="adminYearSelect"
                            class="admin-year-select"
                            aria-label="Pilih tahun"
                        >

                            <option value="2024">2024</option>

                            <option value="2025" selected>2025</option>

                            <option value="2026">2026</option>

                        </select>

                    </div>

                    <!-- Area grafik penjualan -->
                    <div
                        id="adminSalesChart"
                        class="admin-chart-content"
                        role="img"
                        aria-label="Grafik penjualan bulanan Januari sampai Desember"
                    >

                        <!-- Sumbu vertikal grafik -->
                        <div
                            id="adminChartYAxis"
                            class="admin-chart-y-axis"
                            aria-hidden="true"
                        >

                            <span>Rp12 jt</span>
                            <span>Rp9 jt</span>
                            <span>Rp6 jt</span>
                            <span>Rp3 jt</span>
                            <span>0</span>

                        </div>

                        <!-- Batang grafik penjualan -->
                        <div
                            id="adminChartBars"
                            class="admin-chart-bars"
                            aria-hidden="true"
                        >

                            <div class="admin-bar-group">
                                <div class="admin-bar-area">
                                    <div class="admin-bar blue" style="--bar-height:28.33%"></div>
                                </div>
                                <span>Jan</span>
                            </div>

                            <div class="admin-bar-group">
                                <div class="admin-bar-area">
                                    <div class="admin-bar blue" style="--bar-height:45.83%"></div>
                                </div>
                                <span>Feb</span>
                            </div>

                            <div class="admin-bar-group">
                                <div class="admin-bar-area">
                                    <div class="admin-bar yellow" style="--bar-height:33.33%"></div>
                                </div>
                                <span>Mar</span>
                            </div>

                            <div class="admin-bar-group">
                                <div class="admin-bar-area">
                                    <div class="admin-bar blue" style="--bar-height:53.33%"></div>
                                </div>
                                <span>Apr</span>
                            </div>

                            <div class="admin-bar-group">
                                <div class="admin-bar-area">
                                    <div class="admin-bar blue" style="--bar-height:47.5%"></div>
                                </div>
                                <span>Mei</span>
                            </div>

                            <div class="admin-bar-group">
                                <div class="admin-bar-area">
                                    <div class="admin-bar yellow" style="--bar-height:66.67%"></div>
                                </div>
                                <span>Jun</span>
                            </div>

                            <div class="admin-bar-group">
                                <div class="admin-bar-area">
                                    <div class="admin-bar blue" style="--bar-height:45%"></div>
                                </div>
                                <span>Jul</span>
                            </div>

                            <div class="admin-bar-group">
                                <div class="admin-bar-area">
                                    <div class="admin-bar blue" style="--bar-height:64.17%"></div>
                                </div>
                                <span>Agu</span>
                            </div>

                            <div class="admin-bar-group">
                                <div class="admin-bar-area">
                                    <div class="admin-bar yellow" style="--bar-height:52.5%"></div>
                                </div>
                                <span>Sep</span>
                            </div>

                            <div class="admin-bar-group">
                                <div class="admin-bar-area">
                                    <div class="admin-bar blue" style="--bar-height:78.33%"></div>
                                </div>
                                <span>Okt</span>
                            </div>

                            <div class="admin-bar-group">
                                <div class="admin-bar-area">
                                    <div class="admin-bar blue" style="--bar-height:68.33%"></div>
                                </div>
                                <span>Nov</span>
                            </div>

                            <div class="admin-bar-group">
                                <div class="admin-bar-area">
                                    <div class="admin-bar yellow" style="--bar-height:81.67%"></div>
                                </div>
                                <span>Des</span>
                            </div>

                        </div>

                    </div>

                </section>

            </div>

        </main>

        <label
            for="sidebar-toggle"
            class="sidebar-overlay"
            aria-label="Tutup sidebar"
        ></label>

    </div>

    <!-- Popup informasi data tahun 2026 -->
    <div
        id="adminYearModal"
        class="admin-year-popup-overlay"
        role="presentation"
        hidden
    >

        <section
            class="admin-year-popup"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="admin-year-popup-title"
            aria-describedby="admin-year-popup-desc"
        >

            <div class="admin-year-popup-icon" aria-hidden="true">

                <img
                    src="../assets/icons/popup/calendar-warning.svg"
                    alt=""
                >

            </div>

            <h2 id="admin-year-popup-title">
                Data Tahun 2026 Belum Tersedia
            </h2>

            <p id="admin-year-popup-desc">
                Data penjualan tahun 2026 belum tersedia.
                Silakan pilih tahun 2024 atau 2025
                untuk melihat grafik penjualan.
            </p>

            <button
                type="button"
                id="adminYearModalClose"
                class="admin-year-popup-close"
            >
                Mengerti
            </button>

        </section>

    </div>

    <!-- JavaScript API -->
    <script src="../assets/js/api.js" defer></script>

    <!-- JavaScript popup -->
    <script src="../assets/js/shared/popup.js" defer></script>

    <!-- JavaScript dashboard Admin -->
    <script src="../assets/js/admin/dashboard.js" defer></script>

    <!-- JavaScript navigasi -->
    <script src="../assets/js/navigation.js" defer></script>

    <script src="../assets/js/config.js" defer></script>

</body>

</html>