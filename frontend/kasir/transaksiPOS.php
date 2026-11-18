<?php
// Halaman transaksi penjualan oleh Kasir
?>

<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#FFFDF0">

    <title>Kasir / Input Penjualan | ARTHA</title>

    <!-- CSS utama -->
    <link rel="stylesheet" href="../assets/css/shared/variables.css">
    <link rel="stylesheet" href="../assets/css/shared/reset.css">
    <link rel="stylesheet" href="../assets/css/shared/notificationPopup.css">

    <!-- CSS desktop -->
    <link rel="stylesheet" href="../assets/css/web/layout.css">
    <link rel="stylesheet" href="../assets/css/web/sidebar.css">
    <link rel="stylesheet" href="../assets/css/web/header.css">

    <!-- CSS mobile -->
    <link rel="stylesheet" href="../assets/css/mobile/layout.css">
    <link rel="stylesheet" href="../assets/css/mobile/sidebar.css">
    <link rel="stylesheet" href="../assets/css/mobile/header.css">

    <!-- CSS transaksi POS -->
    <link rel="stylesheet" href="../assets/css/web/kasir/transaksiPOS.css">
    <link rel="stylesheet" href="../assets/css/mobile/kasir/transaksiPOS.css">

</head>

<body class="cashier-page pos-page">

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
                    &times;
                </label>

            </div>

            <!-- Menu navigasi Kasir -->
            <nav class="sidebar-nav" aria-label="Navigasi kasir">

                <a class="nav-item" href="dashboard.php">
                    <img class="nav-icon" src="../assets/icons/sidebar/dashboard.svg" alt="">
                    <span>Dashboard</span>
                </a>

                <a class="nav-item active" href="transaksiPOS.php">
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

                <a class="nav-item" href="cekStok.php">
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

        <!-- Konten utama transaksi -->
        <main class="main-content">

            <header class="dashboard-header">

                <div class="header-left">

                    <label class="hamburger-btn" for="sidebar-toggle" aria-label="Buka menu">
                        <img src="../assets/icons/actions/hamburger.svg" alt="">
                    </label>

                    <h1>Kasir / Input Penjualan</h1>

                    <a href="dashboard.php" class="mobile-brand">
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

            <h1 class="mobile-page-title">
                Kasir / Input Penjualan
            </h1>

            <!-- Pencarian produk -->
            <div class="product-search">

                <img src="../assets/icons/actions/search.svg" alt="">

                <input
                    type="search"
                    id="productSearch"
                    placeholder="Cari produk / nama barang"
                    aria-label="Cari produk atau nama barang"
                >

            </div>

            <!-- Tampilan POS -->
            <div class="pos-layout">

                <!-- Daftar produk -->
                <section class="product-list">

                    <h2 class="product-list-title">
                        Daftar Produk
                    </h2>

                    <div class="table-wrap">

                        <table class="product-table">

                            <thead>
                                <tr>
                                    <th>ID Produk</th>
                                    <th>Nama Produk</th>
                                    <th>Harga</th>
                                    <th>Stok</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>

                            <tbody id="productTableBody">
                            </tbody>

                        </table>

                    </div>

                </section>

                <!-- Keranjang belanja -->
                <aside class="cart-panel" id="keranjang">

                    <div class="cart-heading">

                        <h2>Keranjang Belanja</h2>

                        <button class="clear-cart" type="button" id="clearCart">

                            <img src="../assets/icons/actions/delete.svg" alt="">

                            <span>Hapus semua</span>

                        </button>

                    </div>

                    <div class="cart-labels">
                        <span>PRODUK</span>
                        <span>QTY</span>
                        <span>JUMLAH</span>
                        <span></span>
                    </div>

                    <div class="cart-items" id="cartItems"></div>

                    <p class="empty-cart" id="emptyCart">
                        Keranjang belanja masih kosong.
                    </p>

                    <div class="cart-total">

                        <strong>Total</strong>

                        <b id="cartTotal">Rp 0</b>

                    </div>

                    <!-- Menu menuju pembayaran -->
                    <a href="pembayaran.php" class="checkout-button" id="checkoutButton">

                        <span>Lanjut Pembayaran</span>

                        <img
                            src="../assets/icons/actions/chevron-right.svg"
                            alt=""
                            aria-hidden="true"
                            class="checkout-icon"
                        >

                    </a>

                </aside>

            </div>

        </main>

    </div>


    <!-- JavaScript konfigurasi -->
    <script src="../assets/js/config.js" defer></script>

    <!-- JavaScript API -->
    <script src="../assets/js/api.js" defer></script>

    <!-- JavaScript popup -->
    <script src="../assets/js/shared/popup.js" defer></script>

    <!-- JavaScript navigasi -->
    <script src="../assets/js/navigation.js" defer></script>

    <!-- JavaScript transaksi POS -->
    <script src="../assets/js/kasir/transaksiPOS.js" defer></script>

</body>
</html>