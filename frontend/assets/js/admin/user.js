document.addEventListener(
    "DOMContentLoaded",
    function () {

        "use strict";

        /*
        |--------------------------------------------------------------------------
        | ELEMEN HALAMAN
        |--------------------------------------------------------------------------
        */

        const userForm =
            document.getElementById(
                "userForm"
            );

        const userTable =
            document.querySelector(
                ".users-table tbody"
            );

        const nameInput =
            document.getElementById(
                "newName"
            );

        const usernameInput =
            document.getElementById(
                "newUsername"
            );

        const roleInput =
            document.getElementById(
                "newRole"
            );

        const passwordInput =
            document.getElementById(
                "newPassword"
            );

        const addButton =
            document.querySelector(
                ".add-user-button"
            );

        /*
        |--------------------------------------------------------------------------
        | VALIDASI ELEMEN
        |--------------------------------------------------------------------------
        */

        if (
            !userForm ||
            !userTable ||
            !nameInput ||
            !usernameInput ||
            !roleInput ||
            !passwordInput
        ) {

            console.error(
                "Elemen manajemen pengguna tidak ditemukan."
            );

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | POPUP
        |--------------------------------------------------------------------------
        */

        function getPopup() {

            if (
                !window.arthaPopup
            ) {

                console.error(
                    "Custom Popup ARTHA belum tersedia."
                );

                return null;
            }

            return window.arthaPopup;
        }

        /*
        |--------------------------------------------------------------------------
        | STATUS EDIT
        |--------------------------------------------------------------------------
        */

        let editingId = null;

        /*
        |--------------------------------------------------------------------------
        | FORMAT ROLE
        |--------------------------------------------------------------------------
        */

        function formatRole(role) {

            const roles = {
                pemilik: "Pemilik",
                kasir: "Kasir"
            };

            return (
                roles[role] ||
                role
            );
        }

        /*
        |--------------------------------------------------------------------------
        | NORMALISASI ROLE
        |--------------------------------------------------------------------------
        */

        function normalizeRole(role) {

            const normalized =
                String(
                    role || ""
                )
                    .trim()
                    .toLowerCase();

            if (
                normalized === "pemilik"
            ) {

                return "pemilik";
            }

            if (
                normalized === "kasir"
            ) {

                return "kasir";
            }

            return "";
        }

        /*
        |--------------------------------------------------------------------------
        | MEMBUAT TOMBOL AKSI
        |--------------------------------------------------------------------------
        */

        function createActionButton(
            type,
            label,
            href
        ) {

            const link =
                document.createElement(
                    "a"
                );

            link.href =
                href;

            link.className =
                `action-button ${type}-button`;

            link.setAttribute(
                "aria-label",
                label
            );

            const image =
                document.createElement(
                    "img"
                );

            image.src =
                type === "edit"
                    ? "../assets/icons/actions/edit.svg"
                    : "../assets/icons/actions/delete.svg";

            image.alt = "";

            link.appendChild(
                image
            );

            return link;
        }

        /*
        |--------------------------------------------------------------------------
        | MEMBUAT BARIS PENGGUNA
        |--------------------------------------------------------------------------
        */

        function createUserRow(
            user
        ) {

            const row =
                document.createElement(
                    "tr"
                );

            row.dataset.id =
                user.id_pengguna;

            /*
            | Nama
            */

            const nameCell =
                document.createElement(
                    "td"
                );

            nameCell.textContent =
                user.nama_lengkap;

            /*
            | Username
            */

            const usernameCell =
                document.createElement(
                    "td"
                );

            usernameCell.textContent =
                user.nama_pengguna;

            /*
            | Role
            */

            const roleCell =
                document.createElement(
                    "td"
                );

            const roleBadge =
                document.createElement(
                    "span"
                );

            roleBadge.className =
                user.peran === "pemilik"
                    ? "role-badge role-owner"
                    : "role-badge role-cashier";

            roleBadge.textContent =
                formatRole(
                    user.peran
                );

            roleCell.appendChild(
                roleBadge
            );

            /*
            | Password
            */

            const passwordCell =
                document.createElement(
                    "td"
                );

            const passwordHidden =
                document.createElement(
                    "span"
                );

            passwordHidden.className =
                "password-hidden";

            passwordHidden.textContent =
                "••••••••";

            passwordHidden.setAttribute(
                "aria-label",
                "Kata sandi disembunyikan"
            );

            passwordCell.appendChild(
                passwordHidden
            );

            /*
            | Aksi
            */

            const actionCell =
                document.createElement(
                    "td"
                );

            const actions =
                document.createElement(
                    "div"
                );

            actions.className =
                "users-actions";

            const editButton =
                createActionButton(
                    "edit",
                    `Ubah akun ${user.nama_lengkap}`,
                    "#userFormSection"
                );

            const deleteButton =
                createActionButton(
                    "delete",
                    `Hapus akun ${user.nama_lengkap}`,
                    "#"
                );

            actions.append(
                editButton,
                deleteButton
            );

            actionCell.appendChild(
                actions
            );

            row.append(
                nameCell,
                usernameCell,
                roleCell,
                passwordCell,
                actionCell
            );

            return row;
        }

        /*
        |--------------------------------------------------------------------------
        | MEMUAT DATA DARI DATABASE
        |--------------------------------------------------------------------------
        */

        async function loadUsers() {

            try {

                const response =
                    await window.ARTHA_API.get(
                        "admin/users"
                    );

                const users =
                    Array.isArray(
                        response.data
                    )
                        ? response.data
                        : [];

                userTable.replaceChildren();

                if (
                    users.length === 0
                ) {

                    const row =
                        document.createElement(
                            "tr"
                        );

                    const cell =
                        document.createElement(
                            "td"
                        );

                    cell.colSpan = 5;

                    cell.textContent =
                        "Belum ada data pengguna.";

                    cell.style.textAlign =
                        "center";

                    row.appendChild(
                        cell
                    );

                    userTable.appendChild(
                        row
                    );

                    return;
                }

                users.forEach(
                    function (user) {

                        userTable.appendChild(
                            createUserRow(
                                user
                            )
                        );
                    }
                );

            } catch (error) {

                console.error(
                    "Gagal mengambil data pengguna:",
                    error
                );

                const popup =
                    getPopup();

                if (
                    popup &&
                    typeof popup.error ===
                    "function"
                ) {

                    await popup.error(
                        error.message ||
                        "Data pengguna gagal dimuat."
                    );
                }
            }
        }

        /*
        |--------------------------------------------------------------------------
        | CEK USERNAME DUPLIKAT
        |--------------------------------------------------------------------------
        */

        function isUsernameDuplicate(
            username,
            excludedId = null
        ) {

            const normalized =
                username
                    .trim()
                    .toLowerCase();

            const rows =
                userTable.querySelectorAll(
                    "tr[data-id]"
                );

            return Array.from(
                rows
            ).some(
                function (row) {

                    if (
                        Number(
                            row.dataset.id
                        ) ===
                        Number(
                            excludedId
                        )
                    ) {

                        return false;
                    }

                    const existing =
                        row.cells[1]
                            ?.textContent
                            .trim()
                            .toLowerCase();

                    return (
                        existing ===
                        normalized
                    );
                }
            );
        }

        /*
        |--------------------------------------------------------------------------
        | CEK AKUN PEMILIK
        |--------------------------------------------------------------------------
        */

        function isOwnerAlreadyExists(
            excludedId = null
        ) {

            const rows =
                userTable.querySelectorAll(
                    "tr[data-id]"
                );

            return Array.from(
                rows
            ).some(
                function (row) {

                    if (
                        Number(
                            row.dataset.id
                        ) ===
                        Number(
                            excludedId
                        )
                    ) {

                        return false;
                    }

                    const badge =
                        row.querySelector(
                            ".role-badge"
                        );

                    const role =
                        normalizeRole(
                            badge?.textContent ||
                            ""
                        );

                    return (
                        role ===
                        "pemilik"
                    );
                }
            );
        }

        /*
        |--------------------------------------------------------------------------
        | TOMBOL TAMBAH
        |--------------------------------------------------------------------------
        */

        addButton?.addEventListener(
            "click",
            function () {

                editingId = null;

                userForm.reset();

                passwordInput.required =
                    true;

                passwordInput.placeholder =
                    "Masukan kata sandi baru";

                userForm.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            }
        );

        /*
        |--------------------------------------------------------------------------
        | EDIT DAN DELETE
        |--------------------------------------------------------------------------
        */

        userTable.addEventListener(
            "click",
            async function (event) {

                const editButton =
                    event.target.closest(
                        ".edit-button"
                    );

                const deleteButton =
                    event.target.closest(
                        ".delete-button"
                    );

                /*
                |--------------------------------------------------------------------------
                | EDIT
                |--------------------------------------------------------------------------
                */

                if (
                    editButton
                ) {

                    event.preventDefault();

                    const row =
                        editButton.closest(
                            "tr"
                        );

                    if (!row) {
                        return;
                    }

                    editingId =
                        Number(
                            row.dataset.id
                        );

                    nameInput.value =
                        row.cells[0]
                            .textContent
                            .trim();

                    usernameInput.value =
                        row.cells[1]
                            .textContent
                            .trim();

                    const roleBadge =
                        row.querySelector(
                            ".role-badge"
                        );

                    roleInput.value =
                        normalizeRole(
                            roleBadge?.textContent ||
                            ""
                        );

                    passwordInput.value =
                        "";

                    passwordInput.required =
                        false;

                    passwordInput.placeholder =
                        "Kosongkan jika tidak ingin mengganti";

                    userForm.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });

                    nameInput.focus();

                    return;
                }

                /*
                |--------------------------------------------------------------------------
                | DELETE
                |--------------------------------------------------------------------------
                */

                if (
                    deleteButton
                ) {

                    event.preventDefault();

                    const row =
                        deleteButton.closest(
                            "tr"
                        );

                    if (!row) {
                        return;
                    }

                    const id =
                        Number(
                            row.dataset.id
                        );

                    const name =
                        row.cells[0]
                            .textContent
                            .trim();

                    const popup =
                        getPopup();

                    if (!popup) {
                        return;
                    }

                    const confirmed =
                        await popup.confirm(
                            `Apakah Anda yakin ingin menghapus pengguna ${name}? Tindakan ini tidak dapat dibatalkan.`,
                            {
                                title:
                                    "Hapus Pengguna?",
                                confirmText:
                                    "Ya, Hapus",
                                cancelText:
                                    "Batal"
                            }
                        );

                    if (!confirmed) {
                        return;
                    }

                    try {

                        await window.ARTHA_API.request(
                            `admin/users/${id}`,
                            {
                                method:
                                    "DELETE"
                            }
                        );

                        await popup.success(
                            "Pengguna berhasil dihapus.",
                            {
                                title:
                                    "Penghapusan Berhasil"
                            }
                        );

                        await loadUsers();

                    } catch (error) {

                        console.error(
                            "Gagal menghapus pengguna:",
                            error
                        );

                        await popup.error(
                            error.message ||
                            "Pengguna gagal dihapus."
                        );
                    }
                }
            }
        );

        /*
        |--------------------------------------------------------------------------
        | SUBMIT FORM
        |--------------------------------------------------------------------------
        */

        userForm.noValidate =
            true;

        userForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();

                const popup =
                    getPopup();

                if (!popup) {
                    return;
                }

                const name =
                    nameInput.value.trim();

                const username =
                    usernameInput.value.trim();

                const role =
                    normalizeRole(
                        roleInput.value
                    );

                const password =
                    passwordInput.value;

                const isEditing =
                    editingId !== null;

                /*
                |--------------------------------------------------------------------------
                | VALIDASI NAMA
                |--------------------------------------------------------------------------
                */

                if (!name) {

                    await popup.warning(
                        "Nama pengguna wajib diisi."
                    );

                    nameInput.focus();

                    return;
                }

                /*
                |--------------------------------------------------------------------------
                | VALIDASI USERNAME
                |--------------------------------------------------------------------------
                */

                if (!username) {

                    await popup.warning(
                        "Username wajib diisi."
                    );

                    usernameInput.focus();

                    return;
                }

                if (
                    isUsernameDuplicate(
                        username,
                        editingId
                    )
                ) {

                    await popup.warning(
                        "Username sudah digunakan. Silakan gunakan username lain."
                    );

                    usernameInput.focus();

                    return;
                }

                /*
                |--------------------------------------------------------------------------
                | VALIDASI ROLE
                |--------------------------------------------------------------------------
                */

                if (!role) {

                    await popup.warning(
                        "Silakan pilih jenis pengguna."
                    );

                    roleInput.focus();

                    return;
                }

                /*
                |--------------------------------------------------------------------------
                | SATU PEMILIK
                |--------------------------------------------------------------------------
                */

                if (
                    role === "pemilik" &&
                    isOwnerAlreadyExists(
                        editingId
                    )
                ) {

                    await popup.warning(
                        "Sistem ARTHA hanya mengizinkan satu akun Pemilik.",
                        {
                            title:
                                "Akun Pemilik Sudah Ada"
                        }
                    );

                    roleInput.focus();

                    return;
                }

                /*
                |--------------------------------------------------------------------------
                | VALIDASI PASSWORD
                |--------------------------------------------------------------------------
                */

                if (
                    !isEditing &&
                    password.length < 8
                ) {

                    await popup.warning(
                        "Kata sandi minimal 8 karakter."
                    );

                    passwordInput.focus();

                    return;
                }

                if (
                    isEditing &&
                    password !== "" &&
                    password.length < 8
                ) {

                    await popup.warning(
                        "Kata sandi baru minimal 8 karakter."
                    );

                    passwordInput.focus();

                    return;
                }

                /*
                |--------------------------------------------------------------------------
                | DATA KE SERVER
                |--------------------------------------------------------------------------
                */

                try {

                    if (
                        isEditing
                    ) {

                        await window.ARTHA_API.request(
                            `admin/users/${editingId}`,
                            {
                                method:
                                    "PUT",

                                body: {
                                    nama_lengkap:
                                        name,

                                    nama_pengguna:
                                        username,

                                    peran:
                                        role,

                                    password:
                                        password
                                }
                            }
                        );

                        await popup.success(
                            "Data pengguna berhasil diperbarui.",
                            {
                                title:
                                    "Perubahan Berhasil"
                            }
                        );

                    } else {

                        await window.ARTHA_API.post(
                            "admin/users",
                            {
                                nama_lengkap:
                                    name,

                                nama_pengguna:
                                    username,

                                peran:
                                    role,

                                password:
                                    password
                            }
                        );

                        await popup.success(
                            "Data pengguna berhasil disimpan.",
                            {
                                title:
                                    "Pengguna Berhasil Ditambahkan"
                            }
                        );
                    }

                    /*
                    |--------------------------------------------------------------------------
                    | RESET
                    |--------------------------------------------------------------------------
                    */

                    editingId =
                        null;

                    userForm.reset();

                    passwordInput.required =
                        true;

                    passwordInput.placeholder =
                        "Masukan kata sandi baru";

                    /*
                    |--------------------------------------------------------------------------
                    | LOAD ULANG DATABASE
                    |--------------------------------------------------------------------------
                    */

                    await loadUsers();

                } catch (error) {

                    console.error(
                        "Gagal menyimpan pengguna:",
                        error
                    );

                    await popup.error(
                        error.message ||
                        "Data pengguna gagal disimpan."
                    );
                }
            }
        );

        /*
        |--------------------------------------------------------------------------
        | RESET FORM
        |--------------------------------------------------------------------------
        */

        userForm.addEventListener(
            "reset",
            function () {

                editingId =
                    null;

                passwordInput.required =
                    true;

                passwordInput.placeholder =
                    "Masukan kata sandi baru";
            }
        );

        /*
        |--------------------------------------------------------------------------
        | LOAD AWAL
        |--------------------------------------------------------------------------
        */

        loadUsers();

        console.log(
            "Manajemen Pengguna ARTHA berhasil diinisialisasi."
        );
    }
);