<!-- Popup KHUSUS Admin/Transaksi; buka: href="#popup-select-month". Pilihan bulan demo CSS-only; filter tabel menunggu backend. -->
<div class="artha-popup-overlay" id="popup-select-month" role="presentation">
  <section class="artha-popup artha-popup--month" role="dialog" aria-modal="true" aria-labelledby="month-popup-title">
    <div class="month-popup-header">
      <h2 id="month-popup-title"><img src="../assets/icons/popup/calendar-select.svg" alt="">Pilih Bulan</h2>
      <a href="#" class="month-popup-close" aria-label="Tutup popup">&times;</a>
    </div>
    <div class="month-popup-options" role="group" aria-label="Bulan transaksi">
      <label class="month-popup-option month-popup-all"><input type="radio" name="popup-selected-month" value="all" checked><span>✓&nbsp; Semua Bulan</span></label>
      <div class="month-popup-grid">
        <label class="month-popup-option"><input type="radio" name="popup-selected-month" value="01"><span>Januari</span></label>
        <label class="month-popup-option"><input type="radio" name="popup-selected-month" value="02"><span>Februari</span></label>
        <label class="month-popup-option"><input type="radio" name="popup-selected-month" value="03"><span>Maret</span></label>
        <label class="month-popup-option"><input type="radio" name="popup-selected-month" value="04"><span>April</span></label>
        <label class="month-popup-option"><input type="radio" name="popup-selected-month" value="05"><span>Mei</span></label>
        <label class="month-popup-option"><input type="radio" name="popup-selected-month" value="06"><span>Juni</span></label>
        <label class="month-popup-option"><input type="radio" name="popup-selected-month" value="07"><span>Juli</span></label>
        <label class="month-popup-option"><input type="radio" name="popup-selected-month" value="08"><span>Agustus</span></label>
        <label class="month-popup-option"><input type="radio" name="popup-selected-month" value="09"><span>September</span></label>
        <label class="month-popup-option"><input type="radio" name="popup-selected-month" value="10"><span>Oktober</span></label>
        <label class="month-popup-option"><input type="radio" name="popup-selected-month" value="11"><span>November</span></label>
        <label class="month-popup-option"><input type="radio" name="popup-selected-month" value="12"><span>Desember</span></label>
      </div>
    </div>
    <div class="month-popup-footer">
      <a href="#" class="artha-popup-btn artha-popup-btn--text">Batal</a>
      <!-- Terapkan menutup preview; filter aktual menunggu integrasi backend. -->
      <a href="#" class="artha-popup-btn artha-popup-btn--dark">Terapkan</a>
    </div>
  </section>
</div>
