
document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    // ==========================================
    // ELEMEN POPUP PROFIL
    // ==========================================

    const popupToggle = document.getElementById("profile-popup-toggle");

    const fullNameElement = document.getElementById("profile-full-name");
    const usernameElement = document.getElementById("profile-username");
    const roleElement = document.getElementById("profile-role");

    // ==========================================
    // ELEMEN UBAH PASSWORD
    // ==========================================

    const passwordInput = document.getElementById("new-password");
    const toggleButton = document.getElementById("toggle-password");
    const eyeIcon = document.getElementById("password-eye-icon");
    const passwordExpand = document.getElementById("password-expand");
    const passwordForm = document.querySelector(".profile-password-form");
    const passwordFeedback = document.getElementById("password-feedback");

    // ==========================================
    // MENGAMBIL DATA PROFIL PENGGUNA
    // ==========================================

    async function loadProfile() {
        if (!fullNameElement || !usernameElement || !roleElement) {
            return;
        }

        if (
            !window.ARTHA_API ||
            typeof window.ARTHA_API.get !== "function"
        ) {
            fullNameElement.textContent = "Data pengguna tidak tersedia";
            usernameElement.textContent = "-";
            roleElement.textContent = "-";
            return;
        }

        try {
            const response = await window.ARTHA_API.get("me");

            const user = response.data || {};

            // Menampilkan nama lengkap
            fullNameElement.textContent =
                user.nama_lengkap || "Nama tidak tersedia";

            // Menampilkan username
            usernameElement.textContent =
                user.nama_pengguna || "Username tidak tersedia";

            // Menyesuaikan tampilan role
            const roleLabels = {
                admin: "Admin",
                kasir: "Kasir",
                pemilik: "Pemilik"
            };

            const normalizedRole = String(user.peran || "").toLowerCase();

            roleElement.textContent =
                roleLabels[normalizedRole] || user.peran || "-";

        } catch (error) {
            console.error("Gagal mengambil profil pengguna:", error);

            fullNameElement.textContent = "Gagal memuat nama pengguna";
            usernameElement.textContent = "-";
            roleElement.textContent = "-";
        }
    }

    // Memuat profil ketika halaman dibuka
    loadProfile();

    // ==========================================
    // JIKA FORM PASSWORD TIDAK TERSEDIA
    // ==========================================

    if (!passwordInput || !passwordForm) {
        return;
    }

    // ==========================================
    // PESAN UMPAN BALIK
    // ==========================================

    function showFeedback(message, type) {
        if (!passwordFeedback) {
            alert(message);
            return;
        }

        passwordFeedback.textContent = message;
        passwordFeedback.className = "password-feedback " + type;
    }

    // ==========================================
    // IKON LIHAT PASSWORD
    // ==========================================

    const eyeVisible = `
        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"/>
        <circle cx="12" cy="12" r="3"/>
    `;

    const eyeHidden = `
        <path d="M3 3l18 18"/>
        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"/>
        <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a15.8 15.8 0 0 1-3.1 3.8"/>
        <path d="M6.2 6.2C3.5 8 2 12 2 12s3.6 7 10 7c1.2 0 2.3-.2 3.3-.6"/>
    `;

    function updatePasswordVisibility(visible) {
        passwordInput.type = visible ? "text" : "password";

        if (toggleButton) {
            toggleButton.setAttribute(
                "aria-pressed",
                String(visible)
            );

            toggleButton.setAttribute(
                "aria-label",
                visible ? "Sembunyikan password" : "Lihat password"
            );
        }

        if (eyeIcon) {
            eyeIcon.innerHTML = visible ? eyeVisible : eyeHidden;
        }
    }

    // ==========================================
    // EVENT TOMBOL LIHAT PASSWORD
    // ==========================================

    if (toggleButton && eyeIcon) {
        toggleButton.addEventListener("click", function () {
            updatePasswordVisibility(
                passwordInput.type !== "text"
            );
        });
    }

    // ==========================================
    // VALIDASI FORM PASSWORD
    // ==========================================

    passwordForm.noValidate = true;

    passwordForm.addEventListener("submit", function (event) {
        event.preventDefault();

        if (passwordInput.value.trim() === "") {
            showFeedback(
                "Password baru wajib diisi.",
                "error"
            );

            passwordInput.focus();
            return;
        }

        showFeedback(
            "Validasi password berhasil. Fitur penyimpanan password belum diaktifkan.",
            "info"
        );
    });

    // ==========================================
    // MEMBERSIHKAN PESAN VALIDASI
    // ==========================================

    passwordInput.addEventListener("input", function () {
        if (passwordFeedback) {
            passwordFeedback.textContent = "";
            passwordFeedback.className = "password-feedback";
        }
    });

    // ==========================================
    // RESET FORM SAAT POPUP DITUTUP
    // ==========================================

    if (popupToggle) {
        popupToggle.addEventListener("change", function () {
            if (!this.checked) {
                passwordInput.value = "";

                updatePasswordVisibility(false);

                if (passwordExpand) {
                    passwordExpand.checked = false;
                }

                if (passwordFeedback) {
                    passwordFeedback.textContent = "";
                    passwordFeedback.className = "password-feedback";
                }
            }
        });
    }

    updatePasswordVisibility(false);

    console.log("Profile.js berhasil dimuat.");
});
