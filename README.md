ARTHA – Sistem Manajemen Penjualan Toko

1. Deskripsi Proyek

ARTHA merupakan sistem manajemen penjualan yang dikembangkan untuk membantu pengelolaan operasional toko sembako secara terintegrasi. Sistem ini menyediakan fasilitas pengelolaan pengguna, produk, stok, transaksi penjualan, serta laporan penjualan.

Selain itu, ARTHA menerapkan algoritma Apriori untuk menganalisis pola pembelian produk berdasarkan data transaksi. Hasil analisis digunakan untuk menghasilkan rekomendasi paket promosi dan membantu pemilik dalam menentukan prioritas pengadaan stok.

ARTHA memiliki dua antarmuka, yaitu Web dan Mobile, yang terhubung dengan satu backend dan satu database.

2. Tujuan Pengembangan

1. Mempermudah pengelolaan data operasional toko.
2. Membantu proses pencatatan transaksi penjualan.
3. Mempermudah pemantauan stok produk.
4. Menyediakan laporan penjualan sebagai bahan evaluasi usaha.
5. Menerapkan algoritma Apriori untuk menemukan pola pembelian produk.
6. Menghasilkan rekomendasi paket promosi dan prioritas stok berdasarkan data transaksi.

3. Role dan Hak Akses

ARTHA memiliki tiga role pengguna:

Role| Hak Akses
Pemilik| Melihat dashboard, laporan penjualan, menjalankan analisis Apriori, melihat rekomendasi paket promosi, dan rekomendasi prioritas stok.
Admin| Mengelola pengguna, data produk, dan stok barang.
Kasir| Melakukan transaksi penjualan, memproses pembayaran, mencetak struk, dan mengecek stok produk.

Setiap role memiliki hak akses sesuai dengan tanggung jawabnya dalam sistem.

4. Fitur Utama

A. Manajemen Pengguna

Mengelola akun pengguna dan hak akses berdasarkan tiga role yang tersedia.

B. Manajemen Produk dan Stok

Mengelola informasi produk serta memantau jumlah persediaan barang.

C. Transaksi Penjualan

Mencatat transaksi penjualan, mengelola detail produk yang dibeli, memproses pembayaran, dan mencetak struk transaksi.

D. Laporan Penjualan

Menyediakan informasi penjualan berdasarkan data transaksi yang tersimpan dalam sistem.

E. Analisis Apriori

Menganalisis pola pembelian produk berdasarkan data transaksi yang telah tersedia.

Pemilik dapat menentukan:

- Tahun transaksi yang akan dianalisis.
- Minimum support.
- Minimum confidence.

Sistem kemudian menghasilkan:

- Frequent itemsets.
- Association rules.
- Nilai support.
- Nilai confidence.
- Nilai lift.

F. Rekomendasi Paket Promosi

Menampilkan rekomendasi kombinasi produk berdasarkan association rules yang dihasilkan oleh algoritma Apriori. Rekomendasi ini digunakan sebagai bahan pertimbangan pemilik dalam menyusun strategi promosi.

G. Rekomendasi Prioritas Stok

Menyajikan informasi prioritas pengadaan atau penambahan stok berdasarkan informasi penjualan, pola pembelian, stok tersedia, dan stok minimum.

5. Metode yang Digunakan

ARTHA menggunakan algoritma Apriori, yaitu salah satu algoritma data mining yang digunakan untuk menemukan hubungan atau pola keterkaitan antarproduk dalam kumpulan transaksi.

Beberapa ukuran yang digunakan dalam analisis:

- Support: Mengukur frekuensi kemunculan kombinasi produk dalam seluruh transaksi.
- Confidence: Mengukur tingkat kepercayaan hubungan antara produk yang menjadi antecedent dan consequent.
- Lift: Mengukur kekuatan hubungan antarproduk dibandingkan dengan kemunculan consequent secara umum.

Hasil analisis digunakan untuk memberikan rekomendasi paket promosi berdasarkan pola pembelian produk.

6. Dataset

ARTHA menggunakan dataset transaksi dan data pendukung persediaan produk yang telah disediakan untuk kebutuhan pengembangan dan pengujian sistem.

Dataset transaksi mencakup informasi seperti:

- ID transaksi.
- Nomor transaksi.
- Tanggal transaksi.
- Daftar produk dalam transaksi.
- Identitas pelanggan apabila tersedia dalam data transaksi.

Data pendukung produk dan persediaan mencakup:

- Nama produk.
- Kategori produk.
- Satuan produk.
- Harga produk.
- Jumlah stok.
- Stok minimum.

Data transaksi digunakan sebagai sumber utama dalam proses analisis Apriori. Pemilik tidak perlu mengunggah dataset secara manual karena sistem mengambil data berdasarkan tahun yang dipilih.

7. Teknologi yang Digunakan

Bagian| Teknologi
Backend| PHP Native
API| REST API
Database| MySQL
Frontend Web| HTML, CSS, JavaScript
Frontend Mobile| HTML, CSS, JavaScript
Lingkungan Pengembangan| Laragon
Editor Kode| Visual Studio Code
Pengujian API| Postman

8. Arsitektur Sistem

ARTHA menggunakan satu backend dan satu database yang digunakan bersama oleh dua antarmuka pengguna.

- Web: Antarmuka sistem yang digunakan melalui browser pada perangkat komputer atau laptop.
- Mobile: Antarmuka sistem yang dioptimalkan untuk perangkat mobile.
- Backend: Menangani autentikasi, proses bisnis, pengolahan data, dan perhitungan algoritma Apriori.
- Database: Menyimpan data pengguna, produk, stok, dan transaksi.

Web dan Mobile berkomunikasi dengan backend melalui REST API. Dengan demikian, kedua antarmuka menggunakan sumber data dan proses bisnis yang sama.

9. Struktur Proyek

artha/
├── backend/
│   └── api/
│       ├── config/
│       ├── controllers/
│       ├── helpers/
│       ├── middleware/
│       ├── models/
│       ├── services/
│       └── index.php
├── frontend/
│   ├── web/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── admin/
│   │   ├── pemilik/
│   │   ├── kasir/
│   │   └── index.html
│   └── mobile/
│       ├── assets/
│       ├── components/
│       ├── admin/
│       ├── pemilik/
│       ├── kasir/
│       └── index.html
├── database/
│   └── artha.sql
└── README.md

10. Instalasi dan Menjalankan Proyek

1. Pastikan Laragon, PHP, dan MySQL telah terpasang.
2. Salin folder proyek ARTHA ke direktori web server Laragon.
3. Jalankan Apache dan MySQL melalui Laragon.
4. Buat database MySQL sesuai konfigurasi proyek.
5. Impor file database "penjualan.sql" apabila file tersebut sudah tersedia.
6. Sesuaikan konfigurasi koneksi database pada "backend/api/config/database.php".
7. Jalankan backend melalui alamat lokal Laragon.
8. Buka antarmuka Web atau Mobile melalui browser.
9. Pastikan konfigurasi URL API pada masing-masing frontend mengarah ke backend yang benar.

11. Batasan Sistem

1. Sistem memiliki tiga role, yaitu Pemilik, Admin, dan Kasir.
2. Sistem menyediakan dua antarmuka, yaitu Web dan Mobile.
3. Kedua antarmuka menggunakan satu backend dan satu database.
4. Analisis Apriori menggunakan dataset transaksi yang telah disediakan.
5. Parameter minimum support dan minimum confidence ditentukan oleh pemilik saat menjalankan analisis.
6. Rekomendasi paket promosi merupakan hasil analisis pola pembelian dan tidak secara otomatis mengubah harga produk.
7. Rekomendasi prioritas stok digunakan sebagai bahan pertimbangan pengelolaan persediaan.

12. Pengembang

Nama Proyek: ARTHA – Sistem Manajemen Penjualan Toko

Bidang: Informatika

Tujuan: Pengembangan sistem manajemen penjualan dengan penerapan algoritma data mining menggunakan Apriori.