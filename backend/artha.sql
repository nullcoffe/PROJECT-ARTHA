-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 16, 2026 at 07:05 AM
-- Server version: 10.11.16-MariaDB
-- PHP Version: 8.5.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- Database: `artha`
-- --------------------------------------------------------
-- Table structure for table `analisis_apriori`

CREATE TABLE `analisis_apriori` (
  `id_analisis_apriori` int(10) UNSIGNED NOT NULL,
  `id_pengguna` int(10) UNSIGNED NOT NULL,
  `tanggal_analisis` datetime NOT NULL,
  `tahun_data` year(4) NOT NULL,
  `minimum_support` decimal(7,4) NOT NULL,
  `minimum_confidence` decimal(7,4) NOT NULL,
  `jumlah_transaksi` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `aturan_asosiasi`
--

CREATE TABLE `aturan_asosiasi` (
  `id_aturan_asosiasi` int(10) UNSIGNED NOT NULL,
  `id_analisis_apriori` int(10) UNSIGNED NOT NULL,
  `nilai_support` decimal(9,4) NOT NULL,
  `nilai_confidence` decimal(9,4) NOT NULL,
  `nilai_lift` decimal(12,4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `detail_aturan_asosiasi`
--

CREATE TABLE `detail_aturan_asosiasi` (
  `id_detail_aturan_asosiasi` int(10) UNSIGNED NOT NULL,
  `id_aturan_asosiasi` int(10) UNSIGNED NOT NULL,
  `id_produk` int(10) UNSIGNED NOT NULL,
  `peran_produk` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `detail_transaksi`
--

CREATE TABLE `detail_transaksi` (
  `id_detail_transaksi` int(10) UNSIGNED NOT NULL,
  `id_transaksi` int(10) UNSIGNED NOT NULL,
  `id_produk` int(10) UNSIGNED NOT NULL,
  `jumlah` decimal(15,2) NOT NULL,
  `harga_satuan` decimal(15,2) NOT NULL,
  `subtotal` decimal(15,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pengguna`
--

CREATE TABLE `pengguna` (
  `id_pengguna` int(10) UNSIGNED NOT NULL,
  `nama_lengkap` varchar(150) NOT NULL,
  `nama_pengguna` varchar(60) NOT NULL,
  `kata_sandi_hash` varchar(255) NOT NULL,
  `peran` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `produk`
--

CREATE TABLE `produk` (
  `id_produk` int(10) UNSIGNED NOT NULL,
  `kode_produk` varchar(50) NOT NULL,
  `nama_produk` varchar(150) NOT NULL,
  `satuan` varchar(40) NOT NULL,
  `harga` decimal(15,2) NOT NULL,
  `stok` decimal(15,2) NOT NULL,
  `stok_minimum` decimal(15,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `riwayat_stok`
--

CREATE TABLE `riwayat_stok` (
  `id_riwayat_stok` int(10) UNSIGNED NOT NULL,
  `id_produk` int(10) UNSIGNED NOT NULL,
  `id_pengguna` int(10) UNSIGNED NOT NULL,
  `id_transaksi` int(10) UNSIGNED DEFAULT NULL,
  `tanggal_perubahan` datetime NOT NULL,
  `stok_sebelum` decimal(15,2) NOT NULL,
  `stok_sesudah` decimal(15,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `transaksi`
--

CREATE TABLE `transaksi` (
  `id_transaksi` int(10) UNSIGNED NOT NULL,
  `id_pengguna` int(10) UNSIGNED NOT NULL,
  `nomor_transaksi` varchar(60) NOT NULL,
  `tanggal_transaksi` datetime NOT NULL,
  `total_bayar` decimal(15,2) NOT NULL,
  `uang_diterima` decimal(15,2) DEFAULT NULL,
  `uang_kembalian` decimal(15,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `analisis_apriori`
--
ALTER TABLE `analisis_apriori`
  ADD PRIMARY KEY (`id_analisis_apriori`),
  ADD KEY `fk_analisis_apriori_pengguna` (`id_pengguna`);

--
-- Indexes for table `aturan_asosiasi`
--
ALTER TABLE `aturan_asosiasi`
  ADD PRIMARY KEY (`id_aturan_asosiasi`),
  ADD KEY `fk_aturan_asosiasi_analisis` (`id_analisis_apriori`);

--
-- Indexes for table `detail_aturan_asosiasi`
--
ALTER TABLE `detail_aturan_asosiasi`
  ADD PRIMARY KEY (`id_detail_aturan_asosiasi`),
  ADD UNIQUE KEY `uq_aturan_produk` (`id_aturan_asosiasi`,`id_produk`),
  ADD KEY `fk_detail_aturan_produk` (`id_produk`);

--
-- Indexes for table `detail_transaksi`
--
ALTER TABLE `detail_transaksi`
  ADD PRIMARY KEY (`id_detail_transaksi`),
  ADD KEY `fk_detail_transaksi_transaksi` (`id_transaksi`),
  ADD KEY `fk_detail_transaksi_produk` (`id_produk`);

--
-- Indexes for table `pengguna`
--
ALTER TABLE `pengguna`
  ADD PRIMARY KEY (`id_pengguna`),
  ADD UNIQUE KEY `nama_pengguna` (`nama_pengguna`);

--
-- Indexes for table `produk`
--
ALTER TABLE `produk`
  ADD PRIMARY KEY (`id_produk`),
  ADD UNIQUE KEY `kode_produk` (`kode_produk`);

--
-- Indexes for table `riwayat_stok`
--
ALTER TABLE `riwayat_stok`
  ADD PRIMARY KEY (`id_riwayat_stok`),
  ADD KEY `fk_riwayat_stok_produk` (`id_produk`),
  ADD KEY `fk_riwayat_stok_pengguna` (`id_pengguna`),
  ADD KEY `fk_riwayat_stok_transaksi` (`id_transaksi`);

--
-- Indexes for table `transaksi`
--
ALTER TABLE `transaksi`
  ADD PRIMARY KEY (`id_transaksi`),
  ADD UNIQUE KEY `nomor_transaksi` (`nomor_transaksi`),
  ADD KEY `fk_transaksi_pengguna` (`id_pengguna`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `analisis_apriori`
--
ALTER TABLE `analisis_apriori`
  MODIFY `id_analisis_apriori` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `aturan_asosiasi`
--
ALTER TABLE `aturan_asosiasi`
  MODIFY `id_aturan_asosiasi` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `detail_aturan_asosiasi`
--
ALTER TABLE `detail_aturan_asosiasi`
  MODIFY `id_detail_aturan_asosiasi` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `detail_transaksi`
--
ALTER TABLE `detail_transaksi`
  MODIFY `id_detail_transaksi` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `pengguna`
--
ALTER TABLE `pengguna`
  MODIFY `id_pengguna` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `produk`
--
ALTER TABLE `produk`
  MODIFY `id_produk` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `riwayat_stok`
--
ALTER TABLE `riwayat_stok`
  MODIFY `id_riwayat_stok` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `transaksi`
--
ALTER TABLE `transaksi`
  MODIFY `id_transaksi` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `analisis_apriori`
--
ALTER TABLE `analisis_apriori`
  ADD CONSTRAINT `fk_analisis_apriori_pengguna` FOREIGN KEY (`id_pengguna`) REFERENCES `pengguna` (`id_pengguna`) ON UPDATE CASCADE;

--
-- Constraints for table `aturan_asosiasi`
--
ALTER TABLE `aturan_asosiasi`
  ADD CONSTRAINT `fk_aturan_asosiasi_analisis` FOREIGN KEY (`id_analisis_apriori`) REFERENCES `analisis_apriori` (`id_analisis_apriori`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `detail_aturan_asosiasi`
--
ALTER TABLE `detail_aturan_asosiasi`
  ADD CONSTRAINT `fk_detail_aturan_aturan` FOREIGN KEY (`id_aturan_asosiasi`) REFERENCES `aturan_asosiasi` (`id_aturan_asosiasi`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_detail_aturan_produk` FOREIGN KEY (`id_produk`) REFERENCES `produk` (`id_produk`) ON UPDATE CASCADE;

--
-- Constraints for table `detail_transaksi`
--
ALTER TABLE `detail_transaksi`
  ADD CONSTRAINT `fk_detail_transaksi_produk` FOREIGN KEY (`id_produk`) REFERENCES `produk` (`id_produk`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_detail_transaksi_transaksi` FOREIGN KEY (`id_transaksi`) REFERENCES `transaksi` (`id_transaksi`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `riwayat_stok`
--
ALTER TABLE `riwayat_stok`
  ADD CONSTRAINT `fk_riwayat_stok_pengguna` FOREIGN KEY (`id_pengguna`) REFERENCES `pengguna` (`id_pengguna`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_riwayat_stok_produk` FOREIGN KEY (`id_produk`) REFERENCES `produk` (`id_produk`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_riwayat_stok_transaksi` FOREIGN KEY (`id_transaksi`) REFERENCES `transaksi` (`id_transaksi`) ON UPDATE CASCADE;

--
-- Constraints for table `transaksi`
--
ALTER TABLE `transaksi`
  ADD CONSTRAINT `fk_transaksi_pengguna` FOREIGN KEY (`id_pengguna`) REFERENCES `pengguna` (`id_pengguna`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
