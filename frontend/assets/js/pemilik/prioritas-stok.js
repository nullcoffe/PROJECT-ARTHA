
document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    // =====================================================
    // 1. ELEMEN HALAMAN
    // =====================================================

    const priorityBody = document.getElementById("priority-stock-body");

    const statPriority = document.getElementById("stat-priority");
    const statBelowMinimum = document.getElementById("stat-below-minimum");
    const statMonitored = document.getElementById("stat-monitored");

    if (
        !priorityBody ||
        !statPriority ||
        !statBelowMinimum ||
        !statMonitored
    ) {
        console.error("Elemen Prioritas Stok tidak ditemukan.");
        return;
    }

    // Sesuaikan dengan root project ARTHA.
    const API_BASE = "/artha/backend/api/";

    let isLoading = false;

    // =====================================================
    // 2. REQUEST API
    // =====================================================

    async function apiRequest(endpoint) {
        const response = await fetch(
            API_BASE + endpoint.replace(/^\/+/, ""),
            {
                method: "GET",
                credentials: "same-origin",
                headers: {
                    Accept: "application/json"
                },
                cache: "no-store"
            }
        );

        let result;

        try {
            result = await response.json();
        } catch (error) {
            throw new Error(
                `Respons server tidak valid. HTTP ${response.status}`
            );
        }

        if (!response.ok || result.success === false) {
            throw new Error(
                result.message ||
                `Permintaan gagal. HTTP ${response.status}`
            );
        }

        return result;
    }

    function getResponseData(response) {
        if (!response || typeof response !== "object") {
            return null;
        }

        return response.data ?? response.payload ?? null;
    }

    // =====================================================
    // 3. FORMAT DAN NORMALISASI DATA
    // =====================================================

    function formatNumber(value, digits = 0) {
        const number = Number(value);

        if (!Number.isFinite(number)) {
            return "-";
        }

        return number.toLocaleString("id-ID", {
            minimumFractionDigits: digits,
            maximumFractionDigits: digits
        });
    }

    function normalizeName(value) {
        return String(value ?? "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]/g, "");
    }

    function normalizeProduct(product) {
        return {
            id: product.id_produk,
            name: String(product.nama_produk ?? ""),
            stock: Number(product.stok),
            minimum: Number(product.stok_minimum)
        };
    }

    function isSameProduct(aprioriName, productName) {
        const first = normalizeName(aprioriName);
        const second = normalizeName(productName);

        if (!first || !second) {
            return false;
        }

        return first === second ||
            (first.length >= 4 && second.includes(first)) ||
            (second.length >= 4 && first.includes(second));
    }

    // =====================================================
    // 4. STATISTIK
    // =====================================================

    function resetStatistics() {
        statPriority.textContent = "0";
        statBelowMinimum.textContent = "0";
        statMonitored.textContent = "0";
    }

    // =====================================================
    // 5. KONDISI KOSONG
    // =====================================================

    function renderEmptyState(message, monitoredCount = 0) {
        resetStatistics();

        statMonitored.textContent = formatNumber(monitoredCount);

        priorityBody.replaceChildren();

        const row = document.createElement("tr");
        row.className = "no-apriori-result";

        const cell = document.createElement("td");
        cell.colSpan = 4;
        cell.textContent = message;
        cell.className = "empty-state-cell";

        row.appendChild(cell);
        priorityBody.appendChild(row);
    }

    // =====================================================
    // 6. MEMBUAT SEL TABEL
    // =====================================================

    function appendCell(row, value, className = "") {
        const cell = document.createElement("td");

        cell.textContent = value;

        if (className) {
            cell.className = className;
        }

        row.appendChild(cell);

        return cell;
    }

    // =====================================================
    // 7. MENGAMBIL HASIL ANALISIS APRIORI TERAKHIR
    // =====================================================

    async function getAprioriResults() {
        const response = await apiRequest(
            "pemilik/apriori/latest"
        );

        return getResponseData(response);
    }

    // =====================================================
    // 8. MENGAMBIL DATA PRODUK
    //    HANYA UNTUK INFORMASI STOK DAN BATAS MINIMUM
    // =====================================================

    async function getProducts() {
        const response = await apiRequest(
            "pemilik/stock/priority"
        );

        const data = getResponseData(response);

        if (!Array.isArray(data)) {
            throw new Error(
                "Format data produk dari API tidak valid."
            );
        }

        return data.map(normalizeProduct);
    }

    // =====================================================
    // 9. MEMILIH ATURAN DENGAN LIFT TERTINGGI
    // =====================================================

    function getHighestLiftRules(rules) {
        if (!Array.isArray(rules) || rules.length === 0) {
            return [];
        }

        const validRules = rules.filter(function (rule) {
            return (
                Array.isArray(rule.antecedent) &&
                Array.isArray(rule.consequent) &&
                rule.antecedent.length > 0 &&
                rule.consequent.length > 0 &&
                rule.lift !== null &&
                rule.lift !== "" &&
                Number.isFinite(Number(rule.lift))
            );
        });

        if (validRules.length === 0) {
            return [];
        }

        // Mencari nilai Lift tertinggi.
        const highestLift = Math.max(
            ...validRules.map(function (rule) {
                return Number(rule.lift);
            })
        );

        // Mengambil hanya aturan dengan Lift tertinggi.
        // Jika nilainya sama, seluruh aturan tetap ditampilkan.
        return validRules.filter(function (rule) {
            return Number(rule.lift) === highestLift;
        });
    }

    // =====================================================
    // 10. MEMBENTUK PRODUK REKOMENDASI
    // =====================================================


    function buildRecommendations(highestRules, products) {
        const recommendations = new Map();

        highestRules.forEach(function (rule) {

            // Menggabungkan produk Jika dan Maka.
            const allProducts = [
                ...rule.antecedent,
                ...rule.consequent
            ];

            allProducts.forEach(function (productName) {

                // Mencocokkan produk dengan data stok.
                const matchedProduct = products.find(function (product) {
                    return isSameProduct(
                        productName,
                        product.name
                    );
                });

                const key = matchedProduct
                    ? String(matchedProduct.id)
                    : normalizeName(productName);

                // Setiap produk hanya ditampilkan satu kali.
                if (!recommendations.has(key)) {
                    recommendations.set(key, {
                        name: matchedProduct?.name || productName,
                        stock: matchedProduct?.stock ?? null,
                        minimum: matchedProduct?.minimum ?? null
                    });
                }
            });
        });

        return Array.from(recommendations.values());
    }


    // =====================================================
    // 11. MENAMPILKAN REKOMENDASI
    // =====================================================

    function renderRecommendations(recommendations, monitoredCount) {
        priorityBody.replaceChildren();

        let belowMinimumCount = 0;

        recommendations.forEach(function (product) {
            const row = document.createElement("tr");

            appendCell(row, product.name);

            appendCell(
                row,
                product.stock !== null &&
                    Number.isFinite(product.stock)
                    ? formatNumber(product.stock)
                    : "-"
            );

            appendCell(
                row,
                product.minimum !== null &&
                    Number.isFinite(product.minimum)
                    ? formatNumber(product.minimum)
                    : "-"
            );

            appendCell(
                row,
                "Tertinggi",
                "stock-priority highest"
            );

            priorityBody.appendChild(row);

            if (
                Number.isFinite(product.stock) &&
                Number.isFinite(product.minimum) &&
                product.stock < product.minimum
            ) {
                belowMinimumCount++;
            }
        });

        // Statistik mengikuti produk yang direkomendasikan Apriori.
        statPriority.textContent = formatNumber(
            recommendations.length
        );

        statBelowMinimum.textContent = formatNumber(
            belowMinimumCount
        );

        // Total produk aktif yang tersedia untuk dipantau.
        statMonitored.textContent = formatNumber(
            monitoredCount
        );
    }

    // =====================================================
    // 12. PROSES UTAMA PRIORITAS STOK
    // =====================================================

    async function initializeStockPriority() {
        if (isLoading) {
            return;
        }

        isLoading = true;

        try {
            resetStatistics();

            // Mengambil hasil analisis terakhir dan data produk.
            const [analysis, products] = await Promise.all([
                getAprioriResults(),
                getProducts()
            ]);

            const productList = Array.isArray(products)
                ? products
                : [];

            const monitoredCount = productList.length;

            /*
             * Backend mengembalikan:
             *
             * Jika belum ada analisis:
             * {
             *     "analysis": null
             * }
             *
             * Jika sudah ada analisis:
             * {
             *     "id_analisis_apriori": ...,
             *     "tanggal_analisis": ...,
             *     "aturan": [...]
             * }
             */

            if (
                !analysis ||
                analysis.analysis === null
            ) {
                renderEmptyState(
                    "Belum dilakukan analisis Apriori.",
                    monitoredCount
                );

                return;
            }

            const rules = Array.isArray(analysis.aturan)
                ? analysis.aturan
                : [];

            if (rules.length === 0) {
                renderEmptyState(
                    "Belum ada hasil aturan asosiasi dari analisis Apriori.",
                    monitoredCount
                );

                return;
            }

            // Memilih aturan dengan nilai Lift tertinggi.
            const highestRules = getHighestLiftRules(rules);

            if (highestRules.length === 0) {
                renderEmptyState(
                    "Belum ada hasil aturan asosiasi dari analisis Apriori.",
                    monitoredCount
                );

                return;
            }

            // Produk yang ditampilkan hanya berasal dari consequent.
            const recommendations = buildRecommendations(
                highestRules,
                productList
            );

            if (recommendations.length === 0) {
                renderEmptyState(
                    "Tidak ada produk rekomendasi dari hasil analisis Apriori.",
                    monitoredCount
                );

                return;
            }

            renderRecommendations(
                recommendations,
                monitoredCount
            );

            console.log("Prioritas Stok berhasil dimuat:", {
                idAnalisis: analysis.id_analisis_apriori,
                tanggalAnalisis: analysis.tanggal_analisis,
                liftTertinggi: Number(highestRules[0].lift),
                jumlahAturan: highestRules.length,
                jumlahProdukPrioritas: recommendations.length
            });

        } catch (error) {
            console.error(
                "Gagal memuat Prioritas Stok:",
                error
            );

            renderEmptyState(
                "Data analisis Apriori gagal dimuat. Silakan muat ulang halaman."
            );

        } finally {
            isLoading = false;
        }
    }

    // =====================================================
    // 13. PEMBARUAN DATA
    // =====================================================

    window.addEventListener(
        "pageshow",
        initializeStockPriority
    );

    document.addEventListener(
        "visibilitychange",
        function () {
            if (!document.hidden) {
                initializeStockPriority();
            }
        }
    );

    // =====================================================
    // 14. JALANKAN PROGRAM
    // =====================================================

    renderEmptyState("Memuat data prioritas stok...");

    initializeStockPriority();

    console.log(
        "Prioritas Stok berbasis hasil analisis Apriori berhasil dimuat."
    );

});
