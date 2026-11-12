
document.addEventListener("DOMContentLoaded", function () {

    const sidebarToggle = document.getElementById("sidebar-toggle");
    const navLinks = document.querySelectorAll(".sidebar-nav .nav-item:not(.logout)");

    // MENENTUKAN MENU AKTIF
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

    // MENUTUP SIDEBAR DENGAN ESCAPE
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && sidebarToggle) {
            sidebarToggle.checked = false;
        }
    });

    // EVENT LOGOUT MENGGUNAKAN DELEGASI
    document.addEventListener("click", async function (event) {

        const logoutButton = event.target.closest(".sidebar-nav .nav-item.logout");

        if (!logoutButton) return;

        event.preventDefault();
        event.stopPropagation();

        const destination = logoutButton.getAttribute("href");

        if (!destination) {
            console.error("Alamat halaman login tidak ditemukan.");
            return;
        }

        // MEMASTIKAN POPUP SUDAH DIMUAT
        if (!window.arthaPopup || typeof window.arthaPopup.confirm !== "function") {
            console.error("ARTHA Popup belum tersedia. Periksa pemanggilan popup.js.");
            return;
        }

        // MENAMPILKAN KONFIRMASI LOGOUT
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

            // MENGHAPUS DATA TRANSAKSI SEMENTARA
            sessionStorage.removeItem("artha_pos_cart");
            sessionStorage.removeItem("artha_payment_data");

            // MENUTUP SIDEBAR
            if (sidebarToggle) {
                sidebarToggle.checked = false;
            }

            // KEMBALI KE HALAMAN LOGIN
            window.location.assign(destination);

        } catch (error) {
            console.error("Kesalahan proses logout:", error);
        }

    });

    console.log("Navigation ARTHA berhasil dimuat.");

});
