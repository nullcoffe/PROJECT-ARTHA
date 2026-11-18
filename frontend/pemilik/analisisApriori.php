
<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Analisis Apriori | ARTHA</title>

    <!-- SHARED CSS -->
    <link rel="stylesheet" href="../assets/css/shared/variables.css">
    <link rel="stylesheet" href="../assets/css/shared/reset.css">
    <link rel="stylesheet" href="../assets/css/shared/popup.css">

    <!-- WEB CSS -->
    <link rel="stylesheet" href="../assets/css/web/layout.css">
    <link rel="stylesheet" href="../assets/css/web/sidebar.css">
    <link rel="stylesheet" href="../assets/css/web/header.css">
    <link rel="stylesheet" href="../assets/css/web/popup.css">
    <link rel="stylesheet" href="../assets/css/web/pemilik/analisisApriori.css">

    <!-- MOBILE CSS -->
    <link rel="stylesheet" href="../assets/css/mobile/layout.css">
    <link rel="stylesheet" href="../assets/css/mobile/sidebar.css">
    <link rel="stylesheet" href="../assets/css/mobile/header.css">
    <link rel="stylesheet" href="../assets/css/mobile/popup.css">
    <link rel="stylesheet" href="../assets/css/mobile/pemilik/analisisApriori.css">

    <link rel="stylesheet" href="../assets/css/shared/notificationPopup.css">
</head>

<body>

    <!-- SIDEBAR CONTROL -->
    <input type="checkbox"
           id="sidebar-toggle"
           class="sidebar-checkbox">

    <div class="dashboard-layout">

        <!-- SIDEBAR -->
        <aside class="sidebar">

            <div class="sidebar-brand">

                <div class="brand-left">
                    <img src="../assets/images/Logo.svg"
                         alt="Logo ARTHA"
                         class="brand-logo">

                    <span class="brand-title">ARTHA</span>
                </div>

                <label for="sidebar-toggle"
                       class="close-sidebar-btn">

                    <img src="../assets/icons/actions/cancel.svg"
                         alt="">

                </label>

            </div>

            <!-- NAVIGASI PEMILIK -->
            <nav class="sidebar-nav">

                <a href="dashboard.php" class="nav-item">
                    <img src="../assets/icons/sidebar/dashboard.svg"
                         alt="" class="nav-icon">
                    <span>Dashboard</span>
                </a>

                <a href="laporan.php" class="nav-item">
                    <img src="../assets/icons/sidebar/laporan.svg"
                         alt="" class="nav-icon">
                    <span>Laporan</span>
                </a>

                <a href="analisisApriori.php"
                   class="nav-item active"
                   aria-current="page">

                    <img src="../assets/icons/sidebar/analisisApriori.svg"
                         alt="" class="nav-icon">

                    <span>Analisis Apriori</span>
                </a>

                <a href="paketPromosi.php" class="nav-item">
                    <img src="../assets/icons/sidebar/paketPromosi.svg"
                         alt="" class="nav-icon">
                    <span>Paket Promosi</span>
                </a>

                <a href="prioritasStok.php" class="nav-item">
                    <img src="../assets/icons/sidebar/prioritasStok.svg"
                         alt="" class="nav-icon">
                    <span>Prioritas Stok</span>
                </a>

                <a href="../logout.php" class="nav-item logout">
                    <img src="../assets/icons/actions/logout.svg"
                         alt="" class="nav-icon">
                    <span>Keluar</span>
                </a>

            </nav>

        </aside>

        <!-- HAMBURGER -->
        <label for="sidebar-toggle" class="hamburger-btn">
            <img src="../assets/icons/actions/hamburger.svg" alt="">
        </label>

        <!-- OVERLAY SIDEBAR -->
        <label for="sidebar-toggle"
               class="sidebar-overlay"></label>

        <!-- MAIN CONTENT -->
        <div class="main-content">

            <!-- HEADER -->
            <header class="dashboard-header">

                <h1>Analisis Apriori</h1>

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

            <!-- PAGE CONTENT -->
            <div class="page-container">

                <main class="owner-apriori">

                    <!-- KONFIGURASI ANALISIS -->
                    <section class="apriori-config-card">

                        <h2>Konfigurasi Analisis Apriori</h2>

                        <form class="apriori-form"
                              action="#popup-apriori-success"
                              method="GET">

                            <!-- SUPPORT -->
                            <div class="apriori-field">

                                <label for="minimum-support">
                                    Minimum Support
                                </label>

                                <div class="apriori-select-wrap">

                                    <select id="minimum-support"
                                            name="support"
                                            required>

                                        <option value=""
                                                selected disabled>
                                            Pilih support
                                        </option>

                                        <option value="3">3%</option>
                                        <option value="5">5%</option>
                                        <option value="7">7%</option>
                                        <option value="custom">Custom</option>

                                    </select>

                                    <span class="apriori-chevron"></span>

                                </div>

                                <input type="number"
                                       name="support_custom"
                                       class="apriori-custom-input apriori-support-custom"
                                       min="0.01"
                                       max="100"
                                       step="0.01"
                                       placeholder="Masukkan support custom (%)">

                            </div>

                            <!-- CONFIDENCE -->
                            <div class="apriori-field">

                                <label for="minimum-confidence">
                                    Minimum Confidence
                                </label>

                                <div class="apriori-select-wrap">

                                    <select id="minimum-confidence"
                                            name="confidence"
                                            required>

                                        <option value=""
                                                selected disabled>
                                            Pilih confidence
                                        </option>

                                        <option value="50">50%</option>
                                        <option value="60">60%</option>
                                        <option value="70">70%</option>
                                        <option value="custom">Custom</option>

                                    </select>

                                    <span class="apriori-chevron"></span>

                                </div>

                                <input type="number"
                                       name="confidence_custom"
                                       class="apriori-custom-input apriori-confidence-custom"
                                       min="0.01"
                                       max="100"
                                       step="0.01"
                                       placeholder="Masukkan confidence custom (%)">

                            </div>

                            <!-- PERIODE -->
                            <div class="apriori-field">

                                <label for="transaction-period">
                                    Periode Transaksi (Tahun)
                                </label>

                                <div class="apriori-select-wrap">

                                    <select id="transaction-period"
                                            name="tahun"
                                            required>

                                        <option value=""
                                                selected disabled>
                                            Pilih periode transaksi
                                        </option>

                                        <option value="2024">2024</option>
                                        <option value="2025">2025</option>
                                        <option value="2026">2026</option>

                                    </select>

                                    <span class="apriori-chevron"></span>

                                </div>

                            </div>

                            <!-- JUMLAH TRANSAKSI -->
                            <div class="apriori-field">

                                <label>Jumlah Transaksi</label>

                                <div class="apriori-transaction-value">

                                    <span class="transaction-placeholder">
                                        Jumlah transaksi akan ditampilkan oleh sistem
                                    </span>

                                    <span class="transaction-2024">
                                        149 Transaksi
                                    </span>

                                    <span class="transaction-2025">
                                        201 Transaksi
                                    </span>

                                    <span class="transaction-2026">
                                        0 Transaksi
                                    </span>

                                </div>

                            </div>

                            <!-- TOMBOL INFORMASI PARAMETER APRIORI -->
                            <button type="button"
                                    class="apriori-info-button"
                                    id="open-apriori-info">

                                <img src="../assets/icons/actions/info.svg"
                                     alt=""
                                     onerror="this.style.display='none'">

                                Panduan Nilai Support & Confidence

                            </button>

                            <!-- POPUP INFORMASI APRIORI -->
                            <dialog id="apriori-info-dialog"
                                    class="apriori-info-dialog">

                                <div class="apriori-info-header">

                                    <div>
                                        <h2>Panduan Parameter Apriori</h2>
                                        <p>Rekomendasi berdasarkan 350 transaksi</p>
                                    </div>

                                    <button type="button"
                                            class="apriori-info-close"
                                            id="close-apriori-info"
                                            aria-label="Tutup informasi">
                                        &times;
                                    </button>

                                </div>

                                <div class="apriori-info-content">

                                    <p>
                                        Panduan ini membantu menentukan batas minimum
                                        support dan confidence sesuai tujuan analisis.
                                    </p>

                                    <h3>1. Klasifikasi Minimum Support</h3>

                                    <p>
                                        Menentukan seberapa sering kombinasi produk muncul.
                                    </p>

                                    <div class="apriori-info-table-wrap">

                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Kategori</th>
                                                    <th>Support</th>
                                                    <th>Minimal Muncul</th>
                                                    <th>Penggunaan</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                <tr>
                                                    <td>Sangat Rendah</td>
                                                    <td>2%</td>
                                                    <td>7 kali</td>
                                                    <td>Mencari pola langka</td>
                                                </tr>

                                                <tr>
                                                    <td>Rendah</td>
                                                    <td>3–4%</td>
                                                    <td>11–14 kali</td>
                                                    <td>Eksplorasi awal</td>
                                                </tr>

                                                <tr>
                                                    <td>Sedang</td>
                                                    <td>5–6%</td>
                                                    <td>18–21 kali</td>
                                                    <td>Analisis seimbang</td>
                                                </tr>

                                                <tr>
                                                    <td>Tinggi</td>
                                                    <td>7–8%</td>
                                                    <td>25–28 kali</td>
                                                    <td>Produk populer</td>
                                                </tr>

                                                <tr>
                                                    <td>Sangat Tinggi</td>
                                                    <td>9–10%</td>
                                                    <td>32–35 kali</td>
                                                    <td>Pola paling sering</td>
                                                </tr>
                                            </tbody>
                                        </table>

                                    </div>

                                    <h3>2. Klasifikasi Minimum Confidence</h3>

                                    <p>
                                        Menentukan kekuatan hubungan antarproduk dalam aturan.
                                    </p>

                                    <div class="apriori-info-table-wrap">

                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Kategori</th>
                                                    <th>Confidence</th>
                                                    <th>Penggunaan</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                <tr>
                                                    <td>Longgar</td>
                                                    <td>40–49%</td>
                                                    <td>Melihat tren awal</td>
                                                </tr>

                                                <tr>
                                                    <td>Moderat</td>
                                                    <td>50–59%</td>
                                                    <td>Pengujian pola umum</td>
                                                </tr>

                                                <tr>
                                                    <td>Kuat</td>
                                                    <td>60–69%</td>
                                                    <td>Penataan produk</td>
                                                </tr>

                                                <tr>
                                                    <td>Sangat Kuat</td>
                                                    <td>70–79%</td>
                                                    <td>Evaluasi paket bundling</td>
                                                </tr>

                                                <tr>
                                                    <td>Sangat Tinggi</td>
                                                    <td>80–90%</td>
                                                    <td>Penyaringan aturan lebih ketat</td>
                                                </tr>
                                            </tbody>
                                        </table>

                                    </div>

                                    <h3>3. Rekomendasi Kombinasi Parameter</h3>

                                    <div class="apriori-recommendations">

                                        <div class="apriori-recommendation">

                                            <strong>Eksploratif</strong>

                                            <span>
                                                Support 3% | Confidence 50%
                                            </span>

                                            <p>
                                                Untuk menemukan lebih banyak hubungan
                                                antarproduk, termasuk pola yang jarang muncul.
                                            </p>

                                        </div>

                                        <div class="apriori-recommendation recommended">

                                            <strong>Konservatif — Pilihan Awal</strong>

                                            <span>
                                                Support 5% | Confidence 65%
                                            </span>

                                            <p>
                                                Untuk memprioritaskan pola yang cukup sering
                                                muncul dengan hubungan antarproduk lebih kuat.
                                            </p>

                                        </div>

                                        <div class="apriori-recommendation">

                                            <strong>Maksimisasi</strong>

                                            <span>
                                                Support 7% | Confidence 70%
                                            </span>

                                            <p>
                                                Untuk menyaring aturan yang lebih selektif
                                                dan berfokus pada kombinasi produk populer.
                                            </p>

                                        </div>

                                    </div>

                                    <p class="apriori-info-note">
                                        Catatan: Semakin tinggi batas support dan confidence,
                                        semakin sedikit aturan yang mungkin dihasilkan.
                                        Kombinasi apa pun tidak menjamin munculnya aturan.
                                        Confidence bukan jaminan akurasi prediksi.
                                    </p>

                                </div>

                                <div class="apriori-info-footer">

                                    <button type="button"
                                            id="done-apriori-info">
                                        Mengerti
                                    </button>

                                </div>

                            </dialog>

                            <!-- TOMBOL ANALISIS -->
                            <div class="apriori-action">

                                <button type="submit"
                                        class="apriori-run-button">
                                    Jalankan Analisis
                                </button>

                            </div>

                        </form>

                        <p class="apriori-info">
                            Pilih parameter analisis dan periode transaksi
                            sebelum menjalankan analisis asosiasi.
                        </p>

                    </section>

                    <!-- HASIL ANALISIS -->
                    <section class="apriori-result-card"
                             id="hasil-analisis">

                        <div class="apriori-result-header">

                            <h2>Hasil Analisis Asosiasi</h2>

                            <span class="apriori-result-period">
                                Belum dianalisis
                            </span>

                        </div>

                        <!-- LEGENDA LIFT -->
                        <div class="apriori-lift-legend">

                            <span>Rentang Lift</span>

                            <span class="lift-color lift-positive">
                                &gt; 1
                            </span>

                            <span class="lift-color lift-neutral">
                                = 1
                            </span>

                            <span class="lift-color lift-negative">
                                &lt; 1
                            </span>

                        </div>

                        <!-- TABEL HASIL ANALISIS -->
                        <div class="apriori-table-wrapper">

                            <table class="apriori-table apriori-rules-table">

                                <thead>
                                    <tr>
                                        <th scope="col">No.</th>
                                        <th scope="col">Aturan Asosiasi</th>
                                        <th scope="col">Jenis Itemset</th>
                                        <th scope="col">Support</th>
                                        <th scope="col">Confidence</th>
                                        <th scope="col">Lift</th>
                                        <th scope="col">Detail</th>
                                    </tr>
                                </thead>

                                <tbody id="apriori-rules-body">

                                    <tr>
                                        <td colspan="7"
                                            class="transaction-empty-state">
                                            Jalankan analisis untuk menampilkan hasil.
                                        </td>
                                    </tr>

                                </tbody>

                            </table>

                        </div>

                        <!-- PAGINATION -->
                        <div class="apriori-pagination"
                             id="apriori-pagination"></div>

                        <!-- INFORMASI PAGINATION -->
                        <div class="apriori-pagination-info">

                            <span id="apriori-pagination-info">
                                Belum ada hasil analisis.
                            </span>

                        </div>

                    </section>

                </main>

            </div>

        </div>

    </div>

    <!-- POPUP ARTHA -->
    <script src="../assets/js/shared/popup.js" defer></script>
    <script src="../assets/js/pemilik/apriori.js" defer></script>

    <!-- NAVIGASI DAN LOGOUT -->
    <script src="../assets/js/navigation.js" defer></script>

</body>
</html>