
(function (window) {
    "use strict";

    // Menentukan root aplikasi ARTHA
    const currentPath = window.location.pathname;
    const frontendIndex = currentPath.indexOf("/frontend/");

    const appRoot = frontendIndex !== -1
        ? currentPath.substring(0, frontendIndex)
        : "";

    // Alamat backend API
    const API_BASE_URL = new URL(
        `${appRoot}/backend/api/`,
        window.location.origin
    );

    // Fungsi request umum
    async function request(endpoint, options = {}) {

        const cleanEndpoint = String(endpoint).replace(/^\/+/, "");

        const url = new URL(cleanEndpoint, API_BASE_URL);

        const requestOptions = {
            method: options.method || "GET",
            headers: {
                "Accept": "application/json",
                ...(options.headers || {})
            },
            credentials: "same-origin",
            cache: "no-store"
        };

        if (options.body !== undefined) {
            requestOptions.headers["Content-Type"] = "application/json";
            requestOptions.body = JSON.stringify(options.body);
        }

        const response = await fetch(url.href, requestOptions);
        const responseText = await response.text();

        let result;

        try {
            result = JSON.parse(responseText);
        } catch (error) {
            throw new Error(
                `Respons bukan JSON. HTTP ${response.status}. URL: ${url.href}`
            );
        }

        if (!response.ok || result.success !== true) {
            const apiError = new Error(
                result.message || "Permintaan API gagal."
            );

            apiError.status = response.status;
            apiError.data = result;

            throw apiError;
        }

        return result;
    }

    // GET
    async function get(endpoint) {
        return request(endpoint, {
            method: "GET"
        });
    }

    // POST
    async function post(endpoint, data = {}) {
        return request(endpoint, {
            method: "POST",
            body: data
        });
    }

    // Daftarkan API secara global
    window.ARTHA_API = Object.freeze({
        request,
        get,
        post
    });

    console.log("ARTHA API berhasil dimuat:", API_BASE_URL.href);

})(window);