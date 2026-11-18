
<?php
// Halaman cek ketersediaan produk oleh Kasir
?>

<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#FFFDF0">

    <title>Cek Ketersediaan Produk | ARTHA</title>

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

    <!-- CSS halaman cek stok -->
    <link rel="stylesheet" href="../assets/css/web/kasir/cekStok.css">
    <link rel="stylesheet" href="../assets/css/mobile/kasir/cekStok.css">

    <!-- CSS notifikasi -->
    <link rel="stylesheet" href="../assets/css/shared/notificationPopup.css">

</head>

<body class="cashier-page">

    <input class="sidebar-checkbox" type="checkbox" id="sidebar-toggle">

    <div class="dashboard-layout">

        <!-- Sidebar Kasir -->
        <aside class="sidebar">

            <div class="sidebar-brand">

                <a href="dashboard.php" class="brand-left">

                    <img src="../assets/images/Logo.svg" class="brand-logo" alt="Logo ARTHA">

                    <span class="brand-title">ARTHA</span>

                </a>

                <label class="sidebar-close" for="sidebar-toggle" aria-label="Tutup menu">

                    <img src="../assets/icons/actions/cancel.svg" alt="" aria-hidden="true" class="sidebar-close-icon">

                </label>

            </div>

            <!-- Menu navigasi Kasir -->
            <nav class="sidebar-nav" aria-label="Navigasi kasir">

                <a class="nav-item" href="dashboard.php">

                    <img class="nav-icon" src="../assets/icons/sidebar/dashboard.svg" alt="">

                    <span>Dashboard</span>

                </a>

                <a class="nav-item" href="transaksiPOS.php">

                    <img class="nav-icon" src="../assets/icons/sidebar/transaksiPos.svg" alt="">

                    <span>Transaksi POS</span>

                </a>

                <a class="nav-item" href="pembayaran.php">

                    <img class="nav-icon" src="../assets/icons/sidebar/pembayaran.svg" alt="">

                    <span>Pembayaran</span>

                </a>

                <a class="nav-item" href="cetakStruk.php">

                    <img class="nav-icon" src="../assets/icons/sidebar/cetakStruk.svg" alt="">

                    <span>Cetak Struk</span>

                </a>

                <a class="nav-item active" href="cekStok.php">

                    <img class="nav-icon" src="../assets/icons/sidebar/cekStok.svg" alt="">

                    <span>Cek Stok</span>

                </a>

                <!-- Keluar dari halaman Kasir -->
                <a class="nav-item logout" href="../logout.php">

                    <img class="nav-icon" src="../assets/icons/actions/logout.svg" alt="">

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

                        <img src="../assets/icons/actions/hamburger.svg" alt="">

                    </label>

                    <h1>Cek Ketersediaan Produk</h1>

                    <a class="mobile-brand" href="dashboard.php">

                        <img src="../assets/images/Logo.svg" alt="">

                        <span>ARTHA</span>

                    </a>

                </div>

                <div class="header-right">

                    <div class="user-profile">

                        <div class="profile-circle">

                            <img src="../assets/icons/header/profile.svg" alt="">

                        </div>

                        <span>Kasir</span>

                    </div>

                </div>

            </header>

            <h1 class="mobile-page-title">Cek Ketersediaan Produk</h1>

            <!-- Pencarian dan filter stok -->
            <div class="stock-toolbar">

                <form class="stock-search" action="cekStok.php" method="get">

                    <img src="../assets/icons/actions/search.svg" alt="">

                    <input
                        type="search"
                        id="stockSearch"
                        name="q"
                        placeholder="Cari nama produk, Kode Produk, Harga atau Stok"
                        aria-label="Cari nama produk, kode produk, harga atau stok"
                    >

                </form>

                <select class="stock-filter" id="stockStatusFilter" aria-label="Filter status">

                    <option value="all">Semua Status</option>

                    <option value="safe">Aman</option>

                    <option value="low">Stok rendah</option>

                    <option value="empty">Habis</option>

                </select>

            </div>

            <!-- Tabel ketersediaan produk -->
            <div class="table-wrap stock-table">

                <table>

                    <thead>

                        <tr>
                            <th>ID<br>produk</th>
                            <th>Nama Produk</th>
                            <th>Harga</th>
                            <th>Stok</th>
                            <th>Status</th>
                        </tr>

                    </thead>

                    <tbody id="stockTableBody">
                    </tbody>

                </table>

            </div>

        </main>

    </div>

    <!-- JavaScript konfigurasi -->
    <script src="../assets/js/config.js" defer></script>

    <!-- JavaScript popup dan navigasi -->
    <script src="../assets/js/shared/popup.js" defer></script>
    <script src="../assets/js/navigation.js" defer></script>

    <!-- JavaScript cek stok -->
    <script src="../assets/js/kasir/cek-stok.js" defer></script>

</body>
</html>