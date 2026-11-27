<?php require_once __DIR__ . '/../assets/cache-busting.php'; 

// Memuat sistem session dan pemeriksaan role
require_once '../../backend/api/middleware/auth.php';

// Hanya pengguna dengan role Pemilik yang boleh mengakses halaman ini
artha_require_page_role(['pemilik']);

?>

<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#FFFDF0">

    <title>Laporan Penjualan | ARTHA</title>

    <!-- CSS bersama -->
    <link rel="stylesheet" href="<?= artha_asset('../assets/css/shared/variables.css') ?>">
    <link rel="stylesheet" href="<?= artha_asset('../assets/css/shared/reset.css') ?>">
    <link rel="stylesheet" href="<?= artha_asset('../assets/css/shared/notificationPopup.css') ?>">

    <!-- CSS web -->
    <link rel="stylesheet" href="<?= artha_asset('../assets/css/web/layout.css') ?>">
    <link rel="stylesheet" href="<?= artha_asset('../assets/css/web/sidebar.css') ?>">
    <link rel="stylesheet" href="<?= artha_asset('../assets/css/web/header.css') ?>">

    <!-- CSS mobile -->
    <link rel="stylesheet" href="<?= artha_asset('../assets/css/mobile/layout.css') ?>">
    <link rel="stylesheet" href="<?= artha_asset('../assets/css/mobile/sidebar.css') ?>">
    <link rel="stylesheet" href="<?= artha_asset('../assets/css/mobile/header.css') ?>">

    <!-- CSS khusus laporan -->
    <link rel="stylesheet" href="<?= artha_asset('../assets/css/web/pemilik/laporan.css') ?>">
    <link rel="stylesheet" href="<?= artha_asset('../assets/css/mobile/pemilik/laporan.css') ?>">
</head>

<body>

    <!-- Kontrol sidebar -->
    <input type="checkbox"
           id="sidebar-toggle"
           class="sidebar-checkbox"
           aria-label="Buka atau tutup sidebar">

    <div class="dashboard-layout">

        <!-- Sidebar Pemilik -->
        <aside class="sidebar">

            <div class="sidebar-brand">
                <div class="brand-left">
                    <img src="<?= artha_asset('../assets/images/Logo.svg') ?>"
                         alt="Logo ARTHA"
                         class="brand-logo">

                    <span class="brand-title">ARTHA</span>
                </div>

                <label for="sidebar-toggle"
                       class="close-sidebar-btn"
                       aria-label="Tutup sidebar">
                    <img src="<?= artha_asset('../assets/icons/actions/cancel.svg') ?>" alt="">
                </label>
            </div>

            <!-- Navigasi Pemilik -->
            <nav class="sidebar-nav">

                <a href="dashboard.php" class="nav-item">
                    <img src="<?= artha_asset('../assets/icons/sidebar/dashboard.svg') ?>"
                         class="nav-icon" alt="">
                    <span>Dashboard</span>
                </a>

                <a href="laporan.php"
                   class="nav-item active"
                   aria-current="page">
                    <img src="<?= artha_asset('../assets/icons/sidebar/laporan.svg') ?>"
                         class="nav-icon" alt="">
                    <span>Laporan</span>
                </a>

                <a href="analisisApriori.php" class="nav-item">
                    <img src="<?= artha_asset('../assets/icons/sidebar/analisisApriori.svg') ?>"
                         class="nav-icon" alt="">
                    <span>Analisis Apriori</span>
                </a>

                <a href="paketPromosi.php" class="nav-item">
                    <img src="<?= artha_asset('../assets/icons/sidebar/paketPromosi.svg') ?>"
                         class="nav-icon" alt="">
                    <span>Paket Promosi</span>
                </a>

                <a href="prioritasStok.php" class="nav-item">
                    <img src="<?= artha_asset('../assets/icons/sidebar/prioritasStok.svg') ?>"
                         class="nav-icon" alt="">
                    <span>Prioritas Stok</span>
                </a>

                <a href="../logout.php" class="nav-item logout">
                    <img src="<?= artha_asset('../assets/icons/actions/logout.svg') ?>"
                         class="nav-icon" alt="">
                    <span>Keluar</span>
                </a>

            </nav>
        </aside>

        <!-- Konten utama -->
        <main class="main-content">

            <!-- Header -->
            <header class="dashboard-header">

                <div class="header-left">

                    <label for="sidebar-toggle"
                           class="hamburger-btn"
                           aria-label="Buka sidebar">
                        <img src="<?= artha_asset('../assets/icons/actions/hamburger.svg') ?>"
                             alt="">
                    </label>

                    <a href="dashboard.php"
                       class="mobile-brand"
                       aria-label="ARTHA">
                        <img src="<?= artha_asset('../assets/images/Logo.svg') ?>" alt="">
                        <span>ARTHA</span>
                    </a>

                    <h1 class="desktop-page-title">
                        Laporan Penjualan
                    </h1>

                </div>

                <div class="header-right">
                    <div class="user-profile">
                        <div class="profile-circle">
                            <img src="<?= artha_asset('../assets/icons/header/profile.svg') ?>"
                                 alt="">
                        </div>
                        <span>Pemilik</span>
                    </div>
                </div>

            </header>

            <!-- Judul mobile -->
            <h1 class="mobile-page-title">
                Laporan Penjualan
            </h1>

            <!-- Konten laporan -->
            <div class="report-content">

                <!-- Statistik -->
                <section class="report-statistics">

                    <article class="report-stat-card">
                        <p>Total Transaksi</p>
                        <h2>350</h2>
                    </article>

                    <article class="report-stat-card">
                        <p>Produk Unik</p>
                        <h2>60</h2>
                    </article>

                    <article class="report-stat-card">
                        <p>Periode</p>
                        <h2>2024–2026</h2>
                    </article>

                </section>

                <!-- Grafik penjualan -->
                <section class="report-chart-card">

                    <div class="report-chart-header">

                        <h2>Tren Penjualan Bulanan</h2>

                        <select class="report-year-select"
                                aria-label="Pilih tahun">

                            <option value="2024">2024</option>
                            <option value="2025" selected>2025</option>
                            <option value="2026">2026</option>

                        </select>

                    </div>

                    <div class="report-chart-content">

                        <!-- Sumbu Y -->
                        <div class="report-y-axis">
                            <span>Rp12 jt</span>
                            <span>Rp9 jt</span>
                            <span>Rp6 jt</span>
                            <span>Rp3 jt</span>
                            <span>0</span>
                        </div>

                        <!-- Batang grafik -->
                        <div class="report-chart-bars">

                            <div class="report-bar-group">
                                <div class="report-bar-area">
                                    <div class="report-bar blue"
                                         style="--bar-height:35%"></div>
                                </div>
                                <span>Jan</span>
                            </div>

                            <div class="report-bar-group">
                                <div class="report-bar-area">
                                    <div class="report-bar blue"
                                         style="--bar-height:55%"></div>
                                </div>
                                <span>Feb</span>
                            </div>

                            <div class="report-bar-group">
                                <div class="report-bar-area">
                                    <div class="report-bar yellow"
                                         style="--bar-height:43%"></div>
                                </div>
                                <span>Mar</span>
                            </div>

                            <div class="report-bar-group">
                                <div class="report-bar-area">
                                    <div class="report-bar blue"
                                         style="--bar-height:63%"></div>
                                </div>
                                <span>Apr</span>
                            </div>

                            <div class="report-bar-group">
                                <div class="report-bar-area">
                                    <div class="report-bar blue"
                                         style="--bar-height:56%"></div>
                                </div>
                                <span>Mei</span>
                            </div>

                            <div class="report-bar-group">
                                <div class="report-bar-area">
                                    <div class="report-bar yellow"
                                         style="--bar-height:76%"></div>
                                </div>
                                <span>Jun</span>
                            </div>

                            <div class="report-bar-group">
                                <div class="report-bar-area">
                                    <div class="report-bar blue"
                                         style="--bar-height:54%"></div>
                                </div>
                                <span>Jul</span>
                            </div>

                            <div class="report-bar-group">
                                <div class="report-bar-area">
                                    <div class="report-bar blue"
                                         style="--bar-height:74%"></div>
                                </div>
                                <span>Agu</span>
                            </div>

                            <div class="report-bar-group">
                                <div class="report-bar-area">
                                    <div class="report-bar yellow"
                                         style="--bar-height:62%"></div>
                                </div>
                                <span>Sep</span>
                            </div>

                            <div class="report-bar-group">
                                <div class="report-bar-area">
                                    <div class="report-bar blue"
                                         style="--bar-height:88%"></div>
                                </div>
                                <span>Okt</span>
                            </div>

                            <div class="report-bar-group">
                                <div class="report-bar-area">
                                    <div class="report-bar blue"
                                         style="--bar-height:80%"></div>
                                </div>
                                <span>Nov</span>
                            </div>

                            <div class="report-bar-group">
                                <div class="report-bar-area">
                                    <div class="report-bar yellow"
                                         style="--bar-height:94%"></div>
                                </div>
                                <span>Des</span>
                            </div>

                        </div>
                    </div>

                </section>

                <!-- Tabel laporan produk -->
                <section class="report-table-card">

                    <h2>Tabel Laporan Produk</h2>

                    <div class="report-table-wrapper">

                        <table class="report-table">

                            <thead>
                                <tr>
                                    <th scope="col">Produk</th>
                                    <th scope="col">Qty terjual</th>
                                    <th scope="col">Kontribusi</th>
                                </tr>
                            </thead>

                            <tbody>

                                <tr>
                                    <td>Beras 5 kg</td>
                                    <td>84 pcs</td>
                                    <td>18,5%</td>
                                </tr>

                                <tr>
                                    <td>Minyak Goreng 1 L</td>
                                    <td>76 pcs</td>
                                    <td>14,2%</td>
                                </tr>

                                <tr>
                                    <td>Gula Pasir 1 kg</td>
                                    <td>65 pcs</td>
                                    <td>11,8%</td>
                                </tr>

                                <tr>
                                    <td>Telur Ayam 1 kg</td>
                                    <td>58 pcs</td>
                                    <td>9,6%</td>
                                </tr>

                                <tr>
                                    <td>Mie Instan Goreng</td>
                                    <td>53 pcs</td>
                                    <td>7,4%</td>
                                </tr>

                            </tbody>

                        </table>

                    </div>

                </section>

            </div>

        </main>

        <!-- Overlay mobile -->
        <label for="sidebar-toggle"
               class="sidebar-overlay"
               aria-label="Tutup sidebar"></label>

    </div>

    <!-- JavaScript -->
    <script src="<?= artha_asset('../assets/js/api.js') ?>" defer></script>
    <script src="<?= artha_asset('../assets/js/shared/popup.js') ?>" defer></script>
    <script src="<?= artha_asset('../assets/js/pemilik/laporan.js') ?>" defer></script>
    <script src="<?= artha_asset('../assets/js/navigation.js') ?>" defer></script>

</body>
</html>