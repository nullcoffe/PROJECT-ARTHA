
<!-- ==========================================
     POPUP PROFIL ARTHA
========================================== -->

<input type="checkbox" id="profile-popup-toggle"
       class="profile-popup-toggle">

<div class="profile-popup-overlay">

    <label for="profile-popup-toggle"
           class="profile-popup-backdrop"></label>

    <section class="profile-popup">

        <div class="profile-popup-header">
            <h2>Profil Pengguna</h2>
            <label for="profile-popup-toggle"
                   class="profile-popup-close"
                   aria-label="Tutup popup">&times;</label>
        </div>

        <!-- INFORMASI PENGGUNA -->
        <div class="profile-user-info">

            <div class="profile-avatar">
                <img src="../assets/icons/header/profile.svg"
                     alt="Foto profil">
            </div>

            <div class="profile-user-detail">
                <strong>Nama Pengguna</strong>
                <span>username</span>
                <small class="profile-role">Pemilik</small>
            </div>

        </div>

        <div class="profile-divider"></div>

        <!-- TOGGLE UBAH PASSWORD -->
        <input type="checkbox"
               id="password-expand"
               class="password-expand-toggle">

        <label for="password-expand"
               class="password-expand-label">

            <span>Ubah Password</span>
            <span class="password-chevron"></span>

        </label>

        <!-- FORM PASSWORD -->
        <div class="password-expand-content">

            <form class="profile-password-form">

                <label for="new-password">
                    Password Baru
                </label>

                <input type="password"
                       id="new-password"
                       name="new_password"
                       placeholder="Masukkan password baru"
                       required>

                <button type="submit"
                        class="profile-save-button">
                    Simpan
                </button>

            </form>

        </div>

    </section>

</div>
