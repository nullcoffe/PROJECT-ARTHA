
document.addEventListener("DOMContentLoaded", function () {

    const sidebarToggle = document.getElementById("sidebar-toggle");

    const navLinks = document.querySelectorAll(
        ".sidebar-nav .nav-item:not(.logout)"
    );

    // Mengubah navigasi HTML menjadi PHP
    navLinks.forEach(function (link) {

        const href = link.getAttribute("href");

        if (!href) return;

        const targetUrl = new URL(href, window.location.href);

        if (targetUrl.pathname.endsWith(".html")) {

            targetUrl.pathname = targetUrl.pathname.replace(
                /\.html$/,
                ".php"
            );

            link.href = targetUrl.href;

        }

    });

    // Menentukan menu aktif berdasarkan URL
    const currentPath = window.location.pathname;

    navLinks.forEach(function (link) {

        if (!link.href) return;

        const targetPath = new URL(link.href).pathname;

        const isActive = targetPath === currentPath;

        link.classList.toggle("active", isActive);

        if (isActive) {

            link.setAttribute("aria-current", "page");

        } else {

            link.removeAttribute("aria-current");

        }

    });

    // Menutup sidebar menggunakan tombol Escape
    document.addEventListener("keydown", function (event) {

        if (event.key === "Escape" && sidebarToggle) {

            sidebarToggle.checked = false;

        }

    });

    // Menangani proses logout
    document.addEventListener("click", async function (event) {

        const logoutButton = event.target.closest(
            ".sidebar-nav .nav-item.logout"
        );

        if (!logoutButton) return;

        event.preventDefault();
        event.stopPropagation();

        const destination = logoutButton.getAttribute("href");

        if (!destination) {

            console.error(
                "Alamat halaman login tidak ditemukan."
            );

            return;

        }

        // Memastikan popup sudah dimuat
        if (
            !window.arthaPopup ||
            typeof window.arthaPopup.confirm !== "function"
        ) {

            console.error(
                "ARTHA Popup belum tersedia. Periksa pemanggilan popup.js."
            );

            return;

        }

        // Menampilkan konfirmasi logout
        try {

            const confirmation = await window.arthaPopup.confirm(
                "Apakah Anda yakin ingin keluar dari akun ARTHA?",
                {
                    title: "Konfirmasi Logout",
                    confirmText: "Ya, Keluar",
                    cancelText: "Batal"
                }
            );

            if (!confirmation) return;

            // Menghapus data transaksi sementara
            sessionStorage.removeItem("artha_pos_cart");

            sessionStorage.removeItem("artha_payment_data");

            // Menghapus hasil analisis Apriori saat logout
            localStorage.removeItem("artha_apriori_results");

            // Menutup sidebar
            if (sidebarToggle) {

                sidebarToggle.checked = false;

            }

            // Kembali ke halaman login
            window.location.assign(destination);

        } catch (error) {

            console.error(
                "Kesalahan proses logout:",
                error
            );

        }

    });

    console.log("Navigation ARTHA berhasil dimuat.");

});
