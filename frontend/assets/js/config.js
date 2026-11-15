
(function (window) {
    "use strict";

    // Konfigurasi aplikasi
    const app = Object.freeze({
        name: "ARTHA",
        locale: "id-ID",
        currency: "IDR"
    });

    // Alamat dashboard berdasarkan jenis pengguna
    const routes = Object.freeze({
        dashboard: Object.freeze({
            admin: "admin/dashboard.php",
            pemilik: "pemilik/dashboard.php",
            kasir: "kasir/dashboard.php"
        })
    });

    // Konfigurasi penyimpanan sementara
    const storage = Object.freeze({
        posCart: "artha_pos_cart",
        paymentData: "artha_payment_data"
    });

    // Menyediakan konfigurasi untuk seluruh aplikasi
    window.ARTHA_CONFIG = Object.freeze({
        app,
        routes,
        storage
    });

    console.log("ARTHA Configuration berhasil dimuat.");

})(window);