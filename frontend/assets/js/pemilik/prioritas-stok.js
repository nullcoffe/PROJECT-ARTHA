document.addEventListener("DOMContentLoaded", function () {

    // =====================================================
    // 1. MENGAMBIL ELEMEN HTML
    // =====================================================

    const statCards = document.querySelectorAll(".stock-stat-card");
    const table = document.querySelector(".stock-table");
    const tableBody = table?.querySelector("tbody");

    if (statCards.length < 3 || !tableBody) {
        console.error("Elemen Prioritas Stok tidak ditemukan.");
        return;
    }

    const API_BASE = "/artha/backend/api/";

    let productsData = [];
    let isLoading = false;

    const statPriority = statCards[0].querySelector("h2");
    const statBelowMinimum = statCards[1].querySelector("h2");
    const statMonitored = statCards[2].querySelector("h2");

    if (!statPriority || !statBelowMinimum || !statMonitored) {
        console.error("Elemen statistik tidak lengkap.");
        return;
    }

    // =====================================================
    // 2. FUNGSI REQUEST API
    // =====================================================

    async function apiRequest(endpoint) {

        const response = await fetch(
            API_BASE + String(endpoint).replace(/^\/+/, ""),
            {
                method: "GET",
                credentials: "same-origin",
                headers: {
                    Accept: "application/json"
                }
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

        console.log("HTTP STATUS PRIORITAS STOK:", response.status);

        return result;
    }

    function getResponseData(result) {

        if (!result || typeof result !== "object") {
            return null;
        }

        return result.data ?? result.payload ?? null;
    }

    // =====================================================
    // 3. FORMAT DAN NORMALISASI DATA
    // =====================================================

    function formatNumber(value, digits = 0) {

        const number = Number(value);

        if (!Number.isFinite(number)) {
            return "0";
        }

        return number.toLocaleString("id-ID", {
            minimumFractionDigits: digits,
            maximumFractionDigits: digits
        });
    }

    function normalizeProduct(data) {

        return {
            id: Number(data.id_produk),
            code: String(data.kode_produk ?? ""),
            name: String(data.nama_produk ?? ""),
            unit: String(data.satuan ?? ""),
            stock: Number(data.stok),
            minimum: Number(data.stok_minimum)
        };
    }

    function normalizeName(name) {

        return String(name)
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "");
    }

    // =====================================================
    // 4. STATISTIK DAN KONDISI KOSONG
    // =====================================================

    function resetStatistics() {

        statPriority.textContent = "0";
        statBelowMinimum.textContent = "0";
        statMonitored.textContent = "0";
    }

    function renderEmptyState(message) {

        tableBody.replaceChildren();

        const row = document.createElement("tr");
        row.className = "no-apriori-result";

        const cell = document.createElement("td");

        cell.colSpan = 4;
        cell.textContent = message;
        cell.style.textAlign = "center";
        cell.style.padding = "25px";

        row.appendChild(cell);
        tableBody.appendChild(row);

    }

    // =====================================================
    // 5. MENGAMBIL HASIL ANALISIS APRIORI DARI DATABASE
    // =====================================================

    async function getAprioriResults() {

        try {

            const response = await apiRequest(
                "pemilik/apriori/latest"
            );

            const data = getResponseData(response);

            if (
                !data ||
                !Array.isArray(data.aturan)
            ) {
                console.warn(
                    "Belum ada hasil analisis Apriori yang tersedia."
                );

                return {
                    rules: [],
                    year: null,
                    totalTransactions: 0
                };
            }

            const rules = data.aturan.map(function (rule) {

                return {
                    antecedent: Array.isArray(rule.antecedent)
                        ? rule.antecedent
                        : [],

                    consequent: Array.isArray(rule.consequent)
                        ? rule.consequent
                        : [],

                    support: Number(rule.support) || 0,
                    confidence: Number(rule.confidence) || 0,
                    lift: Number(rule.lift) || 0
                };

            });

            const results = {
                rules: rules,
                year: Number(data.tahun),
                analyzedAt: data.tanggal_analisis,
                minimumSupport: Number(data.minimum_support),
                minimumConfidence: Number(data.minimum_confidence),
                totalTransactions: Number(data.jumlah_transaksi)
            };

            console.log(
                "Hasil Apriori berhasil diambil dari database:",
                results
            );

            return results;

        } catch (error) {

            console.error(
                "Gagal mengambil hasil Apriori:",
                error
            );

            // Prioritas stok tetap dapat dihitung
            // berdasarkan kondisi stok aktual.
            return {
                rules: [],
                year: null,
                totalTransactions: 0
            };

        }
    }

    // =====================================================
    // 6. MEMBENTUK BARIS PRODUK
    // =====================================================

    function getAllProducts() {

        tableBody.replaceChildren();

        return productsData.map(function (product) {

            const row = document.createElement("tr");

            const nameCell = document.createElement("td");
            const stockCell = document.createElement("td");
            const minimumCell = document.createElement("td");
            const priorityCell = document.createElement("td");

            nameCell.textContent = product.name;
            stockCell.textContent = formatNumber(product.stock);
            minimumCell.textContent = formatNumber(product.minimum);

            row.appendChild(nameCell);
            row.appendChild(stockCell);
            row.appendChild(minimumCell);
            row.appendChild(priorityCell);

            return {
                ...product,
                normalizedName: normalizeName(product.name),
                row: row
            };

        });

    }

    // =====================================================
    // 7. MENCOCOKKAN PRODUK DENGAN ATURAN APRIORI
    // =====================================================

    function isSameProduct(aprioriName, stockProduct) {

        const apriori = normalizeName(aprioriName);
        const stock = stockProduct.normalizedName;

        if (!apriori || !stock) {
            return false;
        }

        if (apriori === stock) {
            return true;
        }

        if (apriori.length >= 4 && stock.includes(apriori)) {
            return true;
        }

        if (stock.length >= 4 && apriori.includes(stock)) {
            return true;
        }

        return false;
    }

    // =====================================================
    // 8. MENGHITUNG KEKUATAN ATURAN APRIORI
    // =====================================================

    function calculateRuleStrength(rule) {

        const support = Number(rule.support) || 0;
        const confidence = Number(rule.confidence) || 0;
        const lift = Number(rule.lift) || 0;

        if (lift <= 1) {
            return 0;
        }

        const normalizedLift = Math.min(lift, 3) / 3;

        const score =
            (support / 100 * 0.25) +
            (confidence / 100 * 0.50) +
            (normalizedLift * 0.25);

        return Math.min(Math.max(score, 0), 1);
    }

    // =====================================================
    // 9. MENGHITUNG PERMINTAAN PRODUK BERDASARKAN APRIORI
    // =====================================================

    function calculateAprioriDemand(product, rules) {

        if (!rules || rules.length === 0) {
            return 0;
        }

        let totalScore = 0;
        let totalWeight = 0;

        rules.forEach(function (rule) {

            if (
                !Array.isArray(rule.consequent) ||
                !Array.isArray(rule.antecedent)
            ) {
                return;
            }

            const matched = rule.consequent.some(function (item) {

                return isSameProduct(item, product);

            });

            if (!matched) {
                return;
            }

            const strength = calculateRuleStrength(rule);

            if (strength <= 0) {
                return;
            }

            const weight = Number(rule.support) || 0;

            totalScore += strength * weight;
            totalWeight += weight;

        });

        return totalWeight === 0
            ? 0
            : totalScore / totalWeight;
    }

    function hasAprioriRecommendation(product, rules) {

        return rules.some(function (rule) {

            if (!Array.isArray(rule.consequent)) {
                return false;
            }

            const matched = rule.consequent.some(function (item) {

                return isSameProduct(item, product);

            });

            return matched && calculateRuleStrength(rule) > 0;

        });

    }

    // =====================================================
    // 10. MENGHITUNG URGENSI STOK
    // =====================================================

    function calculateStockUrgency(product) {

        if (product.minimum === 0) {
            return product.stock === 0 ? 1 : 0;
        }

        const ratio = product.stock / product.minimum;

        if (ratio <= 0) {
            return 1;
        }

        if (ratio < 1) {
            return 1 - ratio;
        }

        return 0;
    }

    // =====================================================
    // 11. MENGHITUNG SKOR PRIORITAS
    // =====================================================

    function calculatePriorityScore(product, aprioriScore) {

        let stockUrgency = calculateStockUrgency(product);

        if (product.stock < product.minimum) {
            stockUrgency = Math.max(stockUrgency, 0.35);
        }

        if (aprioriScore === 0) {
            return stockUrgency * 100;
        }

        const finalScore =
            (stockUrgency * 0.60) +
            (aprioriScore * 0.40);

        return finalScore * 100;
    }

    // =====================================================
    // 12. MENENTUKAN KATEGORI PRIORITAS
    // =====================================================

    function determinePriority(product) {

        if (product.score >= 60) {

            return {
                level: "high",
                label: "Tinggi",
                rank: 1
            };

        }

        if (product.score >= 30) {

            return {
                level: "medium",
                label: "Sedang",
                rank: 2
            };

        }

        return {
            level: "safe",
            label: "Aman",
            rank: 3
        };

    }

    // =====================================================
    // 13. ANALISIS SELURUH PRODUK
    // =====================================================

    function analyzeProducts(products, aprioriResults) {

        const rules = aprioriResults?.rules || [];

        return products.map(function (product) {

            const demandScore = calculateAprioriDemand(
                product,
                rules
            );

            const urgency = calculateStockUrgency(product);

            const score = calculatePriorityScore(
                product,
                demandScore
            );

            const aprioriMatched = hasAprioriRecommendation(
                product,
                rules
            );

            return {
                ...product,
                demandScore: demandScore,
                stockUrgency: urgency,
                score: score,
                aprioriMatched: aprioriMatched,
                priority: determinePriority({
                    score: score
                })
            };

        });

    }

    // =====================================================
    // 14. MENAMPILKAN BADGE PRIORITAS
    // =====================================================

    function renderPriority(products) {

        products.forEach(function (product) {

            const priorityCell = product.row.querySelector("td:last-child");

            if (!priorityCell) {
                return;
            }

            priorityCell.replaceChildren();

            const badge = document.createElement("span");

            badge.className =
                "stock-priority " + product.priority.level;

            badge.textContent = product.priority.label;

            badge.title =
                "Skor prioritas: " +
                formatNumber(product.score) +
                " | Skor permintaan Apriori: " +
                formatNumber(product.demandScore * 100);

            badge.setAttribute(
                "aria-label",
                "Prioritas " + product.priority.label
            );

            priorityCell.appendChild(badge);

        });

    }

    // =====================================================
    // 15. MEMPERBARUI STATISTIK
    // =====================================================

    function renderStatistics(products, priorityProducts) {

        const highPriority = priorityProducts.filter(function (product) {

            return product.priority.level === "high";

        }).length;

        const belowMinimum = products.filter(function (product) {

            return product.stock < product.minimum;

        }).length;

        statPriority.textContent = priorityProducts.length;
        statBelowMinimum.textContent = belowMinimum;
        statMonitored.textContent = products.length;

        return {
            highPriority: highPriority,
            belowMinimum: belowMinimum,
            totalProducts: products.length
        };

    }

    // =====================================================
    // 16. MENGURUTKAN PRODUK PRIORITAS
    // =====================================================

    function sortProducts(products) {

        const sorted = [...products].sort(function (a, b) {

            if (b.score !== a.score) {
                return b.score - a.score;
            }

            return a.stock - b.stock;

        });

        sorted.forEach(function (product) {

            tableBody.appendChild(product.row);

        });

    }

    // =====================================================
    // 17. PROSES UTAMA PRIORITAS STOK
    // =====================================================

    async function initializeStockPriority() {

        if (isLoading) {
            return;
        }

        isLoading = true;

        try {

            // Mengambil data Apriori dari database.
            const aprioriResults = await getAprioriResults();

            // Mengambil data produk dari database.
            const result = await apiRequest(
                "pemilik/stock/priority"
            );

            const data = getResponseData(result);

            if (!Array.isArray(data)) {

                throw new Error(
                    "Format data produk dari API tidak valid."
                );

            }

            productsData = data.map(normalizeProduct);

            console.log(
                "Data produk berhasil dimuat:",
                productsData
            );

            // Membentuk data produk beserta baris tabel.
            const products = getAllProducts();

            if (products.length === 0) {

                renderEmptyState(
                    "Belum terdapat produk aktif dalam database."
                );

                resetStatistics();

                return;

            }

            // Menganalisis stok dan aturan Apriori.
            const analyzedProducts = analyzeProducts(
                products,
                aprioriResults
            );

            // PENTING:
            // Semua produk di bawah stok minimum ditampilkan.
            // Kecocokan Apriori hanya memengaruhi skor,
            // bukan menjadi syarat wajib untuk ditampilkan.

            const priorityProducts = analyzedProducts.filter(
                function (product) {

                    return product.stock < product.minimum;

                }
            );

            // Jika tidak ada produk di bawah minimum.
            if (priorityProducts.length === 0) {

                renderEmptyState(
                    "Tidak ada produk yang stoknya berada di bawah batas minimum."
                );

                statPriority.textContent = "0";
                statBelowMinimum.textContent = "0";
                statMonitored.textContent = products.length;

                console.log(
                    "Semua stok produk masih berada dalam batas aman."
                );

                return;

            }

            // Menampilkan badge prioritas.
            renderPriority(priorityProducts);

            // Mengurutkan produk berdasarkan skor.
            sortProducts(priorityProducts);

            // Memperbarui statistik dashboard.
            const statistics = renderStatistics(
                products,
                priorityProducts
            );

            // Mencatat hasil analisis.
            console.log("Analisis Prioritas Stok berhasil:", {

                tahun: aprioriResults.year,

                totalTransaksi: aprioriResults.totalTransactions,

                totalProduk: statistics.totalProducts,

                produkPrioritas: priorityProducts.length,

                produkDiBawahMinimum: statistics.belowMinimum,

                prioritasTinggi: statistics.highPriority,

                produk: priorityProducts.map(function (product) {

                    return {

                        idProduk: product.id,

                        nama: product.name,

                        stok: product.stock,

                        minimum: product.minimum,

                        cocokApriori: product.aprioriMatched,

                        skorApriori: product.demandScore,

                        skorPrioritas: product.score.toFixed(2),

                        prioritas: product.priority.label

                    };

                })

            });

        } catch (error) {

            console.error(
                "Gagal memuat Prioritas Stok:",
                error
            );

            renderEmptyState(
                "Gagal mengambil data prioritas stok. Silakan muat ulang halaman."
            );

            resetStatistics();

        } finally {

            isLoading = false;

        }

    }

    // =====================================================
    // 18. MEMPERBARUI DATA SAAT HALAMAN DIBUKA KEMBALI
    // =====================================================

    window.addEventListener("pageshow", function () {

        initializeStockPriority();

    });

    document.addEventListener("visibilitychange", function () {

        if (!document.hidden) {
            initializeStockPriority();
        }

    });

    // =====================================================
    // 19. MENJALANKAN PROGRAM
    // =====================================================

    initializeStockPriority();

    console.log(
        "JavaScript Prioritas Stok berhasil dijalankan."
    );

});