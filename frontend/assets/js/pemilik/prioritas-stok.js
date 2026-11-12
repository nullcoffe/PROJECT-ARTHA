
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

    // 3. Mengambil hasil analisis Apriori
    function getAprioriResults() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (!saved) return null;

            const results = JSON.parse(saved);
            if (!results || !Array.isArray(results.rules)) return null;

            return results;
        } catch (error) {
            console.error("Gagal membaca hasil Apriori:", error);
            return null;
        }
    }

    // 4. Menormalisasi nama produk
    function normalizeName(name) {
        return String(name).toLowerCase().replace(/[^a-z0-9]/g, "");
    }

    // 5. Mengambil data produk dan stok dari tabel
    function getAllProducts() {
        return Array.from(tableBody.querySelectorAll("tr"))
            .map(function (row) {
                const cells = row.querySelectorAll("td");
                if (cells.length < 4) return null;

                const name = cells[0].textContent.trim();
                const stock = Number(cells[1].textContent.trim().replace(",", "."));
                const minimum = Number(cells[2].textContent.trim().replace(",", "."));

                if (!name || !Number.isFinite(stock) || !Number.isFinite(minimum) || stock < 0 || minimum < 0) {
                    return null;
                }

                return {
                    name: name,
                    normalizedName: normalizeName(name),
                    stock: stock,
                    minimum: minimum,
                    row: row
                };
            })
            .filter(Boolean);
    }

    // 6. Mencocokkan nama produk dengan hasil Apriori
    function isSameProduct(aprioriName, stockProduct) {
        const apriori = normalizeName(aprioriName);
        const stock = stockProduct.normalizedName;

        if (!apriori || !stock) return false;
        if (apriori === stock) return true;
        if (apriori.length >= 4 && stock.includes(apriori)) return true;
        if (stock.length >= 4 && apriori.includes(stock)) return true;

        return false;
    }

    // 7. Menghitung kekuatan aturan berdasarkan Support, Confidence, dan Lift
    function calculateRuleStrength(rule) {
        const support = Number(rule.support) || 0;
        const confidence = Number(rule.confidence) || 0;
        const lift = Number(rule.lift) || 0;

        if (lift <= 1) return 0;

        const normalizedLift = Math.min(lift, 3) / 3;
        const score = (support / 100 * 0.25) + (confidence / 100 * 0.50) + (normalizedLift * 0.25);

        return Math.min(Math.max(score, 0), 1);
    }

    // 8. Menghitung skor permintaan produk berdasarkan aturan Apriori
    function calculateAprioriDemand(product, rules) {
        if (!rules || rules.length === 0) return 0;

        let totalScore = 0;
        let totalWeight = 0;

        rules.forEach(function (rule) {
            if (!Array.isArray(rule.consequent) || !Array.isArray(rule.antecedent)) return;

            const matched = rule.consequent.some(function (item) {
                return isSameProduct(item, product);
            });

            if (!matched) return;

            const strength = calculateRuleStrength(rule);
            if (strength <= 0) return;

            const weight = Number(rule.support) || 0;
            totalScore += strength * weight;
            totalWeight += weight;
        });

        return totalWeight === 0 ? 0 : totalScore / totalWeight;
    }
    // Memeriksa apakah produk termasuk rekomendasi Apriori
    function hasAprioriRecommendation(product, rules) {
    return rules.some(function (rule) {
        if (!Array.isArray(rule.consequent)) return false;

        const matched = rule.consequent.some(function (item) {
            return isSameProduct(item, product);
        });

        return matched && calculateRuleStrength(rule) > 0;
    });
}

    // 9. Menghitung tingkat urgensi berdasarkan kondisi stok
    function calculateStockUrgency(product) {
        if (product.minimum === 0) return product.stock === 0 ? 1 : 0;

        const ratio = product.stock / product.minimum;

        if (ratio <= 0) return 1;
        if (ratio < 1) return 1 - ratio;

        return 0;
    }

    // 10. Menghitung skor akhir prioritas stok
    function calculatePriorityScore(product, aprioriScore) {
        const stockUrgency = calculateStockUrgency(product);

        if (aprioriScore === 0) return stockUrgency * 100;

        const finalScore = (stockUrgency * 0.60) + (aprioriScore * 0.40);

        return finalScore * 100;
    }

    // 11. Menentukan kategori prioritas berdasarkan skor
    function determinePriority(product) {
        if (product.score >= 60) {
            return { level: "high", label: "Tinggi", rank: 1 };
        }

        if (product.score >= 30) {
            return { level: "medium", label: "Sedang", rank: 2 };
        }

        return { level: "safe", label: "Aman", rank: 3 };
    }

    // 12. Menganalisis produk berdasarkan hasil Apriori dan kondisi stok
    function analyzeProducts(products, aprioriResults) {
        const rules = aprioriResults?.rules || [];

        return products.map(function (product) {
            const demandScore = calculateAprioriDemand(product, rules);
            const urgency = calculateStockUrgency(product);
            const score = calculatePriorityScore(product, demandScore);
            const aprioriMatched = hasAprioriRecommendation(product, rules);

            return {
                ...product,
                demandScore: demandScore,
                stockUrgency: urgency,
                score: score,
                aprioriMatched: aprioriMatched,
                priority: determinePriority({ score: score })
            };
        });
    }

    // 13. Menampilkan kategori prioritas pada tabel produk
    function renderPriority(products) {
        products.forEach(function (product) {
            const priorityCell = product.row.querySelector("td:last-child");
            if (!priorityCell) return;

            let badge = priorityCell.querySelector(".stock-priority");

            if (!badge) {
                badge = document.createElement("span");
                priorityCell.appendChild(badge);
            }

            badge.className = "stock-priority " + product.priority.level;
            badge.textContent = product.priority.label;
            badge.title = "Skor prioritas: " + product.score.toFixed(2) + " | Skor permintaan Apriori: " + (product.demandScore * 100).toFixed(2);
            badge.setAttribute("aria-label", "Prioritas " + product.priority.label);
        });
    }

    // 14. Memperbarui statistik prioritas stok
    function renderStatistics(products) {
        const highPriority = products.filter(p => p.priority.level === "high").length;
        const belowMinimum = products.filter(p => p.stock < p.minimum).length;

        statCards[0].querySelector("h2").textContent = highPriority;
        statCards[1].querySelector("h2").textContent = belowMinimum;
        statCards[2].querySelector("h2").textContent = products.length;
    }

    // 15. Mengurutkan produk berdasarkan skor prioritas tertinggi
    function sortProducts(products) {
        const sorted = [...products].sort(function (a, b) {
            if (b.score !== a.score) return b.score - a.score;
            return a.stock - b.stock;
        });

        sorted.forEach(function (product) {
            tableBody.appendChild(product.row);
        });
    }


    // 16. Menjalankan analisis dan menampilkan produk rekomendasi Apriori
    function initializeStockPriority() {
        const products = getAllProducts();

        if (products.length === 0) {
            console.warn("Data produk tidak ditemukan.");
            return;
        }

        const aprioriResults = getAprioriResults();
        const analyzedProducts = analyzeProducts(products, aprioriResults);

        // Memilih produk yang direkomendasikan Apriori dan stoknya di bawah minimum
        const priorityProducts = analyzedProducts.filter(function (product) {
            return product.aprioriMatched && product.stock < product.minimum;
        });

        // Menampilkan hanya baris produk yang memenuhi rekomendasi
        const priorityRows = new Set(priorityProducts.map(product => product.row));

        products.forEach(function (product) {
            product.row.hidden = !priorityRows.has(product.row);
        });

        // Menghapus pesan kosong sebelumnya
        const oldMessage = tableBody.querySelector(".no-apriori-result");
        if (oldMessage) oldMessage.remove();

        // Menampilkan pesan jika tidak ada rekomendasi
        if (priorityProducts.length === 0) {
            const row = document.createElement("tr");
            row.className = "no-apriori-result";

            const cell = document.createElement("td");
            cell.colSpan = 4;
            cell.textContent = "Tidak ada produk yang direkomendasikan untuk penambahan stok berdasarkan hasil analisis Apriori.";
            cell.style.textAlign = "center";
            cell.style.padding = "25px";

            row.appendChild(cell);
            tableBody.appendChild(row);
        }

        // Menampilkan dan mengurutkan produk prioritas
        renderPriority(priorityProducts);
        sortProducts(priorityProducts);

        // Memperbarui statistik
        const highPriority = priorityProducts.filter(p => p.priority.level === "high").length;
        const belowMinimum = analyzedProducts.filter(p => p.stock < p.minimum).length;

        statCards[0].querySelector("h2").textContent = priorityProducts.length;
        statCards[1].querySelector("h2").textContent = belowMinimum;
        statCards[2].querySelector("h2").textContent = products.length;

        console.log("Analisis Prioritas Stok:", {
            totalProduk: products.length,
            produkRekomendasiApriori: priorityProducts.length,
            prioritasTinggi: highPriority,
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

    // 17. Memperbarui prioritas stok secara otomatis ketika hasil Apriori berubah
    window.addEventListener("storage", function (event) {
        if (event.key === STORAGE_KEY) initializeStockPriority();
    });

    // Memperbarui data ketika pengguna kembali membuka halaman
    window.addEventListener("focus", initializeStockPriority);

    // Memperbarui data ketika halaman kembali terlihat
    document.addEventListener("visibilitychange", function () {
        if (!document.hidden) initializeStockPriority();
    });

    // Menjalankan inisialisasi pertama halaman
    initializeStockPriority();

});
