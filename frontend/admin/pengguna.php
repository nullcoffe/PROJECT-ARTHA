
<?php
// Halaman manajemen pengguna Admin
?>

<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#FFFDF0">

    <title>Manajemen Pengguna | ARTHA</title>

    <!-- CSS utama -->
    <link rel="stylesheet" href="../assets/css/shared/variables.css">
    <link rel="stylesheet" href="../assets/css/shared/reset.css">

    <!-- CSS desktop -->
    <link rel="stylesheet" href="../assets/css/web/layout.css">
    <link rel="stylesheet" href="../assets/css/web/sidebar.css">
    <link rel="stylesheet" href="../assets/css/web/header.css">
    <link rel="stylesheet" href="../assets/css/web/admin/pengguna.css">

    <!-- CSS mobile -->
    <link rel="stylesheet" href="../assets/css/mobile/layout.css">
    <link rel="stylesheet" href="../assets/css/mobile/sidebar.css">
    <link rel="stylesheet" href="../assets/css/mobile/header.css">
    <link rel="stylesheet" href="../assets/css/mobile/admin/pengguna.css">

    <!-- CSS notifikasi -->
    <link rel="stylesheet" href="../assets/css/shared/notificationPopup.css">

</head>

<body>

    <!-- Kontrol sidebar -->
    <input
        type="checkbox"
        id="sidebar-toggle"
        class="sidebar-checkbox"
        aria-label="Buka atau tutup sidebar"
    >

    <div class="dashboard-layout">

        <!-- Sidebar Admin -->
        <aside class="sidebar">

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

                    <img
                        src="../assets/icons/actions/cancel.svg"
                        alt=""
                    >

                </label>

            </div>

            <!-- Menu navigasi Admin -->
            <nav class="sidebar-nav">

                <a href="dashboard.php" class="nav-item">

                    <img
                        src="../assets/icons/sidebar/dashboard.svg"
                        class="nav-icon"
                        alt=""
                    >

                    <span>Dashboard</span>

                </a>

                <a
                    href="pengguna.php"
                    class="nav-item active"
                    aria-current="page"
                >

                    <img
                        src="../assets/icons/sidebar/pengguna.svg"
                        class="nav-icon"
                        alt=""
                    >

                    <span>Pengguna</span>

                </a>

                <!-- Navigasi menuju Produk dan Stok PHP -->
                <a href="produk&amp;stok.php" class="nav-item">

                    <img
                        src="../assets/icons/sidebar/produk&amp;stok.svg"
                        class="nav-icon"
                        alt=""
                    >

                    <span>Produk &amp; Stok</span>

                </a>

                <!-- Navigasi menuju Transaksi PHP -->
                <a href="transaksi.php" class="nav-item">

                    <img
                        src="../assets/icons/sidebar/transaksi.svg"
                        class="nav-icon"
                        alt=""
                    >

                    <span>Transaksi</span>

                </a>

                <!-- Keluar dari halaman Admin -->
                <a href="../index.php" class="nav-item logout">

                    <img
                        src="../assets/icons/actions/logout.svg"
                        class="nav-icon"
                        alt=""
                    >

                    <span>Keluar</span>

                </a>

            </nav>

        </aside>

        <!-- Konten utama -->
        <main class="main-content">

            <!-- Header halaman -->
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

                    <h1 class="desktop-page-title">
                        Manajemen Pengguna
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
                Manajemen Pengguna
            </h1>

            <!-- Konten manajemen pengguna -->
            <div class="page-container admin-users-content">

                <!-- Tombol tambah pengguna -->
                <div class="users-toolbar">

                    <a
                        href="#userFormSection"
                        class="add-user-button"
                    >
                        + Tambah Pengguna
                    </a>

                </div>

                <!-- Tabel daftar pengguna -->
                <section
                    class="users-table-card"
                    aria-label="Daftar pengguna"
                >

                    <div class="users-table-wrapper">

                        <table class="users-table">

                            <thead>

                                <tr>
                                    <th>Nama</th>
                                    <th>Username</th>
                                    <th>Jenis Pengguna</th>
                                    <th>Kata Sandi</th>
                                    <th>Aksi</th>
                                </tr>

                            </thead>

                            <tbody>

                                <!-- Data pengguna Laudya -->
                                <tr>

                                    <td>Laudya</td>

                                    <td>Laudya.Pemilik</td>

                                    <td>
                                        <span class="role-badge role-owner">
                                            Pemilik
                                        </span>
                                    </td>

                                    <td>
                                        <span
                                            class="password-hidden"
                                            aria-label="Kata sandi disembunyikan"
                                        >
                                            ••••••••
                                        </span>
                                    </td>

                                    <td>

                                        <div class="users-actions">

                                            <a
                                                href="#userFormSection"
                                                class="action-button edit-button"
                                                aria-label="Ubah akun Laudya"
                                            >

                                                <img
                                                    src="../assets/icons/actions/edit.svg"
                                                    alt=""
                                                >

                                            </a>

                                            <a
                                                href="#"
                                                class="action-button delete-button"
                                                aria-label="Hapus akun Laudya"
                                            >

                                                <img
                                                    src="../assets/icons/actions/delete.svg"
                                                    alt=""
                                                >

                                            </a>

                                        </div>

                                    </td>

                                </tr>

                                <!-- Data pengguna Abin -->
                                <tr>

                                    <td>Abin</td>

                                    <td>Abin.Kasir</td>

                                    <td>
                                        <span class="role-badge role-cashier">
                                            Kasir
                                        </span>
                                    </td>

                                    <td>
                                        <span
                                            class="password-hidden"
                                            aria-label="Kata sandi disembunyikan"
                                        >
                                            ••••••••
                                        </span>
                                    </td>

                                    <td>

                                        <div class="users-actions">

                                            <a
                                                href="#userFormSection"
                                                class="action-button edit-button"
                                                aria-label="Ubah akun Abin"
                                            >

                                                <img
                                                    src="../assets/icons/actions/edit.svg"
                                                    alt=""
                                                >

                                            </a>

                                            <a
                                                href="#"
                                                class="action-button delete-button"
                                                aria-label="Hapus akun Abin"
                                            >

                                                <img
                                                    src="../assets/icons/actions/delete.svg"
                                                    alt=""
                                                >

                                            </a>

                                        </div>

                                    </td>

                                </tr>

                                <!-- Data pengguna Alra -->
                                <tr>

                                    <td>Alra</td>

                                    <td>Alra.Kasir</td>

                                    <td>
                                        <span class="role-badge role-cashier">
                                            Kasir
                                        </span>
                                    </td>

                                    <td>
                                        <span
                                            class="password-hidden"
                                            aria-label="Kata sandi disembunyikan"
                                        >
                                            ••••••••
                                        </span>
                                    </td>

                                    <td>

                                        <div class="users-actions">

                                            <a
                                                href="#userFormSection"
                                                class="action-button edit-button"
                                                aria-label="Ubah akun Alra"
                                            >

                                                <img
                                                    src="../assets/icons/actions/edit.svg"
                                                    alt=""
                                                >

                                            </a>

                                            <a
                                                href="#"
                                                class="action-button delete-button"
                                                aria-label="Hapus akun Alra"
                                            >

                                                <img
                                                    src="../assets/icons/actions/delete.svg"
                                                    alt=""
                                                >

                                            </a>

                                        </div>

                                    </td>

                                </tr>

                            </tbody>

                        </table>

                    </div>

                </section>

                <!-- Form tambah dan ubah pengguna -->
                <section
                    class="user-form-card"
                    id="userFormSection"
                >

                    <h2>Form Pengguna</h2>

                    <form class="user-form" id="userForm">

                        <!-- Input nama -->
                        <div class="form-field">

                            <label for="newName">
                                Nama
                            </label>

                            <input
                                type="text"
                                id="newName"
                                name="name"
                                placeholder="Masukan nama pengguna"
                                autocomplete="off"
                                required
                            >

                        </div>

                        <!-- Input username -->
                        <div class="form-field">

                            <label for="newUsername">
                                Username
                            </label>

                            <input
                                type="text"
                                id="newUsername"
                                name="username"
                                placeholder="Masukan Username"
                                autocomplete="off"
                                required
                            >

                        </div>

                        <!-- Pilihan jenis pengguna -->
                        <div class="form-field">

                            <label for="newRole">
                                Jenis Pengguna
                            </label>

                            <select
                                id="newRole"
                                name="role"
                                required
                            >

                                <option value="" selected disabled>
                                    Pilih Pengguna
                                </option>

                                <option value="pemilik">
                                    Pemilik
                                </option>

                                <option value="kasir">
                                    Kasir
                                </option>

                            </select>

                        </div>

                        <!-- Input password -->
                        <div class="form-field">

                            <label for="newPassword">
                                Kata Sandi Baru
                            </label>

                            <div class="form-password-field">

                                <input
                                    type="password"
                                    id="newPassword"
                                    name="password"
                                    placeholder="Masukan kata sandi baru"
                                    autocomplete="new-password"
                                    minlength="8"
                                    required
                                >

                            </div>

                        </div>

                        <!-- Tombol form -->
                        <div class="form-actions">

                            <button
                                type="submit"
                                class="save-user-button"
                            >
                                Simpan
                            </button>

                            <button
                                type="reset"
                                class="cancel-user-button"
                            >
                                Batal
                            </button>

                        </div>

                    </form>

                </section>

            </div>

        </main>

        <!-- Overlay sidebar mobile -->
        <label
            for="sidebar-toggle"
            class="sidebar-overlay"
            aria-label="Tutup sidebar"
        ></label>

    </div>

    <!-- JavaScript popup -->
    <script src="../assets/js/shared/popup.js"></script>

    <!-- JavaScript manajemen pengguna -->
    <script src="../assets/js/admin/user.js"></script>

    <!-- JavaScript navigasi -->
    <script src="../assets/js/navigation.js"></script>

</body>

</html>