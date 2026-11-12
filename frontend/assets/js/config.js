(function (window) {
    "use strict";

    // 1. APPLICATION CONFIGURATION
    const app = Object.freeze({
        name: "ARTHA",
        locale: "id-ID",
        currency: "IDR"
    });

    // 2. DASHBOARD ROUTES
    const routes = Object.freeze({
        dashboard: Object.freeze({
            admin: "admin/dashboard.html",
            pemilik: "pemilik/dashboard.html",
            kasir: "kasir/dashboard.html"
        })
    });

    // 3. STORAGE CONFIGURATION
    const storage = Object.freeze({
        posCart: "artha_pos_cart",
        paymentData: "artha_payment_data"
    });

    // 4. EXPORT GLOBAL CONFIGURATION
    window.ARTHA_CONFIG = Object.freeze({
        app,
        routes,
        storage
    });

    // 5. INITIALIZATION LOG
    console.log("ARTHA Configuration berhasil dimuat.");

})(window);