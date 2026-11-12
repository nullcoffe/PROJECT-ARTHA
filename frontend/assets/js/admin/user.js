
document.addEventListener("DOMContentLoaded", function () {

    // MENGAMBIL ELEMEN HTML
    const userForm = document.getElementById("userForm");
    const userTable = document.querySelector(".users-table tbody");
    const nameInput = document.getElementById("newName");
    const usernameInput = document.getElementById("newUsername");
    const roleInput = document.getElementById("newRole");
    const passwordInput = document.getElementById("newPassword");
    const addButton = document.querySelector(".add-user-button");

    // KONFIGURASI PENYIMPANAN
    const USER_STORAGE_KEY =
        (window.ARTHA_CONFIG?.storagePrefix || "artha:") + "users";

    // MEMERIKSA ELEMEN UTAMA
    if (!userForm || !userTable || !nameInput ||
        !usernameInput || !roleInput || !passwordInput) {
        console.error("Elemen manajemen pengguna tidak ditemukan.");
        return;
    }

    // MEMERIKSA KETERSEDIAAN CUSTOM POPUP
    function getPopup() {
        if (!window.arthaPopup) {
            console.error("Custom Popup ARTHA belum tersedia.");
            return null;
        }

        return window.arthaPopup;
    }

    // STATUS FORM
    let editingRow = null;

    // FORMAT ROLE
    function formatRole(role) {
        const roles = {
            pemilik: "Pemilik",
            kasir: "Kasir"
        };

        return roles[role] || role;
    }

    // NORMALISASI ROLE
    function normalizeRole(role) {
        const normalized = String(role || "").trim().toLowerCase();

        if (normalized === "pemilik") return "pemilik";
        if (normalized === "kasir") return "kasir";

        return "";
    }

    // MEMERIKSA USERNAME DUPLIKAT
    function isUsernameDuplicate(username, excludedRow = null) {
        const normalizedUsername = username.trim().toLowerCase();
        const rows = userTable.querySelectorAll("tr");

        return Array.from(rows).some(function (row) {
            if (row === excludedRow) return false;

            const existingUsername =
                row.cells[1]?.textContent.trim().toLowerCase();

            return existingUsername === normalizedUsername;
        });
    }

    // MEMERIKSA KETERSEDIAAN AKUN PEMILIK
    function isOwnerAlreadyExists(excludedRow = null) {
        const rows = userTable.querySelectorAll("tr");

        return Array.from(rows).some(function (row) {
            if (row === excludedRow) return false;

            const roleBadge = row.querySelector(".role-badge");

            const existingRole = normalizeRole(
                roleBadge?.textContent || ""
            );

            return existingRole === "pemilik";
        });
    }

    // MEMPERBARUI BARIS PENGGUNA
    function updateUserRow(row, name, username, role) {
        row.cells[0].textContent = name;
        row.cells[1].textContent = username;

        const roleBadge = row.querySelector(".role-badge");

        if (roleBadge) {
            roleBadge.textContent = formatRole(role);
            roleBadge.classList.remove("role-owner", "role-cashier");
            roleBadge.classList.add(
                role === "pemilik" ? "role-owner" : "role-cashier"
            );
        }

        const editButton = row.querySelector(".edit-button");
        const deleteButton = row.querySelector(".delete-button");

        editButton?.setAttribute("aria-label", `Ubah akun ${name}`);
        deleteButton?.setAttribute("aria-label", `Hapus akun ${name}`);
    }

    // MEMBUAT TOMBOL AKSI
    function createActionButton(type, label, href) {
        const link = document.createElement("a");

        link.href = href;
        link.className = `action-button ${type}-button`;
        link.setAttribute("aria-label", label);

        const image = document.createElement("img");

        image.src = type === "edit"
            ? "../assets/icons/actions/edit.svg"
            : "../assets/icons/actions/delete.svg";

        image.alt = "";
        link.appendChild(image);

        return link;
    }

    // MEMBUAT BARIS PENGGUNA
    function createUserRow(name, username, role) {
        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.textContent = name;

        const usernameCell = document.createElement("td");
        usernameCell.textContent = username;

        const roleCell = document.createElement("td");
        const roleBadge = document.createElement("span");

        roleBadge.className = role === "pemilik"
            ? "role-badge role-owner"
            : "role-badge role-cashier";

        roleBadge.textContent = formatRole(role);
        roleCell.appendChild(roleBadge);

        const passwordCell = document.createElement("td");
        const passwordHidden = document.createElement("span");

        passwordHidden.className = "password-hidden";
        passwordHidden.textContent = "••••••••";
        passwordHidden.setAttribute(
            "aria-label",
            "Kata sandi disembunyikan"
        );

        passwordCell.appendChild(passwordHidden);

        const actionCell = document.createElement("td");
        const actions = document.createElement("div");

        actions.className = "users-actions";

        const editButton = createActionButton(
            "edit",
            `Ubah akun ${name}`,
            "#userFormSection"
        );

        const deleteButton = createActionButton(
            "delete",
            `Hapus akun ${name}`,
            "#"
        );

        actions.append(editButton, deleteButton);
        actionCell.appendChild(actions);

        row.append(
            nameCell,
            usernameCell,
            roleCell,
            passwordCell,
            actionCell
        );

        return row;
    }

    // MENGAMBIL DATA PENGGUNA DARI TABEL
    function getUsersFromTable() {
        return Array.from(userTable.querySelectorAll("tr"))
            .map(function (row) {
                const roleBadge = row.querySelector(".role-badge");

                const role = normalizeRole(
                    roleBadge?.textContent || ""
                );

                return {
                    name: row.cells[0]?.textContent.trim() || "",
                    username: row.cells[1]?.textContent.trim() || "",
                    role: role
                };
            })
            .filter(function (user) {
                return user.username && user.name && user.role;
            });
    }

    // MENYIMPAN DATA PENGGUNA
    function saveUsers() {
        try {
            localStorage.setItem(
                USER_STORAGE_KEY,
                JSON.stringify(getUsersFromTable())
            );

            return true;

        } catch (error) {
            console.error("Gagal menyimpan data pengguna:", error);
            return false;
        }
    }

    // MEMUAT DATA PENGGUNA
    function loadUsers() {
        const savedUsers = localStorage.getItem(USER_STORAGE_KEY);

        if (!savedUsers) {
            saveUsers();
            return;
        }

        try {
            const users = JSON.parse(savedUsers);

            if (!Array.isArray(users)) {
                throw new Error("Format data pengguna tidak valid.");
            }

            users.forEach(function (user) {
                const role = normalizeRole(user.role);

                if (!user.name || !user.username || !role) return;

                const existingRow = Array.from(
                    userTable.querySelectorAll("tr")
                ).find(function (row) {
                    return row.cells[1]?.textContent.trim().toLowerCase() ===
                        user.username.trim().toLowerCase();
                });

                if (existingRow) {
                    updateUserRow(
                        existingRow,
                        user.name,
                        user.username,
                        role
                    );
                } else {
                    userTable.appendChild(
                        createUserRow(
                            user.name,
                            user.username,
                            role
                        )
                    );
                }
            });

        } catch (error) {
            console.error("Gagal memuat data pengguna:", error);
        }
    }

    // API DATA PENGGUNA UNTUK AUTENTIKASI
    window.ArthaUsers = Object.freeze({
        getAll: function () {
            try {
                const users = JSON.parse(
                    localStorage.getItem(USER_STORAGE_KEY) || "[]"
                );

                return Array.isArray(users) ? users : [];

            } catch (error) {
                console.error("Gagal membaca data pengguna:", error);
                return [];
            }
        },

        findByUsername: function (username) {
            if (typeof username !== "string") return null;

            const normalizedUsername = username.trim().toLowerCase();

            return this.getAll().find(function (user) {
                return user.username.toLowerCase() === normalizedUsername;
            }) || null;
        }
    });

    // MENGOSONGKAN FORM KETIKA TAMBAH PENGGUNA
    addButton?.addEventListener("click", function () {
        editingRow = null;
        userForm.reset();
        passwordInput.required = true;

        userForm.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    });

    // MENANGANI EVENT EDIT DAN HAPUS
    userTable.addEventListener("click", async function (event) {
        const editButton = event.target.closest(".edit-button");
        const deleteButton = event.target.closest(".delete-button");

        // EDIT PENGGUNA
        if (editButton) {
            event.preventDefault();

            const row = editButton.closest("tr");
            if (!row) return;

            editingRow = row;

            nameInput.value = row.cells[0].textContent.trim();
            usernameInput.value = row.cells[1].textContent.trim();

            const roleBadge = row.querySelector(".role-badge");

            roleInput.value = normalizeRole(
                roleBadge?.textContent || ""
            );

            passwordInput.value = "";
            passwordInput.required = false;

            userForm.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

            nameInput.focus();

            return;
        }

        // HAPUS PENGGUNA
        if (deleteButton) {
            event.preventDefault();

            const row = deleteButton.closest("tr");
            if (!row) return;

            const popup = getPopup();
            if (!popup) return;

            const name = row.cells[0].textContent.trim();

            const confirmed = await popup.confirm(
                `Apakah Anda yakin ingin menghapus pengguna ${name}? Tindakan ini tidak dapat dibatalkan.`,
                {
                    title: "Hapus Pengguna?",
                    confirmText: "Ya, Hapus",
                    cancelText: "Batal"
                }
            );

            if (!confirmed) return;

            const nextRow = row.nextElementSibling;

            row.remove();

            if (!saveUsers()) {
                if (nextRow && nextRow.parentNode === userTable) {
                    userTable.insertBefore(row, nextRow);
                } else {
                    userTable.appendChild(row);
                }

                await popup.error("Pengguna gagal dihapus.");
                return;
            }

            await popup.success(
                "Pengguna berhasil dihapus.",
                {
                    title: "Penghapusan Berhasil"
                }
            );
        }
    });

    // VALIDASI DAN PROSES FORM PENGGUNA
    userForm.noValidate = true;

    userForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const popup = getPopup();
        if (!popup) return;

        const name = nameInput.value.trim();
        const username = usernameInput.value.trim();
        const role = normalizeRole(roleInput.value);
        const password = passwordInput.value;

        const isEditing = Boolean(editingRow);

        // VALIDASI NAMA
        if (!name) {
            await popup.warning("Nama pengguna wajib diisi.");
            nameInput.focus();
            return;
        }

        // VALIDASI USERNAME
        if (!username) {
            await popup.warning("Username wajib diisi.");
            usernameInput.focus();
            return;
        }

        // VALIDASI USERNAME DUPLIKAT
        if (isUsernameDuplicate(username, editingRow)) {
            await popup.warning(
                "Username sudah digunakan. Silakan gunakan username lain."
            );

            usernameInput.focus();
            return;
        }

        // VALIDASI ROLE
        if (!role) {
            await popup.warning(
                "Silakan pilih jenis pengguna yang valid."
            );

            roleInput.focus();
            return;
        }

        // MEMBATASI JUMLAH AKUN PEMILIK HANYA SATU
        if (role === "pemilik" && isOwnerAlreadyExists(editingRow)) {
            await popup.warning(
                "Sistem ARTHA hanya mengizinkan satu akun Pemilik.",
                {
                    title: "Akun Pemilik Sudah Ada"
                }
            );

            roleInput.focus();
            return;
        }

        // VALIDASI PASSWORD PENGGUNA BARU
        if (!isEditing && password.length < 8) {
            await popup.warning(
                "Kata sandi minimal 8 karakter."
            );

            passwordInput.focus();
            return;
        }

        // VALIDASI PASSWORD SAAT EDIT
        if (isEditing && password && password.length < 8) {
            await popup.warning(
                "Kata sandi baru minimal 8 karakter."
            );

            passwordInput.focus();
            return;
        }

        // MENYIMPAN DATA LAMA UNTUK PEMULIHAN
        const oldData = isEditing ? {
            name: editingRow.cells[0].textContent.trim(),
            username: editingRow.cells[1].textContent.trim(),
            role: normalizeRole(
                editingRow.querySelector(".role-badge")?.textContent || ""
            )
        } : null;

        let targetRow = editingRow;

        // MEMPERBARUI ATAU MENAMBAHKAN PENGGUNA
        if (isEditing) {
            updateUserRow(editingRow, name, username, role);
        } else {
            targetRow = createUserRow(name, username, role);
            userTable.appendChild(targetRow);
        }

        // MENYIMPAN PERUBAHAN
        if (!saveUsers()) {
            if (isEditing && oldData) {
                updateUserRow(
                    targetRow,
                    oldData.name,
                    oldData.username,
                    oldData.role
                );
            } else if (targetRow) {
                targetRow.remove();
            }

            await popup.error("Data pengguna gagal disimpan.");
            return;
        }

        // RESET FORM
        editingRow = null;
        userForm.reset();
        passwordInput.required = true;

        // NOTIFIKASI TAMBAH ATAU EDIT
        if (isEditing) {
            await popup.success(
                "Data pengguna berhasil diperbarui.",
                {
                    title: "Perubahan Berhasil"
                }
            );
        } else {
            await popup.success(
                "Data pengguna berhasil disimpan.",
                {
                    title: "Pengguna Berhasil Ditambahkan"
                }
            );
        }
    });

    // MENGATUR ULANG STATUS FORM
    userForm.addEventListener("reset", function () {
        editingRow = null;
        passwordInput.required = true;
    });

    // MEMUAT DATA PENGGUNA SAAT HALAMAN DIBUKA
    loadUsers();

    // MENYIMPAN DATA AWAL
    saveUsers();

    console.log("Manajemen Pengguna berhasil diinisialisasi.");

});
