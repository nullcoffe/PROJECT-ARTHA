<?php require_once __DIR__ . '/../assets/cache-busting.php'; ?>

<?php
// Halaman manajemen produk dan stok Admin
?>

<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="theme-color" content="#FFFDF0">
<title>Produk &amp; Stok | ARTHA</title>

<link rel="stylesheet" href="<?= artha_asset('../assets/css/shared/variables.css') ?>">
<link rel="stylesheet" href="<?= artha_asset('../assets/css/shared/reset.css') ?>">
<link rel="stylesheet" href="<?= artha_asset('../assets/css/web/layout.css') ?>">
<link rel="stylesheet" href="<?= artha_asset('../assets/css/web/sidebar.css') ?>">
<link rel="stylesheet" href="<?= artha_asset('../assets/css/web/header.css') ?>">
<link rel="stylesheet" href="<?= artha_asset('../assets/css/web/admin/produk&stok.css') ?>">
<link rel="stylesheet" href="<?= artha_asset('../assets/css/mobile/layout.css') ?>">
<link rel="stylesheet" href="<?= artha_asset('../assets/css/mobile/sidebar.css') ?>">
<link rel="stylesheet" href="<?= artha_asset('../assets/css/mobile/header.css') ?>">
<link rel="stylesheet" href="<?= artha_asset('../assets/css/mobile/admin/produk&stok.css') ?>">
<link rel="stylesheet" href="<?= artha_asset('../assets/css/shared/notificationPopup.css') ?>">
</head>

<body>
<input type="checkbox" id="sidebar-toggle" class="sidebar-checkbox">

<div class="dashboard-layout">

<aside class="sidebar">
    <div class="sidebar-brand">
        <div class="brand-left">
            <img src="<?= artha_asset('../assets/images/Logo.svg') ?>" alt="Logo ARTHA" class="brand-logo">
            <span class="brand-title">ARTHA</span>
        </div>
        <label for="sidebar-toggle" class="close-sidebar-btn">
            <img src="<?= artha_asset('../assets/icons/actions/cancel.svg') ?>" alt="">
        </label>
    </div>

    <!-- Menu navigasi Admin -->
    <nav class="sidebar-nav">
        <a href="dashboard.php" class="nav-item">
            <img src="<?= artha_asset('../assets/icons/sidebar/dashboard.svg') ?>" class="nav-icon" alt="">
            <span>Dashboard</span>
        </a>

        <a href="pengguna.php" class="nav-item">
            <img src="<?= artha_asset('../assets/icons/sidebar/pengguna.svg') ?>" class="nav-icon" alt="">
            <span>Pengguna</span>
        </a>

        <a href="produk&amp;stok.php" class="nav-item active" aria-current="page">
            <img src="<?= artha_asset('../assets/icons/sidebar/produk&stok.svg') ?>" class="nav-icon" alt="">
            <span>Produk &amp; Stok</span>
        </a>

        <a href="transaksi.php" class="nav-item">
            <img src="<?= artha_asset('../assets/icons/sidebar/transaksi.svg') ?>" class="nav-icon" alt="">
            <span>Transaksi</span>
        </a>

        <a href="../logout.php" class="nav-item logout">
            <img src="<?= artha_asset('../assets/icons/actions/logout.svg') ?>" class="nav-icon" alt="">
            <span>Keluar</span>
        </a>
    </nav>
</aside>

<main class="main-content">

<header class="dashboard-header">
    <div class="header-left">
        <label for="sidebar-toggle" class="hamburger-btn">
            <img src="<?= artha_asset('../assets/icons/actions/hamburger.svg') ?>" alt="">
        </label>
        <h1 class="desktop-page-title">Produk &amp; Stok</h1>
    </div>

    <div class="header-right">
        <div class="admin-profile">
            <div class="profile-circle">
                <img src="<?= artha_asset('../assets/icons/header/profile.svg') ?>" alt="">
            </div>
            <span>Admin</span>
        </div>
    </div>
</header>

<h1 class="mobile-page-title">Produk &amp; Stok</h1>

<div class="page-container product-page-content">

<input type="radio" name="form-mode" id="mode-product" class="form-mode-radio" checked>
<input type="radio" name="form-mode" id="mode-stock" class="form-mode-radio">

<!-- Pencarian dan tombol produk -->
<section class="product-toolbar">
    <label class="product-search">
        <img src="<?= artha_asset('../assets/icons/actions/search.svg') ?>" alt="">
        <input type="search" id="productSearch" placeholder="Cari nama atau kode produk">
    </label>

    <div class="product-toolbar-actions">
        <label for="mode-stock" class="stock-adjust-trigger">
            <img src="<?= artha_asset('../assets/icons/cards/stoktipis.svg') ?>" alt="">
            <span>Sesuaikan stok</span>
        </label>

        <label for="mode-product" class="add-product-trigger">
            <img src="<?= artha_asset('../assets/icons/actions/tambah.svg') ?>" alt="">
            <span>Tambah produk</span>
        </label>
    </div>
</section>


<!-- TAB PRODUK AKTIF DAN NONAKTIF -->
<section class="product-status-tabs">
    <button
        type="button"
        class="product-tab active"
        data-product-tab="active"
        aria-selected="true"
    >
        Produk Aktif
        <span class="tab-count" id="activeProductCount">0</span>
    </button>

    <button
        type="button"
        class="product-tab"
        data-product-tab="inactive"
        aria-selected="false"
    >
        Produk Nonaktif
        <span class="tab-count" id="inactiveProductCount">0</span>
    </button>
</section>

<!-- Tabel produk -->
<section class="product-table-card">

<div class="product-table-wrapper">
<table class="product-table">
<thead>
<tr>
    <th>Kode</th>
    <th>Nama produk</th>
    <th>Harga</th>
    <th>Stok</th>
    <th>Status</th>
    <th class="product-action-header">Aksi</th>
</tr>
</thead>


<tbody id="productTableBody" class="product-page-rows product-page-rows-1">
</tbody>

<tbody class="product-page-rows product-page-rows-2">
</tbody>

<tbody class="product-page-rows product-page-rows-3">
</tbody>

<tbody class="product-page-rows product-page-rows-4">
</tbody>

<tbody class="product-page-rows product-page-rows-5">
</tbody>

<tbody class="product-page-rows product-page-rows-6">
</tbody>

<tbody class="product-page-rows product-page-rows-7">
</tbody>

<tbody class="product-page-rows product-page-rows-8">
</tbody>

<tbody class="product-page-rows product-page-rows-9">
</tbody>

<tbody class="product-page-rows product-page-rows-10">
</tbody>

<tbody class="product-page-rows product-page-rows-11">
</tbody>

<tbody class="product-page-rows product-page-rows-12">
</tbody>

</table>
</div>

<!-- Navigasi halaman produk -->
<div class="product-pagination">

    <div class="product-pagination-controls">
    </div>

    <div class="product-page-numbers">
    </div>
</div>

<p class="product-pagination-info">
    Menampilkan 5 dari 60 produk
</p>

</section>

<!-- Form tambah produk dan penyesuaian stok -->
<section class="product-forms-grid">

<article class="product-form-panel" id="productFormPanel">
    <div class="product-panel-heading">
        <h2>Data Produk</h2>
    </div>

    <form id="productForm">
        <div class="product-fields-grid">

            <div class="product-field">
                <label for="productName">Nama Produk</label>
                <input type="text" id="productName" name="productName"
                       placeholder="Contoh gula pasir 5 KG" required>
            </div>

            <div class="product-field">
                <label for="productCode">Kode Produk</label>
                <input type="text" id="productCode" name="productCode"
                       placeholder="Contoh P001" required>
            </div>

            <div class="product-field">
                <label for="productUnit">Satuan</label>
                <input type="text" id="productUnit" name="productUnit"
                       placeholder="Kg" required>
            </div>

            <div class="product-field">
                <label for="productPrice">Harga</label>
                <input type="number" id="productPrice" name="productPrice"
                       min="0" placeholder="Rp 0" required>
            </div>

            <div class="product-field">
                <label for="productInitialStock">Stok awal</label>
                <input type="number" id="productInitialStock"
                       name="productInitialStock" min="0" placeholder="0" required>
            </div>

            <div class="product-field">
                <label for="productMinimumStock">Batas Minimum</label>
                <input type="number" id="productMinimumStock"
                       name="productMinimumStock" min="0" value="40" required>
            </div>

        </div>

        <div class="product-form-actions">
            <button type="submit" class="admin-primary-button">
                <span class="button-symbol">▣</span> Simpan produk
            </button>

            <button type="reset" class="admin-outline-button">
                <span class="button-symbol">×</span> Batal
            </button>
        </div>
    </form>
</article>

<!-- Form penyesuaian stok -->
<article class="stock-form-panel" id="stockFormPanel">
    <div class="product-panel-heading">
        <h2>Penyesuaian Stok</h2>
    </div>

    <form id="stockForm">

        <div class="product-field stock-product-field">
            <label for="stockProduct">Pilih Produk</label>

            <select id="stockProduct" name="stockProduct" required>
                    <option value="" selected disabled>
                         Memuat produk...
                    </option>
            </select>
        </div>

        <div class="stock-number-grid">

            <div class="product-field">
                <label for="currentStock">Stok Saat Ini</label>
                <input type="number" id="currentStock" value="0" readonly>
            </div>

            <div class="product-field">
                <label for="newStock">Stok Baru</label>
                <input
                    type="number"
                    id="newStock"
                    name="newStock"
                    min="0"
                    step="1"
                    placeholder="Masukkan stok baru"
                >
            </div>

            <div class="product-field">
                <label for="currentPrice">Harga Saat Ini</label>
                <input
                    type="number"
                    id="currentPrice"
                    value="0"
                    readonly
                >
            </div>

            <div class="product-field">
                <label for="newPrice">Harga Baru</label>
                <input
                    type="number"
                    id="newPrice"
                    name="newPrice"
                    min="0"
                    step="1"
                    placeholder="Masukkan harga baru"
                >
            </div>

        </div>

        <div class="product-field total-stock-field">
            <label for="totalStock">Total Stok</label>
            <input type="number" id="totalStock" value="0" readonly>
        </div>

        <div class="stock-form-actions">
            <button type="submit" class="admin-primary-button">
                <span class="button-symbol">✓</span> Simpan Penyesuaian
            </button>

            <button type="reset" class="admin-outline-button">
                <span class="button-symbol">×</span> Batal
            </button>
        </div>

    </form>
</article>

</section>
</div>
</main>

<label for="sidebar-toggle" class="sidebar-overlay" aria-label="Tutup sidebar"></label>
</div>

<!-- JavaScript produk dan stok -->
<script src="<?= artha_asset('../assets/js/admin/produk-stok.js') ?>"></script>
<script src="<?= artha_asset('../assets/js/navigation.js') ?>" defer></script>
<script src="<?= artha_asset('../assets/js/shared/popup.js') ?>"></script>

</body>
</html>