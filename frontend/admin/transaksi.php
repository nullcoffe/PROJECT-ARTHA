
<?php // Halaman riwayat transaksi Admin ?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#FFFDF0">

    <title>Transaksi | ARTHA</title>

    <!-- SHARED CSS -->
    <link rel="stylesheet" href="../assets/css/shared/variables.css">
    <link rel="stylesheet" href="../assets/css/shared/reset.css">

    <!-- WEB CSS -->
    <link rel="stylesheet" href="../assets/css/web/layout.css">
    <link rel="stylesheet" href="../assets/css/web/sidebar.css">
    <link rel="stylesheet" href="../assets/css/web/header.css">
    <link rel="stylesheet" href="../assets/css/web/admin/transaksi.css">

    <!-- MOBILE CSS -->
    <link rel="stylesheet" href="../assets/css/mobile/layout.css">
    <link rel="stylesheet" href="../assets/css/mobile/sidebar.css">
    <link rel="stylesheet" href="../assets/css/mobile/header.css">
    <link rel="stylesheet" href="../assets/css/mobile/admin/transaksi.css">

    <!-- CSS POPUP ARTHA -->
    <link rel="stylesheet" href="../assets/css/web/popup.css">
    <link rel="stylesheet" href="../assets/css/mobile/popup.css">
    <link rel="stylesheet" href="../assets/css/shared/popup.css">
    <link rel="stylesheet" href="../assets/css/shared/notificationPopup.css">
</head>

<body>

    <!-- Popup pemilihan bulan -->
    <div class="artha-popup-overlay" id="popup-select-month">

        <section class="artha-popup artha-popup--month"
                 role="dialog"
                 aria-modal="true"
                 aria-labelledby="month-popup-title"
                 tabindex="-1">

            <div class="month-popup-header">

                <h2 id="month-popup-title">
                    <img src="../assets/icons/popup/calendar-select.svg" alt="">
                    Pilih Bulan
                </h2>

                <a href="#"
                   class="month-popup-close"
                   aria-label="Tutup popup">
                    &times;
                </a>

            </div>

            <!-- Pilihan bulan transaksi -->
            <div class="month-popup-options"
                 role="group"
                 aria-label="Bulan transaksi">

                <label class="month-popup-option month-popup-all">
                    <input type="radio"
                           name="popup-selected-month"
                           value="all"
                           checked>
                    <span>✓ Semua Bulan</span>
                </label>

                <div class="month-popup-grid">

                    <label class="month-popup-option">
                        <input type="radio" name="popup-selected-month" value="01">
                        <span>Januari</span>
                    </label>

                    <label class="month-popup-option">
                        <input type="radio" name="popup-selected-month" value="02">
                        <span>Februari</span>
                    </label>

                    <label class="month-popup-option">
                        <input type="radio" name="popup-selected-month" value="03">
                        <span>Maret</span>
                    </label>

                    <label class="month-popup-option">
                        <input type="radio" name="popup-selected-month" value="04">
                        <span>April</span>
                    </label>

                    <label class="month-popup-option">
                        <input type="radio" name="popup-selected-month" value="05">
                        <span>Mei</span>
                    </label>

                    <label class="month-popup-option">
                        <input type="radio" name="popup-selected-month" value="06">
                        <span>Juni</span>
                    </label>

                    <label class="month-popup-option">
                        <input type="radio" name="popup-selected-month" value="07">
                        <span>Juli</span>
                    </label>

                    <label class="month-popup-option">
                        <input type="radio" name="popup-selected-month" value="08">
                        <span>Agustus</span>
                    </label>

                    <label class="month-popup-option">
                        <input type="radio" name="popup-selected-month" value="09">
                        <span>September</span>
                    </label>

                    <label class="month-popup-option">
                        <input type="radio" name="popup-selected-month" value="10">
                        <span>Oktober</span>
                    </label>

                    <label class="month-popup-option">
                        <input type="radio" name="popup-selected-month" value="11">
                        <span>November</span>
                    </label>

                    <label class="month-popup-option">
                        <input type="radio" name="popup-selected-month" value="12">
                        <span>Desember</span>
                    </label>

                </div>
            </div>

            <!-- Tombol popup -->
            <div class="month-popup-footer">

                <a href="#"
                   class="artha-popup-btn artha-popup-btn--text">
                    Batal
                </a>

                <a href="#"
                   class="artha-popup-btn artha-popup-btn--dark">
                    Terapkan
                </a>

            </div>

        </section>
    </div>

    <!-- Kontrol sidebar -->
    <input type="checkbox"
           id="sidebar-toggle"
           class="sidebar-checkbox"
           aria-label="Buka atau tutup sidebar">

    <div class="dashboard-layout">

        <!-- Sidebar Admin -->
        <aside class="sidebar">

            <div class="sidebar-brand">

                <div class="brand-left">

                    <img src="../assets/images/Logo.svg"
                         alt="Logo ARTHA"
                         class="brand-logo">

                    <span class="brand-title">ARTHA</span>

                </div>

                <label for="sidebar-toggle"
                       class="close-sidebar-btn"
                       aria-label="Tutup sidebar">

                    <img src="../assets/icons/actions/cancel.svg" alt="">

                </label>

            </div>

            <!-- Menu navigasi Admin -->
            <nav class="sidebar-nav">

                <a href="dashboard.php" class="nav-item">
                    <img src="../assets/icons/sidebar/dashboard.svg"
                         alt="" class="nav-icon">
                    <span>Dashboard</span>
                </a>

                <a href="pengguna.php" class="nav-item">
                    <img src="../assets/icons/sidebar/pengguna.svg"
                         alt="" class="nav-icon">
                    <span>Pengguna</span>
                </a>

                <a href="produk&amp;stok.php" class="nav-item">
                    <img src="../assets/icons/sidebar/produk&amp;stok.svg"
                         alt="" class="nav-icon">
                    <span>Produk &amp; Stok</span>
                </a>

                <a href="transaksi.php"
                   class="nav-item active"
                   aria-current="page">

                    <img src="../assets/icons/sidebar/transaksi.svg"
                         alt="" class="nav-icon">
                    <span>Transaksi</span>

                </a>

                <a href="../index.php" class="nav-item logout">

                    <img src="../assets/icons/actions/logout.svg"
                         alt="" class="nav-icon">
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

                        <img src="../assets/icons/actions/hamburger.svg"
                             alt="">

                    </label>

                    <h1 class="desktop-page-title">
                        Transaksi
                    </h1>

                </div>

                <div class="header-right">

                    <div class="admin-profile">

                        <div class="profile-circle">
                            <img src="../assets/icons/header/profile.svg"
                                 alt="">
                        </div>

                        <span>Admin</span>

                    </div>

                </div>

            </header>

            <h1 class="mobile-page-title">
                Transaksi
            </h1>

            <!-- Konten transaksi -->
            <div class="page-container transaction-content">

                <!-- Statistik transaksi -->
                <section class="transaction-summary">

                    <article class="transaction-summary-card">

                        <div class="transaction-summary-icon">
                            <img src="../assets/icons/cards/totaljumlahtransaksi.svg"
                                alt="">
                        </div>

                        <div class="transaction-summary-info">
                            <p>Total Transaksi</p>
                            <h2>0</h2>
                        </div>

                    </article>

                    <article class="transaction-summary-card">

                        <div class="transaction-summary-icon">
                            <img src="../assets/icons/cards/jumlahproduk.svg"
                                alt="">
                        </div>

                        <div class="transaction-summary-info">
                            <p>Total Produk Unik</p>
                            <h2>0</h2>
                        </div>

                    </article>

                </section>

                <!-- Filter transaksi -->
                <section class="transaction-filters"
                         aria-label="Filter transaksi">

                    <div class="transaction-filter-field">

                        <label for="filterYear">Tahun</label>

                        <div class="transaction-select-wrap">

                            <select id="filterYear" name="tahun">

                                <option value="all" selected>
                                    Semua Tahun
                                </option>

                                <option value="2024">2024</option>
                                <option value="2025">2025</option>
                                <option value="2026">2026</option>

                            </select>

                        </div>

                    </div>

                    <div class="transaction-filter-field">

                        <label for="monthTrigger">Bulan</label>

                        <a href="#popup-select-month"
                           id="monthTrigger"
                           class="transaction-month-trigger"
                           aria-label="Pilih bulan transaksi">

                            <span>Semua Bulan</span>

                        </a>

                    </div>

                    <!-- Informasi periode -->
                    <article class="all-period-card">

                        <div class="all-period-icon">

                            <img src="../assets/icons/sidebar/transaksi.svg"
                                 alt="">

                        </div>

                        <div class="all-period-info">

                            <strong id="periodTitle">
                                Semua Periode
                            </strong>

                            <span id="periodDescription">
                                Menampilkan Tahun
                            </span>

                            <span id="periodYear">
                                2024–2026
                            </span>

                        </div>

                    </article>

                </section>

                <!-- Daftar transaksi -->
                <section class="transaction-list-section">

                    <div class="transaction-list-heading">
                        <h2>Daftar Transaksi</h2>
                    </div>

                    <div class="transaction-table-card">

                        <div class="transaction-table-wrapper">

                            <table class="transaction-table">

                                <thead>
                                    <tr>
                                        <th>ID Transaksi</th>
                                        <th>Tanggal</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>

                                <tbody id="transactionTableBody">

                                    <!-- Data transaksi sementara -->

                                    <tr data-year="2025"
                                        data-month="02"
                                        data-products="Beras|Gula Pasir|Minyak Goreng">

                                        <td>TRX-0350</td>
                                        <td>26/02/25</td>
                                        <td>Rp.120.000</td>

                                    </tr>

                                    <tr data-year="2025"
                                        data-month="02"
                                        data-products="Beras|Telur">

                                        <td>TRX-0359</td>
                                        <td>17/02/25</td>
                                        <td>Rp.130.000</td>

                                    </tr>

                                    <tr data-year="2025"
                                        data-month="08"
                                        data-products="Mi Instan|Minyak Goreng">

                                        <td>TRX-0220</td>
                                        <td>08/08/25</td>
                                        <td>Rp.100.000</td>

                                    </tr>

                                    <tr data-year="2025"
                                        data-month="11"
                                        data-products="Beras|Telur|Gula Pasir">

                                        <td>TRX-0110</td>
                                        <td>10/11/25</td>
                                        <td>Rp.50.000</td>

                                    </tr>

                                </tbody>

                            </table>

                        </div>

                        <!-- Pagination -->
                        <div class="transaction-pagination">

                            <button class="transaction-page-nav" disabled>
                                Sebelumnya
                            </button>

                            <div class="transaction-page-numbers">

                                <button class="transaction-page-number active"
                                        aria-current="page">
                                    1
                                </button>

                                <button class="transaction-page-number" disabled>
                                    2
                                </button>

                                <button class="transaction-page-number" disabled>
                                    3
                                </button>

                            </div>

                            <button class="transaction-page-nav" disabled>
                                Selanjutnya
                            </button>

                        </div>

                    </div>

                </section>

            </div>

        </main>

        <!-- Overlay sidebar mobile -->
        <label for="sidebar-toggle"
               class="sidebar-overlay"
               aria-label="Tutup sidebar"></label>

    </div>

    <!-- JavaScript popup -->
    <script src="../assets/js/shared/popup.js" defer></script>

    <!-- JavaScript transaksi Admin -->
    <script src="../assets/js/admin/transaksi.js" defer></script>

    <!-- JavaScript navigasi -->
    <script src="../assets/js/navigation.js" defer></script>

</body>
</html>