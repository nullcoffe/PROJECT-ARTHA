document.addEventListener("DOMContentLoaded", function () {

    // 1. Mengambil elemen HTML
    const promoList = document.getElementById("promo-package-list");
    const promoDescription = document.getElementById("promo-package-description");

    const STORAGE_KEY = "artha_apriori_results";

    if (!promoList || !promoDescription) {
        console.error("Elemen Paket Promosi tidak ditemukan.");
        return;
    }

    // 2. Format angka Indonesia
    function formatNumber(value, digits = 2) {

        const number = Number(value);

        if (!Number.isFinite(number)) {
            return "0,00";
        }

        return number.toLocaleString("id-ID", {
            minimumFractionDigits: digits,
            maximumFractionDigits: digits
        });

    }

    // 3. Mengamankan teks HTML
    function escapeHTML(value) {

        return String(value).replace(/[&<>"']/g, function (character) {

            const entities = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            };

            return entities[character];

        });

    }

    // 4. Menampilkan kondisi tanpa hasil analisis
    function renderEmpty(message) {

        promoDescription.hidden = true;

        promoList.innerHTML = `
            <div class="promo-package-empty">
                ${escapeHTML(message)}
            </div>
        `;

    }

    // 5. Membaca hasil analisis terakhir
    function getAnalysisResults() {

        try {

            const savedResults = localStorage.getItem(STORAGE_KEY);

            if (!savedResults) {
                return null;
            }

            const results = JSON.parse(savedResults);

            // Memeriksa kelengkapan data hasil analisis
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
                "Gagal membaca hasil analisis Apriori:",
                error
            );

            return null;

        }

    }

    // 6. Memvalidasi aturan asosiasi
    function isValidRule(rule) {

        return (
            rule &&
            Array.isArray(rule.antecedent) &&
            Array.isArray(rule.consequent) &&
            rule.antecedent.length > 0 &&
            rule.consequent.length > 0 &&
            rule.antecedent.every(function (item) {
                return typeof item === "string" && item.trim() !== "";
            }) &&
            rule.consequent.every(function (item) {
                return typeof item === "string" && item.trim() !== "";
            }) &&
            Number.isFinite(Number(rule.support)) &&
            Number.isFinite(Number(rule.confidence)) &&
            Number.isFinite(Number(rule.lift))
        );

    }

    // 7. Membentuk kandidat paket dari aturan asosiasi
    function generatePackages(rules) {

        return rules

            .filter(isValidRule)

            .map(function (rule) {

                const products = [
                    ...new Set([
                        ...rule.antecedent,
                        ...rule.consequent
                    ])
                ];

                return {
                    products: products,
                    support: Number(rule.support),
                    confidence: Number(rule.confidence),
                    lift: Number(rule.lift)
                };

            });

    }

    // 8. Menampilkan kandidat paket promosi
    function renderPromoPackages() {

        const results = getAnalysisResults();

        // Belum pernah ada hasil analisis
        if (!results) {

            renderEmpty(
                "Belum ada hasil analisis Apriori. Silakan jalankan analisis terlebih dahulu."
            );

            console.log(
                "Paket Promosi: Belum ada hasil analisis."
            );

            return;

        }

        // Membentuk paket berdasarkan hasil analisis terakhir
        const packages = generatePackages(results.rules);

        // Analisis berhasil tetapi tidak menghasilkan aturan valid
        if (packages.length === 0) {

            renderEmpty(
                "Analisis Apriori sudah dilakukan, tetapi tidak ditemukan kandidat paket promosi yang memenuhi parameter analisis."
            );

            console.log(
                "Paket Promosi: Tidak ditemukan kandidat paket."
            );

            return;

        }

        // Menampilkan deskripsi setelah analisis berhasil
        promoDescription.hidden = false;

        promoDescription.textContent =
            "Kandidat promosi berdasarkan hasil analisis Apriori periode " +
            results.year +
            " dengan " +
            results.totalTransactions +
            " transaksi.";

        // Membentuk seluruh kartu paket
        let html = "";

        packages.forEach(function (item, index) {

            const productNames = item.products
                .map(function (product) {
                    return escapeHTML(product);
                })
                .join(" + ");

            html += `
                <article class="promo-item">

                    <h3>
                        Paket Promosi ${index + 1}
                    </h3>

                    <p class="promo-product">
                        ${productNames}
                    </p>

                    <p class="promo-metric">
                        Support ${formatNumber(item.support)}%
                        | Confidence ${formatNumber(item.confidence)}%
                        | Lift ${formatNumber(item.lift)}
                    </p>

                </article>
            `;

        });

        // Memperbarui seluruh kandidat paket
        promoList.innerHTML = html;

        console.log("Kandidat Paket Promosi berhasil diperbarui:", {
            tahun: results.year,
            totalTransaksi: results.totalTransactions,
            minimumSupport: results.minimumSupport,
            minimumConfidence: results.minimumConfidence,
            totalKandidat: packages.length,
            waktuAnalisis: results.analyzedAt
        });

    }

    // 9. Menampilkan hasil ketika halaman pertama kali dibuka
    renderPromoPackages();

    // 10. Memperbarui hasil jika penyimpanan berubah
    window.addEventListener("storage", function (event) {

        if (event.key === STORAGE_KEY || event.key === null) {
            renderPromoPackages();
        }

    });

    // 11. Memastikan hasil tetap tampil ketika kembali ke halaman
    window.addEventListener("pageshow", function () {

        renderPromoPackages();

    });

    console.log(
        "JavaScript Paket Promosi berhasil dijalankan."
    );

});
