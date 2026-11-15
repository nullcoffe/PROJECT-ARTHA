<?php
// Halaman dashboard Pemilik ARTHA
?>
<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Dashboard Pemilik | ARTHA</title>

    <!-- SHARED CSS -->
    <link rel="stylesheet" href="../assets/css/shared/variables.css">
    <link rel="stylesheet" href="../assets/css/shared/reset.css">
    <link rel="stylesheet" href="../assets/css/shared/popup.css">
    <link rel="stylesheet" href="../assets/css/shared/notificationPopup.css">

    <!-- WEB CSS -->
    <link rel="stylesheet" href="../assets/css/web/layout.css">
    <link rel="stylesheet" href="../assets/css/web/sidebar.css">
    <link rel="stylesheet" href="../assets/css/web/header.css">
    <link rel="stylesheet" href="../assets/css/web/pemilik/dashboard.css">
    <link rel="stylesheet" href="../assets/css/web/popupProfil.css">

    <!-- MOBILE CSS -->
    <link rel="stylesheet" href="../assets/css/mobile/layout.css">
    <link rel="stylesheet" href="../assets/css/mobile/sidebar.css">
    <link rel="stylesheet" href="../assets/css/mobile/header.css">
    <link rel="stylesheet" href="../assets/css/mobile/pemilik/dashboard.css">
    <link rel="stylesheet" href="../assets/css/mobile/popupProfil.css">

</head>

<body>

    <!-- Kontrol popup profil -->
    <input type="checkbox"
           id="profile-popup-toggle"
           class="profile-popup-toggle">

    <!-- Popup profil Pemilik -->
    <div class="profile-popup-overlay">

        <label for="profile-popup-toggle"
               class="profile-popup-backdrop"
               aria-label="Tutup popup profil">
        </label>

        <section class="profile-popup"
                 role="dialog"
                 aria-modal="true"
                 aria-labelledby="profile-popup-title">

            <!-- Header popup -->
            <div class="profile-popup-header">

                <h2 id="profile-popup-title">
                    Profil Pengguna
                </h2>

                <label for="profile-popup-toggle"
                       class="profile-popup-close"
                       aria-label="Tutup popup">
                    &times;
                </label>

            </div>

            <!-- Informasi pengguna -->
            <div class="profile-user-info">

                <div class="profile-avatar">

                    <img src="../assets/icons/header/profile.svg"
                         alt="Ikon pengguna">

                </div>

                <div class="profile-user-detail">

                    <strong>Nama Pengguna</strong>

                    <span>username</span>

                    <small class="profile-role">
                        Pemilik
                    </small>

                </div>

            </div>

            <div class="profile-divider"></div>

            <!-- Kontrol expand password -->
            <input type="checkbox"
                   id="password-expand"
                   class="password-expand-toggle">

            <label for="password-expand"
                   class="password-expand-label">

                <span>Ubah Password</span>

                <span class="password-chevron"
                      aria-hidden="true">
                </span>

            </label>

            <!-- Form password -->
            <div class="password-expand-content">

                <form class="profile-password-form"
                      action="#"
                      method="post">

                    <label for="new-password">
                        Password Baru
                    </label>

                    <div class="password-input-wrapper">

                        <input type="password"
                               id="new-password"
                               name="new_password"
                               placeholder="Masukkan password baru"
                               autocomplete="new-password"
                               required>

                        <button type="button"
                                class="password-visibility-toggle"
                                id="toggle-password"
                                aria-label="Lihat password">

                            <svg id="password-eye-icon"
                                 viewBox="0 0 24 24"
                                 fill="none"
                                 stroke="currentColor"
                                 stroke-width="1.8"
                                 stroke-linecap="round"
                                 stroke-linejoin="round"
                                 aria-hidden="true">

                                <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"/>

                                <circle cx="12"
                                        cy="12"
                                        r="3"/>

                            </svg>

                        </button>

                    </div>

                    <button type="submit"
                            class="profile-save-button">
                        Simpan
                    </button>

                </form>

            </div>

        </section>

    </div>

    <!-- Kontrol sidebar -->
    <input type="checkbox"
           id="sidebar-toggle"
           class="sidebar-checkbox"
           aria-label="Buka atau tutup sidebar">

    <!-- Layout utama -->
    <div class="dashboard-layout">

        <!-- Sidebar -->
        <aside class="sidebar">

            <div class="sidebar-brand">

                <div class="brand-left">

                    <img src="../assets/images/Logo.svg"
                         alt="Logo ARTHA"
                         class="brand-logo">

                    <span class="brand-title">
                        ARTHA
                    </span>

                </div>

                <label for="sidebar-toggle"
                       class="close-sidebar-btn"
                       aria-label="Tutup sidebar">

                    <img src="../assets/icons/actions/cancel.svg"
                         alt="">

                </label>

            </div>

            <!-- Menu Pemilik -->
            <nav class="sidebar-nav">

                <a href="dashboard.php"
                   class="nav-item active"
                   aria-current="page">

                    <img src="../assets/icons/sidebar/dashboard.svg"
                         alt=""
                         class="nav-icon">

                    <span>Dashboard</span>

                </a>

                <a href="laporan.php"
                   class="nav-item">

                    <img src="../assets/icons/sidebar/laporan.svg"
                         alt=""
                         class="nav-icon">

                    <span>Laporan</span>

                </a>

                <a href="analisisApriori.php"
                   class="nav-item">

                    <img src="../assets/icons/sidebar/analisisApriori.svg"
                         alt=""
                         class="nav-icon">

                    <span>Analisis Apriori</span>

                </a>

                <a href="paketPromosi.php"
                   class="nav-item">

                    <img src="../assets/icons/sidebar/paketPromosi.svg"
                         alt=""
                         class="nav-icon">

                    <span>Paket Promosi</span>

                </a>

                <a href="prioritasStok.php"
                   class="nav-item">

                    <img src="../assets/icons/sidebar/prioritasStok.svg"
                         alt=""
                         class="nav-icon">

                    <span>Prioritas Stok</span>

                </a>

                <a href="../index.php"
                   class="nav-item logout">

                    <img src="../assets/icons/actions/logout.svg"
                         class="nav-icon"
                         alt="">

                    <span>Keluar</span>

                </a>

            </nav>

        </aside>

        <!-- Tombol hamburger -->
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

                <h1>Dashboard Pemilik</h1>

                <div class="header-right">

                    <!-- Pemanggil popup profil -->
                    <label for="profile-popup-toggle"
                           class="user-profile"
                           aria-label="Buka profil Pemilik">

                        <div class="profile-circle">

                            <img src="../assets/icons/header/profile.svg"
                                 alt="">

                        </div>

                        <span>Pemilik</span>

                    </label>

                </div>

            </header>

            <!-- Konten dashboard -->
            <div class="page-container">

                <!-- Statistik -->
                <section class="owner-statistics">

                    <!-- Omzet penjualan -->
                    <article class="owner-stat-card">

                        <div class="owner-stat-icon">

                            <img src="../assets/icons/cards/omzetPenjualan.svg"
                                 alt="">

                        </div>

                        <div class="owner-stat-info">

                            <p>Omzet Penjualan</p>

                            <h2>Rp28,4 jt</h2>

                        </div>

                    </article>

                    <!-- Jumlah transaksi -->
                    <article class="owner-stat-card">

                        <div class="owner-stat-icon">

                            <img src="../assets/icons/cards/totaljumlahtransaksi.svg"
                                 alt="">

                        </div>

                        <div class="owner-stat-info">

                            <p>Jumlah Transaksi</p>

                            <h2>350</h2>

                        </div>

                    </article>

                    <!-- Rekomendasi paket -->
                    <article class="owner-stat-card">

                        <div class="owner-stat-icon">

                            <img src="../assets/icons/cards/rekomendasipaket.svg"
                                 alt="">

                        </div>

                        <div class="owner-stat-info">

                            <p>Rekomendasi Paket</p>

                            <h2>6</h2>

                        </div>

                    </article>

                </section>

                <!-- Grafik penjualan -->
                <section class="owner-chart-card">

                    <!-- Header grafik -->
                    <div class="owner-chart-header">

                        <h3>Tren Penjualan Bulanan</h3>

                        <select class="owner-year-select"
                                aria-label="Pilih tahun">

                            <option value="2024">
                                2024
                            </option>

                            <option value="2025" selected>
                                2025
                            </option>

                            <option value="2026">
                                2026
                            </option>

                        </select>

                    </div>

                    <!-- Area grafik -->
                    <div class="owner-chart-content">

                        <!-- Sumbu Y -->
                        <div class="owner-chart-y-axis">

                            <span>Rp12 jt</span>
                            <span>Rp9 jt</span>
                            <span>Rp6 jt</span>
                            <span>Rp3 jt</span>
                            <span>0</span>

                        </div>

                        <!-- Batang grafik -->
                        <div class="owner-chart-bars">

                            <div class="owner-bar-group">
                                <div class="owner-bar-area">
                                    <div class="owner-bar blue" style="height:35%"></div>
                                </div>
                                <span>Jan</span>
                            </div>

                            <div class="owner-bar-group">
                                <div class="owner-bar-area">
                                    <div class="owner-bar blue" style="height:55%"></div>
                                </div>
                                <span>Feb</span>
                            </div>

                            <div class="owner-bar-group">
                                <div class="owner-bar-area">
                                    <div class="owner-bar yellow" style="height:43%"></div>
                                </div>
                                <span>Mar</span>
                            </div>

                            <div class="owner-bar-group">
                                <div class="owner-bar-area">
                                    <div class="owner-bar blue" style="height:63%"></div>
                                </div>
                                <span>Apr</span>
                            </div>

                            <div class="owner-bar-group">
                                <div class="owner-bar-area">
                                    <div class="owner-bar blue" style="height:56%"></div>
                                </div>
                                <span>Mei</span>
                            </div>

                            <div class="owner-bar-group">
                                <div class="owner-bar-area">
                                    <div class="owner-bar yellow" style="height:76%"></div>
                                </div>
                                <span>Jun</span>
                            </div>

                            <div class="owner-bar-group">
                                <div class="owner-bar-area">
                                    <div class="owner-bar blue" style="height:54%"></div>
                                </div>
                                <span>Jul</span>
                            </div>

                            <div class="owner-bar-group">
                                <div class="owner-bar-area">
                                    <div class="owner-bar blue" style="height:74%"></div>
                                </div>
                                <span>Agu</span>
                            </div>

                            <div class="owner-bar-group">
                                <div class="owner-bar-area">
                                    <div class="owner-bar yellow" style="height:62%"></div>
                                </div>
                                <span>Sep</span>
                            </div>

                            <div class="owner-bar-group">
                                <div class="owner-bar-area">
                                    <div class="owner-bar blue" style="height:88%"></div>
                                </div>
                                <span>Okt</span>
                            </div>

                            <div class="owner-bar-group">
                                <div class="owner-bar-area">
                                    <div class="owner-bar blue" style="height:80%"></div>
                                </div>
                                <span>Nov</span>
                            </div>

                            <div class="owner-bar-group">
                                <div class="owner-bar-area">
                                    <div class="owner-bar yellow" style="height:94%"></div>
                                </div>
                                <span>Des</span>
                            </div>

                        </div>

                    </div>

                </section>

            </div>

        </main>

    </div>

    <!-- JavaScript lihat password -->
    <script>
        document.addEventListener("DOMContentLoaded", function () {

            const passwordInput =
                document.getElementById("new-password");

            const toggleButton =
                document.getElementById("toggle-password");

            const eyeIcon =
                document.getElementById("password-eye-icon");

            if (!passwordInput || !toggleButton || !eyeIcon) {
                return;
            }

            toggleButton.addEventListener("click", function () {

                const showPassword =
                    passwordInput.type === "password";

                passwordInput.type =
                    showPassword ? "text" : "password";

                toggleButton.setAttribute(
                    "aria-label",
                    showPassword
                        ? "Sembunyikan password"
                        : "Lihat password"
                );

                if (showPassword) {

                    eyeIcon.innerHTML = `
                        <path d="M3 3l18 18"/>
                        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"/>
                        <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a15.8 15.8 0 0 1-3.1 3.8"/>
                        <path d="M6.2 6.2C3.5 8 2 12 2 12s3.6 7 10 7c1.2 0 2.3-.2 3.3-.6"/>
                    `;

                } else {

                    eyeIcon.innerHTML = `
                        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"/>
                        <circle cx="12" cy="12" r="3"/>
                    `;

                }

            });

            // Reset field ketika popup ditutup
            const popupToggle =
                document.getElementById("profile-popup-toggle");

            if (popupToggle) {

                popupToggle.addEventListener("change", function () {

                    if (!this.checked) {

                        passwordInput.value = "";
                        passwordInput.type = "password";

                        const passwordExpand =
                            document.getElementById("password-expand");

                        if (passwordExpand) {
                            passwordExpand.checked = false;
                        }

                        toggleButton.setAttribute(
                            "aria-label",
                            "Lihat password"
                        );

                        eyeIcon.innerHTML = `
                            <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"/>
                            <circle cx="12" cy="12" r="3"/>
                        `;

                    }

                });

            }

        });
    </script>

    <script src="../assets/js/shared/popup.js" defer></script>
    <script src="../assets/js/pemilik/dashboard.js" defer></script>
    <script src="../assets/js/navigation.js" defer></script>

</body>
</html>