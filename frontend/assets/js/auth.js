
document.addEventListener("DOMContentLoaded", function () {

    // 1. Mengambil elemen HTML
    const loginForm = document.querySelector(".login-form");

    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");

    const togglePassword = document.querySelector(
        ".login-password-toggle"
    );

    const roleControl = document.getElementById("role-control");
    const rolePicker = document.querySelector(".role-picker");

    const roleOptions = document.querySelectorAll(
        'input[name="jenis_pengguna"]'
    );

    const roleCurrentLabel = document.getElementById(
        "role-current-label"
    );

    // 2. Memvalidasi elemen login
    if (
        !loginForm ||
        !usernameInput ||
        !passwordInput ||
        !roleControl ||
        !rolePicker ||
        !roleCurrentLabel
    ) {
        console.error("Elemen login tidak lengkap.");
        return;
    }

    // 3. Menyimpan placeholder asli
    const originalUsernamePlaceholder =
        usernameInput.placeholder;

    const originalPasswordPlaceholder =
        passwordInput.placeholder;

    // 4. Mengambil role yang dipilih
    function getSelectedRole() {
        return document.querySelector(
            'input[name="jenis_pengguna"]:checked'
        );
    }

    // 5. Menampilkan error input
    function showInputError(input, message) {

        const wrapper = input.closest(".login-input-wrap");

        if (!wrapper) return;

        wrapper.classList.add("is-invalid");

        input.placeholder = message;

        input.setAttribute("aria-invalid", "true");
    }

    // 6. Menghapus error input
    function clearInputError(input, originalPlaceholder) {

        const wrapper = input.closest(".login-input-wrap");

        if (!wrapper) return;

        wrapper.classList.remove("is-invalid");

        input.placeholder = originalPlaceholder;

        input.removeAttribute("aria-invalid");
    }

    // 7. Menampilkan error pemilihan role
    function showRoleError(message) {

        roleControl.classList.add("is-invalid");

        roleCurrentLabel.textContent = message;

        roleControl.setAttribute("aria-invalid", "true");
    }

    // 8. Menghapus error pemilihan role
    function clearRoleError() {

        roleControl.classList.remove("is-invalid");

        roleControl.removeAttribute("aria-invalid");

        const selectedRole = getSelectedRole();

        if (selectedRole) {

            const selectedOption =
                selectedRole.closest(".role-option");

            const selectedLabel =
                selectedOption?.querySelector("span");

            if (selectedLabel) {
                roleCurrentLabel.textContent =
                    selectedLabel.textContent.trim();
            }
        }
    }

    // 9. Memvalidasi username
    function validateUsername() {

        const username = usernameInput.value.trim();

        if (!username) {

            showInputError(
                usernameInput,
                "Username wajib diisi."
            );

            return false;
        }

        clearInputError(
            usernameInput,
            originalUsernamePlaceholder
        );

        return true;
    }

    // 10. Memvalidasi password
    function validatePassword() {

        const password = passwordInput.value;

        if (!password.trim()) {

            showInputError(
                passwordInput,
                "Kata sandi wajib diisi."
            );

            return false;
        }

        clearInputError(
            passwordInput,
            originalPasswordPlaceholder
        );

        return true;
    }

    // 11. Memvalidasi pemilihan role
    function validateRole() {

        const selectedRole = getSelectedRole();

        if (!selectedRole) {

            showRoleError(
                "Silakan pilih jenis pengguna."
            );

            return false;
        }

        clearRoleError();

        return true;
    }

    // 12. Menampilkan dan menyembunyikan password
    if (togglePassword) {

        togglePassword.type = "button";

        togglePassword.addEventListener("click", function () {

            const isVisible =
                passwordInput.type === "text";

            passwordInput.type = isVisible
                ? "password"
                : "text";

            this.setAttribute(
                "aria-pressed",
                String(!isVisible)
            );

            this.setAttribute(
                "aria-label",
                isVisible
                    ? "Tampilkan kata sandi"
                    : "Sembunyikan kata sandi"
            );
        });
    }

    // 13. Memvalidasi perubahan username
    usernameInput.addEventListener("input", function () {

        if (this.value.trim() !== "") {

            clearInputError(
                usernameInput,
                originalUsernamePlaceholder
            );
        }
    });

    // 14. Memvalidasi perubahan password
    passwordInput.addEventListener("input", function () {

        if (this.value.trim() !== "") {

            clearInputError(
                passwordInput,
                originalPasswordPlaceholder
            );
        }
    });

    // 15. Memproses pemilihan role
    roleOptions.forEach(function (option) {

        option.addEventListener("change", function () {

            if (!this.checked) return;

            const selectedOption =
                this.closest(".role-option");

            const selectedLabel =
                selectedOption?.querySelector("span");

            if (selectedLabel) {

                roleCurrentLabel.textContent =
                    selectedLabel.textContent.trim();
            }

            rolePicker.open = false;

            clearRoleError();

            console.log("Role dipilih:", this.value);
        });
    });

    // 16. Memvalidasi form login
    loginForm.noValidate = true;

    loginForm.addEventListener("submit", function (event) {

        event.preventDefault();

        // Memvalidasi seluruh input
        const usernameValid = validateUsername();

        const passwordValid = validatePassword();

        const roleValid = validateRole();

        // Memfokuskan input pertama yang tidak valid
        if (!usernameValid) {

            usernameInput.focus();

            return;
        }

        if (!passwordValid) {

            passwordInput.focus();

            return;
        }

        if (!roleValid) {

            roleControl.focus();

            return;
        }

        // 17. Mengambil role yang dipilih
        const selectedRole = getSelectedRole();

        const role = selectedRole.value;

        // 18. Menentukan halaman dashboard berdasarkan role
        const dashboardRoutes = {

            admin: "admin/dashboard.php",

            pemilik: "pemilik/dashboard.php",

            kasir: "kasir/dashboard.php"

        };

        const destination = dashboardRoutes[role];

        if (!destination) {

            showRoleError(
                "Jenis pengguna tidak dikenali."
            );

            roleControl.focus();

            return;
        }

        // 19. Menampilkan informasi pengujian
        console.log("Login ARTHA");
        console.log("Role:", role);
        console.log("Tujuan:", destination);

        // 20. Mengarahkan pengguna ke dashboard
        window.location.assign(
            new URL(destination, document.baseURI).href
        );

    });

    console.log("Auth ARTHA berhasil dimuat.");

});