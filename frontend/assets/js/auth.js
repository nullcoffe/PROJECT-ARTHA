document.addEventListener(
    "DOMContentLoaded",
    function () {

        "use strict";

        /*
        |--------------------------------------------------------------------------
        | Elemen Login
        |--------------------------------------------------------------------------
        */

        const loginForm =
            document.querySelector(".login-form");

        const usernameInput =
            document.getElementById("username");

        const passwordInput =
            document.getElementById("password");

        const togglePassword =
            document.querySelector(
                ".login-password-toggle"
            );

        const roleControl =
            document.getElementById(
                "role-control"
            );

        const rolePicker =
            document.querySelector(
                ".role-picker"
            );

        const roleOptions =
            document.querySelectorAll(
                'input[name="jenis_pengguna"]'
            );

        const roleCurrentLabel =
            document.getElementById(
                "role-current-label"
            );

        const roleError =
            document.getElementById(
                "role-error"
            );

        const roleErrorText =
            roleError?.querySelector(
                ".login-validation-text"
            );

        const loginButton =
            loginForm?.querySelector(
                'button[type="submit"]'
            );

        /*
        |--------------------------------------------------------------------------
        | Validasi Elemen
        |--------------------------------------------------------------------------
        */

        if (
            !loginForm ||
            !usernameInput ||
            !passwordInput ||
            !roleControl ||
            !rolePicker ||
            !roleCurrentLabel ||
            !loginButton
        ) {

            console.error(
                "Elemen login ARTHA tidak lengkap."
            );

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | Placeholder
        |--------------------------------------------------------------------------
        */

        const originalUsernamePlaceholder =
            usernameInput.placeholder;

        const originalPasswordPlaceholder =
            passwordInput.placeholder;

        const originalButtonHTML =
            loginButton.innerHTML;

        /*
        |--------------------------------------------------------------------------
        | Ambil Role
        |--------------------------------------------------------------------------
        */

        function getSelectedRole() {

            return document.querySelector(
                'input[name="jenis_pengguna"]:checked'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Error Role
        |--------------------------------------------------------------------------
        */

        function showRoleError(message) {

            roleControl.classList.add(
                "is-invalid"
            );

            roleControl.setAttribute(
                "aria-invalid",
                "true"
            );

            if (roleErrorText) {

                roleErrorText.textContent =
                    message;
            }

            if (roleError) {

                roleError.hidden = false;
            }
        }

        function clearRoleError() {

            roleControl.classList.remove(
                "is-invalid"
            );

            roleControl.removeAttribute(
                "aria-invalid"
            );

            if (roleError) {

                roleError.hidden = true;
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Error Input
        |--------------------------------------------------------------------------
        */

        function showInputError(
            input,
            message
        ) {

            const wrapper =
                input.closest(
                    ".login-input-wrap"
                );

            if (wrapper) {

                wrapper.classList.add(
                    "is-invalid"
                );
            }

            input.placeholder =
                message;

            input.setAttribute(
                "aria-invalid",
                "true"
            );
        }

        function clearInputError(
            input,
            originalPlaceholder
        ) {

            const wrapper =
                input.closest(
                    ".login-input-wrap"
                );

            if (wrapper) {

                wrapper.classList.remove(
                    "is-invalid"
                );
            }

            input.placeholder =
                originalPlaceholder;

            input.removeAttribute(
                "aria-invalid"
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Validasi Username
        |--------------------------------------------------------------------------
        */

        function validateUsername() {

            const username =
                usernameInput.value.trim();

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

        /*
        |--------------------------------------------------------------------------
        | Validasi Password
        |--------------------------------------------------------------------------
        */

        function validatePassword() {

            const password =
                passwordInput.value;

            if (!password) {

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

        /*
        |--------------------------------------------------------------------------
        | Validasi Role
        |--------------------------------------------------------------------------
        */

        function validateRole() {

            const selectedRole =
                getSelectedRole();

            if (!selectedRole) {

                showRoleError(
                    "Silakan pilih jenis pengguna."
                );

                return false;
            }

            clearRoleError();

            return true;
        }

        /*
        |--------------------------------------------------------------------------
        | Toggle Password
        |--------------------------------------------------------------------------
        */

        if (togglePassword) {

            togglePassword.type =
                "button";

            togglePassword.addEventListener(
                "click",
                function () {

                    const isVisible =
                        passwordInput.type ===
                        "text";

                    passwordInput.type =
                        isVisible
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
                }
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Input Username
        |--------------------------------------------------------------------------
        */

        usernameInput.addEventListener(
            "input",
            function () {

                if (
                    this.value.trim() !== ""
                ) {

                    clearInputError(
                        usernameInput,
                        originalUsernamePlaceholder
                    );
                }
            }
        );

        /*
        |--------------------------------------------------------------------------
        | Input Password
        |--------------------------------------------------------------------------
        */

        passwordInput.addEventListener(
            "input",
            function () {

                if (
                    this.value !== ""
                ) {

                    clearInputError(
                        passwordInput,
                        originalPasswordPlaceholder
                    );
                }
            }
        );

        /*
        |--------------------------------------------------------------------------
        | Pilihan Role
        |--------------------------------------------------------------------------
        */

        roleOptions.forEach(
            function (option) {

                option.addEventListener(
                    "change",
                    function () {

                        if (!this.checked) {
                            return;
                        }

                        const selectedOption =
                            this.closest(
                                ".role-option"
                            );

                        const selectedLabel =
                            selectedOption?.querySelector(
                                "span"
                            );

                        if (selectedLabel) {

                            roleCurrentLabel.textContent =
                                selectedLabel.textContent.trim();
                        }

                        rolePicker.open =
                            false;

                        clearRoleError();

                        console.log(
                            "Role dipilih:",
                            this.value
                        );
                    }
                );
            }
        );

        /*
        |--------------------------------------------------------------------------
        | Submit Login
        |--------------------------------------------------------------------------
        */

        loginForm.noValidate =
            true;

        loginForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();

                /*
                | Validasi input
                */

                if (!validateUsername()) {

                    usernameInput.focus();

                    return;
                }

                if (!validatePassword()) {

                    passwordInput.focus();

                    return;
                }

                if (!validateRole()) {

                    roleControl.focus();

                    return;
                }

                /*
                | Pastikan API tersedia
                */

                if (
                    !window.ARTHA_API ||
                    typeof window.ARTHA_API.post !==
                    "function"
                ) {

                    showRoleError(
                        "API ARTHA tidak tersedia. Silakan muat ulang halaman."
                    );

                    console.error(
                        "window.ARTHA_API tidak ditemukan."
                    );

                    return;
                }

                const selectedRole =
                    getSelectedRole();

                const username =
                    usernameInput.value.trim();

                const password =
                    passwordInput.value;

                const role =
                    selectedRole.value;

                /*
                | Loading
                */

                loginButton.disabled =
                    true;

                loginButton.innerHTML =
                    "<span>Memeriksa...</span>";

                clearRoleError();

                try {

                    /*
                    |--------------------------------------------------------------------------
                    | Kirim Login ke Backend
                    |--------------------------------------------------------------------------
                    */

                    const response =
                        await window.ARTHA_API.post(
                            "login",
                            {
                                username,
                                password,
                                role
                            }
                        );

                    console.log(
                        "Respons login:",
                        response
                    );

                    /*
                    |--------------------------------------------------------------------------
                    | Validasi Response
                    |--------------------------------------------------------------------------
                    */

                    if (
                        !response ||
                        response.success !== true ||
                        !response.data
                    ) {

                        throw new Error(
                            response?.message ||
                            "Login gagal."
                        );
                    }

                    const user =
                        response.data.user || response.data;

                    const actualRole =
                        String(
                            user.peran || ""
                        ).toLowerCase();

                    /*
                    |--------------------------------------------------------------------------
                    | Pastikan Role Sesuai
                    |--------------------------------------------------------------------------
                    */

                    if (
                        actualRole !== role
                    ) {

                        throw new Error(
                            "Role akun tidak sesuai."
                        );
                    }

                    /*
                    |--------------------------------------------------------------------------
                    | Ambil Redirect dari Backend
                    |--------------------------------------------------------------------------
                    */

                    const destination =
                        response.data.redirect;

                    if (!destination) {

                        throw new Error(
                            "Tujuan dashboard tidak tersedia."
                        );
                    }

                    console.log(
                        "Login berhasil."
                    );

                    console.log(
                        "User:",
                        user.nama_pengguna
                    );

                    console.log(
                        "Role:",
                        actualRole
                    );

                    console.log(
                        "Redirect:",
                        destination
                    );

                    /*
                    |--------------------------------------------------------------------------
                    | Redirect
                    |--------------------------------------------------------------------------
                    */

                    window.location.href =
                        new URL(
                            destination,
                            document.baseURI
                        ).href;

                } catch (error) {

                    console.error(
                        "Login ARTHA gagal:",
                        error
                    );

                    showRoleError(
                        error.message ||
                        "Username atau password salah."
                    );

                    loginButton.disabled =
                        false;

                    loginButton.innerHTML =
                        originalButtonHTML;

                }

            }
        );

        console.log(
            "Auth ARTHA berhasil dimuat."
        );

    }
);