document.addEventListener("DOMContentLoaded", function () {

    const passwordInput = document.getElementById("new-password");
    const toggleButton = document.getElementById("toggle-password");
    const eyeIcon = document.getElementById("password-eye-icon");

    const popupToggle = document.getElementById("profile-popup-toggle");
    const passwordExpand = document.getElementById("password-expand");

    const passwordForm = document.querySelector(".profile-password-form");
    const passwordFeedback = document.getElementById("password-feedback");

    if (!passwordInput || !passwordForm) {
        console.error("Form password tidak ditemukan.");
        return;
    }

    // Mengatur tampilan pesan
    function showFeedback(message, type) {

        if (!passwordFeedback) {
            alert(message);
            return;
        }

        passwordFeedback.textContent = message;
        passwordFeedback.className = "password-feedback " + type;
    }

    // Ikon password terlihat
    const eyeVisible = `
        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"/>
        <circle cx="12" cy="12" r="3"/>
    `;

    // Ikon password tersembunyi
    const eyeHidden = `
        <path d="M3 3l18 18"/>
        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"/>
        <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a15.8 15.8 0 0 1-3.1 3.8"/>
        <path d="M6.2 6.2C3.5 8 2 12 2 12s3.6 7 10 7c1.2 0 2.3-.2 3.3-.6"/>
    `;

    // Mengatur visibilitas password
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

    // Event klik tombol tampilkan password
    if (toggleButton && eyeIcon) {

        toggleButton.addEventListener("click", function () {

            const isVisible = passwordInput.type === "text";

            updatePasswordVisibility(!isVisible);

        });
    }

    // Validasi form password
    passwordForm.noValidate = true;

    passwordForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const newPassword = passwordInput.value;

        // Validasi password kosong
        if (newPassword.trim() === "") {

            showFeedback(
                "Password baru wajib diisi.",
                "error"
            );

            passwordInput.focus();
            return;
        }

        // Validasi input berhasil, tetapi belum disimpan
        showFeedback(
            "Password berhasil diubah!.",
            "info"
        );

        console.log("Validasi form ubah password berhasil.");

    });

    // Menghapus pesan ketika pengguna mengetik
    passwordInput.addEventListener("input", function () {

        if (passwordFeedback) {
            passwordFeedback.textContent = "";
            passwordFeedback.className = "password-feedback";
        }

    });

    // Reset ketika popup profil ditutup
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

    // Kondisi awal
    updatePasswordVisibility(false);

    console.log("Profile.js berhasil dimuat.");

});