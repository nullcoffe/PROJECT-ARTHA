
<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#FFFDF0">

    <title>Rekomendasi Paket Promosi | ARTHA</title>

    <!-- Shared CSS -->
    <link rel="stylesheet" href="../assets/css/shared/variables.css">
    <link rel="stylesheet" href="../assets/css/shared/reset.css">

    <!-- Web CSS -->
    <link rel="stylesheet" href="../assets/css/web/layout.css">
    <link rel="stylesheet" href="../assets/css/web/sidebar.css">
    <link rel="stylesheet" href="../assets/css/web/header.css">
    <link rel="stylesheet" href="../assets/css/web/pemilik/paketPromosi.css">

    <!-- Mobile CSS -->
    <link rel="stylesheet" href="../assets/css/mobile/layout.css">
    <link rel="stylesheet" href="../assets/css/mobile/sidebar.css">
    <link rel="stylesheet" href="../assets/css/mobile/header.css">
    <link rel="stylesheet" href="../assets/css/mobile/pemilik/paketPromosi.css">
    <link rel="stylesheet" href="../assets/css/shared/notificationPopup.css">

</head>

<body>

    <!-- Kontrol sidebar -->
    <input type="checkbox"
           id="sidebar-toggle"
           class="sidebar-checkbox"
           aria-label="Buka sidebar">

    <div class="dashboard-layout">

        <!-- Sidebar pemilik -->
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

                    <img src="../assets/icons/actions/cancel.svg"
                         alt="">

                </label>

            </div>

            <!-- Navigasi pemilik -->
            <nav class="sidebar-nav">

                <!-- Dashboard -->
                <a href="dashboard.php" class="nav-item">
                    <img src="../assets/icons/sidebar/dashboard.svg"
                         alt=""
                         class="nav-icon">

                    <span>Dashboard</span>
                </a>

                <!-- Laporan -->
                <a href="laporan.php" class="nav-item">
                    <img src="../assets/icons/sidebar/laporan.svg"
                         alt=""
                         class="nav-icon">

                    <span>Laporan</span>
                </a>

                <!-- Analisis Apriori -->
                <a href="analisisApriori.php" class="nav-item">
                    <img src="../assets/icons/sidebar/analisisApriori.svg"
                         alt=""
                         class="nav-icon">

                    <span>Analisis Apriori</span>
                </a>

                <!-- Paket Promosi -->
                <a href="paketPromosi.php"
                   class="nav-item active"
                   aria-current="page">

                    <img src="../assets/icons/sidebar/paketPromosi.svg"
                         alt=""
                         class="nav-icon">

                    <span>Paket Promosi</span>

                </a>

                <!-- Prioritas Stok -->
                <a href="prioritasStok.php" class="nav-item">
                    <img src="../assets/icons/sidebar/prioritasStok.svg"
                         alt=""
                         class="nav-icon">

                    <span>Prioritas Stok</span>
                </a>

                <!-- Keluar -->
                <a href="../index.php" class="nav-item logout">
                    <img src="../assets/icons/actions/logout.svg"
                         alt=""
                         class="nav-icon">

                    <span>Keluar</span>
                </a>

            </nav>

        </aside>

        <!-- Tombol sidebar mobile -->
        <label for="sidebar-toggle"
               class="hamburger-btn"
               aria-label="Buka sidebar">

            <img src="../assets/icons/actions/hamburger.svg"
                 alt="">

        </label>

        <!-- Overlay sidebar -->
        <label for="sidebar-toggle"
               class="sidebar-overlay"
               aria-label="Tutup sidebar">
        </label>

        <!-- Konten utama -->
        <main class="main-content">

            <!-- Header -->
            <header class="dashboard-header">

                <h1>Rekomendasi Paket Promosi</h1>

                <div class="header-right">

                    <div class="user-profile">

                        <div class="profile-circle">
                            <img src="../assets/icons/header/profile.svg"
                                 alt="">
                        </div>

                        <span>Pemilik</span>

                    </div>

                </div>

            </header>

            <!-- Konten halaman -->
            <div class="page-container">

                <div class="owner-promo-content">

                    <!-- Kandidat paket promosi -->
                    <section class="promo-list-card promo-package-section">

                        <!-- Judul bagian -->
                        <div class="promo-section-heading promo-package-header">

                            <h2>Kandidat Paket</h2>

                            <p>
                                Kombinasi Produk berdasarkan aturan asosiasi
                            </p>

                        </div>

                        <!-- Informasi kandidat -->
                        <p id="promo-package-description"
                           class="promo-package-description"
                           hidden>

                            Jalankan analisis Apriori untuk menghasilkan
                            kandidat paket promosi.

                        </p>

                        <!-- Daftar paket dinamis -->
                        <div id="promo-package-list"
                             class="promo-list promo-package-list">

                            <div class="promo-package-empty">

                                Belum ada kandidat paket promosi.

                                Silakan jalankan analisis Apriori terlebih dahulu.

                            </div>

                        </div>

                    </section>

                </div>

            </div>

        </main>

    </div>

    <!-- JavaScript -->
    <script src="../assets/js/shared/popup.js" defer></script>
    <script src="../assets/js/pemilik/paket-promosi.js" defer></script>
    <script src="../assets/js/navigation.js" defer></script>

</body>
</html>