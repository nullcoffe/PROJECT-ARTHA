document.addEventListener("DOMContentLoaded", function () {

    // 1. MENGAMBIL ELEMEN HTML
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

    // 2. VALIDASI ELEMEN
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

    // 3. PLACEHOLDER ASLI
    const originalUsernamePlaceholder =
        usernameInput.placeholder;

    const originalPasswordPlaceholder =
        passwordInput.placeholder;

    // 4. MENGAMBIL ROLE TERPILIH
    function getSelectedRole() {
        return document.querySelector(
            'input[name="jenis_pengguna"]:checked'
        );
    }

    // 5. ERROR INPUT
    function showInputError(input, message) {

        const wrapper = input.closest(".login-input-wrap");

        if (!wrapper) return;

        wrapper.classList.add("is-invalid");

        input.placeholder = message;

        input.setAttribute("aria-invalid", "true");
    }

    // 6. CLEAR ERROR INPUT
    function clearInputError(input, originalPlaceholder) {

        const wrapper = input.closest(".login-input-wrap");

        if (!wrapper) return;

        wrapper.classList.remove("is-invalid");

        input.placeholder = originalPlaceholder;

        input.removeAttribute("aria-invalid");
    }

    // 7. ERROR ROLE
    function showRoleError(message) {

        roleControl.classList.add("is-invalid");

        roleCurrentLabel.textContent = message;

        roleControl.setAttribute("aria-invalid", "true");
    }

    // 8. CLEAR ERROR ROLE
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

    // 9. VALIDASI USERNAME
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

    // 10. VALIDASI PASSWORD
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

    // 11. VALIDASI ROLE
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

    // 12. PASSWORD TOGGLE
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

    // 13. EVENT USERNAME
    usernameInput.addEventListener("input", function () {

        if (this.value.trim() !== "") {

            clearInputError(
                usernameInput,
                originalUsernamePlaceholder
            );

        }

    });

    // 14. EVENT PASSWORD
    passwordInput.addEventListener("input", function () {

        if (this.value.trim() !== "") {

            clearInputError(
                passwordInput,
                originalPasswordPlaceholder
            );

        }

    });

    // 15. EVENT PILIH ROLE
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

    // 16. VALIDASI FORM LOGIN
    loginForm.noValidate = true;

    loginForm.addEventListener("submit", function (event) {

        event.preventDefault();

        // Validasi seluruh field secara bersamaan

        const usernameValid = validateUsername();

        const passwordValid = validatePassword();

        const roleValid = validateRole();

        // Fokus pada field pertama yang tidak valid

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

        // 17. NAVIGASI BERDASARKAN ROLE
        const selectedRole = getSelectedRole();

        const role = selectedRole.value;

        const dashboardRoutes = {

            admin: "admin/dashboard.html",

            pemilik: "pemilik/dashboard.html",

            kasir: "kasir/dashboard.html"

        };

        const destination = dashboardRoutes[role];

        if (!destination) {

            showRoleError(
                "Jenis pengguna tidak dikenali."
            );

            roleControl.focus();

            return;
        }

        // 18. INFORMASI PENGUJIAN
        console.log("Login ARTHA");
        console.log("Role:", role);
        console.log("Tujuan:", destination);

        // 19. NAVIGASI DASHBOARD
        window.location.assign(
            new URL(destination, document.baseURI).href
        );

    });

    console.log("Auth ARTHA berhasil dimuat.");

});