
document.addEventListener("DOMContentLoaded", function () {

    // 1. Mengambil elemen HTML
    const promoList = document.getElementById("promo-package-list");
    const promoDescription = document.getElementById("promo-package-description");

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

            const savedResults = localStorage.getItem(
                "artha_apriori_results"
            );

            if (!savedResults) {
                return null;
            }

            const results = JSON.parse(savedResults);

            if (
                !results ||
                !Array.isArray(results.rules) ||
                !results.year ||
                !results.analyzedAt
            ) {
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

    // 6. Membentuk kandidat paket dari aturan asosiasi
    function generatePackages(rules) {

        return rules

            .filter(function (rule) {

                return (
                    rule &&
                    Array.isArray(rule.antecedent) &&
                    Array.isArray(rule.consequent) &&
                    rule.antecedent.length > 0 &&
                    rule.consequent.length > 0 &&
                    Number.isFinite(Number(rule.confidence)) &&
                    Number.isFinite(Number(rule.lift))
                );

            })

            .map(function (rule) {

                const products = [
                    ...new Set([
                        ...rule.antecedent,
                        ...rule.consequent
                    ])
                ];

                return {
                    products: products,
                    confidence: Number(rule.confidence),
                    lift: Number(rule.lift)
                };

            });

    }

    // 7. Menampilkan kandidat paket promosi
    function renderPromoPackages() {

        const results = getAnalysisResults();

        // Belum pernah ada hasil analisis
        if (!results) {

            renderEmpty(
                "Belum ada hasil analisis Apriori. Silakan jalankan analisis terlebih dahulu."
            );

            return;

        }

        // Membentuk paket berdasarkan hasil analisis terakhir
        const packages = generatePackages(results.rules);

        // Analisis berhasil tetapi tidak menghasilkan aturan
        if (packages.length === 0) {

            renderEmpty(
                "Tidak ditemukan kandidat paket promosi yang memenuhi parameter analisis."
            );

            return;

        }

        // Menampilkan deskripsi hanya setelah analisis berhasil
        promoDescription.hidden = false;

        promoDescription.textContent =
            "Kandidat promosi disusun berdasarkan hasil analisis Apriori.";

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
                        Confidence ${formatNumber(item.confidence)}%
                        | Lift ${formatNumber(item.lift)}
                    </p>

                </article>
            `;

        });

        // Menampilkan seluruh kandidat
        promoList.innerHTML = html;

        console.log("Kandidat Paket Promosi berhasil diperbarui:", {
            tahun: results.year,
            totalKandidat: packages.length,
            waktuAnalisis: results.analyzedAt
        });

    }

    // 8. Menampilkan hasil ketika halaman dibuka
    renderPromoPackages();

    // 9. Memperbarui jika hasil analisis berubah dari tab lain
    window.addEventListener("storage", function (event) {

        if (event.key === "artha_apriori_results") {
            renderPromoPackages();
        }

    });

    // 10. Memastikan hasil tetap tampil ketika kembali ke halaman
    window.addEventListener("pageshow", function () {

        renderPromoPackages();

    });

    console.log(
        "JavaScript Paket Promosi berhasil dijalankan."
    );

});
