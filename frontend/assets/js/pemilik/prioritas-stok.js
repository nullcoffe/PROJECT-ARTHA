document.addEventListener("DOMContentLoaded", function () {

    // 1. Mengambil elemen HTML
    const statCards = document.querySelectorAll(".stock-stat-card");
    const table = document.querySelector(".stock-table");
    const tableBody = table?.querySelector("tbody");

    if (statCards.length < 3 || !tableBody) {
        console.error("Elemen Prioritas Stok tidak ditemukan.");
        return;
    }

    // 2. Konfigurasi penyimpanan hasil Apriori
    const STORAGE_KEY = "artha_apriori_results";

    // 3. Mengambil elemen statistik
    const statPriority = statCards[0].querySelector("h2");
    const statBelowMinimum = statCards[1].querySelector("h2");
    const statMonitored = statCards[2].querySelector("h2");

    if (!statPriority || !statBelowMinimum || !statMonitored) {
        console.error("Elemen statistik Prioritas Stok tidak lengkap.");
        return;
    }

    // 4. Menyimpan referensi baris produk awal
    const productRows = Array.from(
        tableBody.querySelectorAll("tr")
    ).filter(function (row) {
        return row.querySelectorAll("td").length >= 4;
    });

    // 5. Format angka
    function formatNumber(value) {
        return Number(value).toLocaleString("id-ID", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    // 6. Mengatur statistik kondisi awal
    function resetStatistics() {
        statPriority.textContent = "0";
        statBelowMinimum.textContent = "0";
        statMonitored.textContent = "0";
    }

    // 7. Menampilkan pesan kondisi kosong
    function renderEmptyState(message) {

        productRows.forEach(function (row) {
            row.hidden = true;

            const priorityCell = row.querySelector("td:last-child");

            if (priorityCell) {
                priorityCell.innerHTML = "";
            }
        });

        const oldMessage = tableBody.querySelector(".no-apriori-result");

        if (oldMessage) {
            oldMessage.remove();
        }

        const row = document.createElement("tr");
        row.className = "no-apriori-result";

        const cell = document.createElement("td");
        cell.colSpan = 4;
        cell.textContent = message;
        cell.style.textAlign = "center";
        cell.style.padding = "25px";

        row.appendChild(cell);
        tableBody.appendChild(row);

        resetStatistics();
    }

    // 8. Mengambil hasil analisis Apriori
    function getAprioriResults() {

        try {

            const saved = localStorage.getItem(STORAGE_KEY);

            if (!saved) {
                return null;
            }

            const results = JSON.parse(saved);

            if (
                !results ||
                typeof results !== "object" ||
                !Array.isArray(results.rules) ||
                !results.year ||
                !results.analyzedAt ||
                !Number.isFinite(Number(results.minimumSupport)) ||
                !Number.isFinite(Number(results.minimumConfidence)) ||
                !Number.isFinite(Number(results.totalTransactions))
            ) {
                console.error("Format hasil analisis Apriori tidak valid.");
                return null;
            }

            return results;

        } catch (error) {

            console.error(
                "Gagal membaca hasil Apriori:",
                error
            );

            return null;

        }
    }

    // 9. Menormalisasi nama produk
    function normalizeName(name) {
        return String(name)
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "");
    }

    // 10. Mengambil data produk dan stok dari tabel
    function getAllProducts() {

        return productRows.map(function (row) {

            const cells = row.querySelectorAll("td");

            if (cells.length < 4) {
                return null;
            }

            const name = cells[0].textContent.trim();

            const stock = Number(
                cells[1].textContent.trim().replace(",", ".")
            );

            const minimum = Number(
                cells[2].textContent.trim().replace(",", ".")
            );

            if (
                !name ||
                !Number.isFinite(stock) ||
                !Number.isFinite(minimum) ||
                stock < 0 ||
                minimum < 0
            ) {
                return null;
            }

            return {
                name: name,
                normalizedName: normalizeName(name),
                stock: stock,
                minimum: minimum,
                row: row
            };

        }).filter(Boolean);

    }

    // 11. Mencocokkan nama produk dengan hasil Apriori
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

    // 12. Menghitung kekuatan aturan berdasarkan Support, Confidence, dan Lift
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

    // 13. Menghitung skor permintaan produk berdasarkan aturan Apriori
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

    // 14. Memeriksa apakah produk termasuk rekomendasi Apriori
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

    // 15. Menghitung tingkat urgensi berdasarkan kondisi stok
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

    // 16. Menghitung skor akhir prioritas stok
    function calculatePriorityScore(product, aprioriScore) {

        const stockUrgency = calculateStockUrgency(product);

        if (aprioriScore === 0) {
            return stockUrgency * 100;
        }

        const finalScore =
            (stockUrgency * 0.60) +
            (aprioriScore * 0.40);

        return finalScore * 100;
    }

    // 17. Menentukan kategori prioritas berdasarkan skor
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

    // 18. Menganalisis produk berdasarkan hasil Apriori dan kondisi stok
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

    // 19. Menampilkan kategori prioritas pada tabel produk
    function renderPriority(products) {

        products.forEach(function (product) {

            const priorityCell = product.row.querySelector("td:last-child");

            if (!priorityCell) {
                return;
            }

            priorityCell.innerHTML = "";

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

    // 20. Memperbarui statistik prioritas stok
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

    // 21. Mengurutkan produk berdasarkan skor prioritas tertinggi
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

    // 22. Menampilkan hasil analisis prioritas stok
    function initializeStockPriority() {

        // Mengambil hasil Apriori terakhir
        const aprioriResults = getAprioriResults();

        // Jika belum pernah melakukan analisis
        if (!aprioriResults) {

            renderEmptyState(
                "Belum ada hasil analisis Apriori. Jalankan analisis terlebih dahulu untuk menampilkan prioritas stok."
            );

            console.log(
                "Prioritas Stok: Menunggu hasil analisis Apriori."
            );

            return;
        }

        // Mengambil seluruh produk
        const products = getAllProducts();

        if (products.length === 0) {

            renderEmptyState(
                "Data produk dan stok belum tersedia."
            );

            console.warn(
                "Data produk tidak ditemukan."
            );

            return;
        }

        // Menghitung hasil analisis
        const analyzedProducts = analyzeProducts(
            products,
            aprioriResults
        );

        // Memilih produk yang direkomendasikan Apriori
        // dan memiliki stok di bawah batas minimum
        const priorityProducts = analyzedProducts.filter(
            function (product) {

                return (
                    product.aprioriMatched &&
                    product.stock < product.minimum
                );

            }
        );

        // Menghapus pesan kosong sebelumnya
        const oldMessage = tableBody.querySelector(".no-apriori-result");

        if (oldMessage) {
            oldMessage.remove();
        }

        // Menyembunyikan semua baris sebelum menampilkan hasil terbaru
        products.forEach(function (product) {
            product.row.hidden = true;
        });

        // Jika analisis sudah dilakukan tetapi tidak ada rekomendasi
        if (priorityProducts.length === 0) {

            renderEmptyState(
                "Analisis Apriori sudah dilakukan, tetapi tidak ditemukan produk yang memenuhi kriteria prioritas penambahan stok."
            );

            // Memperbarui jumlah item yang dipantau dan stok di bawah minimum
            const belowMinimum = products.filter(function (product) {
                return product.stock < product.minimum;
            }).length;

            statPriority.textContent = "0";
            statBelowMinimum.textContent = belowMinimum;
            statMonitored.textContent = products.length;

            console.log(
                "Analisis selesai. Tidak ada produk yang memenuhi kriteria prioritas stok."
            );

            return;
        }

        // Menampilkan hanya baris produk yang direkomendasikan
        priorityProducts.forEach(function (product) {
            product.row.hidden = false;
        });

        // Menampilkan badge prioritas
        renderPriority(priorityProducts);

        // Mengurutkan produk berdasarkan skor prioritas
        sortProducts(priorityProducts);

        // Memperbarui statistik
        const statistics = renderStatistics(
            products,
            priorityProducts
        );

        // Mencatat hasil analisis
        console.log("Analisis Prioritas Stok:", {

            tahun: aprioriResults.year,

            totalTransaksi: aprioriResults.totalTransactions,

            minimumSupport: aprioriResults.minimumSupport,

            minimumConfidence: aprioriResults.minimumConfidence,

            totalProduk: statistics.totalProducts,

            produkRekomendasiApriori: priorityProducts.length,

            prioritasTinggi: statistics.highPriority,

            produk: priorityProducts.map(function (product) {

                return {
                    nama: product.name,
                    stok: product.stock,
                    minimum: product.minimum,
                    skorApriori: product.demandScore,
                    skorPrioritas: product.score.toFixed(2),
                    prioritas: product.priority.label
                };

            })

        });

    }

    // 23. Memperbarui hasil ketika localStorage berubah
    window.addEventListener("storage", function (event) {

        if (
            event.key === STORAGE_KEY ||
            event.key === null
        ) {
            initializeStockPriority();
        }

    });

    // 24. Memperbarui hasil ketika pengguna kembali ke halaman
    window.addEventListener("pageshow", function () {

        initializeStockPriority();

    });

    // 25. Memperbarui hasil ketika tab browser kembali aktif
    window.addEventListener("focus", function () {

        initializeStockPriority();

    });

    document.addEventListener("visibilitychange", function () {

        if (!document.hidden) {
            initializeStockPriority();
        }

    });

    // 26. Menjalankan inisialisasi pertama halaman
    initializeStockPriority();

    console.log(
        "JavaScript Prioritas Stok berhasil dijalankan."
    );

});
