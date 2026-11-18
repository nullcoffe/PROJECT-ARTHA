document.addEventListener("DOMContentLoaded", function () {

    // 1. Mengambil elemen HTML.
    const promoList = document.getElementById("promo-package-list");
    const promoDescription = document.getElementById(
        "promo-package-description"
    );

    const API_URL = "../../backend/api/pemilik/apriori/latest";

    if (!promoList || !promoDescription) {
        console.error("Elemen Paket Promosi tidak ditemukan.");
        return;
    }

    let isLoading = false;

    // 2. Format angka Indonesia.
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

    // 3. Mengamankan teks HTML.
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

    // 4. Menampilkan kondisi kosong.
    function renderEmpty(message) {
        promoDescription.hidden = true;

        promoList.innerHTML = `
            <div class="promo-package-empty">
                ${escapeHTML(message)}
            </div>
        `;
    }

    // 5. Memvalidasi aturan asosiasi dari database.
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

    // 6. Menentukan kualitas asosiasi.
    function getLiftDescription(lift) {
        if (lift > 1) {
            return {
                label: "Asosiasi Positif",
                className: "lift-positive"
            };
        }

        if (lift < 1) {
            return {
                label: "Asosiasi Negatif",
                className: "lift-negative"
            };
        }

        return {
            label: "Asosiasi Netral",
            className: "lift-neutral"
        };
    }

    // 7. Menampilkan kandidat paket promosi.
    function renderPromoPackages(analysis) {

        if (!analysis || !Array.isArray(analysis.aturan)) {
            renderEmpty(
                "Belum ada hasil analisis Apriori. Silakan jalankan analisis terlebih dahulu."
            );
            return;
        }

        const rules = analysis.aturan.filter(isValidRule);

        if (rules.length === 0) {
            renderEmpty(
                "Analisis Apriori sudah dilakukan, tetapi belum ditemukan aturan asosiasi yang memenuhi parameter."
            );
            return;
        }

        // Informasi analisis.
        promoDescription.hidden = false;

        promoDescription.textContent =
            "Ditemukan " + rules.length +
            " kandidat paket promosi berdasarkan analisis tahun " +
            analysis.tahun +
            " dengan " +
            analysis.jumlah_transaksi +
            " transaksi.";

        let html = "";

        // Menampilkan maksimal lima kandidat terbaik.
        const selectedRules = rules.slice(0, 5);

        selectedRules.forEach(function (rule, index) {

            const antecedent = rule.antecedent
                .map(escapeHTML)
                .join(" + ");

            const consequent = rule.consequent
                .map(escapeHTML)
                .join(" + ");

            const liftInfo = getLiftDescription(
                Number(rule.lift)
            );

            html += `
                <article class="promo-item">

                    <h3>
                        Paket Promosi ${index + 1}
                    </h3>

                    <div class="promo-product">

                        <div class="promo-product-group">
                            <span>Produk utama</span>
                            <strong>${antecedent}</strong>
                        </div>

                        <div class="promo-product-arrow">
                            →
                        </div>

                        <div class="promo-product-group">
                            <span>Produk rekomendasi</span>
                            <strong>${consequent}</strong>
                        </div>

                    </div>

                    <div class="promo-metric">

                        <span>
                            Support:
                            ${formatNumber(rule.support)}%
                        </span>

                        <span>
                            Confidence:
                            ${formatNumber(rule.confidence)}%
                        </span>

                        <span>
                            Lift:
                            ${formatNumber(rule.lift)}
                        </span>

                    </div>

                    <div class="promo-lift-status ${liftInfo.className}">
                        ${liftInfo.label}
                    </div>

                </article>
            `;
        });

        promoList.innerHTML = html;

        console.log("Kandidat Paket Promosi berhasil dimuat:", {
            tahun: analysis.tahun,
            jumlahTransaksi: analysis.jumlah_transaksi,
            jumlahAturan: analysis.jumlah_aturan,
            jumlahKandidatDitampilkan: selectedRules.length
        });
    }

    // 8. Mengambil hasil analisis langsung dari database melalui API.
    async function loadPromoPackages() {

        if (isLoading) {
            return;
        }

        isLoading = true;

        promoList.innerHTML = `
            <div class="promo-package-empty">
                Memuat rekomendasi paket promosi...
            </div>
        `;

        try {

            const response = await fetch(API_URL, {
                method: "GET",
                credentials: "same-origin",
                headers: {
                    "Accept": "application/json"
                }
            });

            const result = await response.json();

            console.log("HTTP STATUS PAKET PROMOSI:", response.status);
            console.log("HASIL PAKET PROMOSI:", result);

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message ||
                    "Gagal mengambil rekomendasi paket promosi."
                );
            }

            const analysis = result.data?.analysis !== undefined
                ? result.data.analysis
                : result.data;

            if (!analysis) {
                renderEmpty(
                    "Belum ada hasil analisis Apriori. Jalankan analisis terlebih dahulu."
                );
                return;
            }

            renderPromoPackages(analysis);

        } catch (error) {

            console.error(
                "Gagal memuat Paket Promosi:",
                error
            );

            renderEmpty(
                "Gagal menghubungkan ke server. Periksa koneksi dan coba muat ulang halaman."
            );

        } finally {
            isLoading = false;
        }
    }

    // 9. Memuat rekomendasi ketika halaman dibuka.
    loadPromoPackages();

    // 10. Memuat ulang ketika halaman dikembalikan dari browser cache.
    window.addEventListener("pageshow", function (event) {
        if (event.persisted) {
            loadPromoPackages();
        }
    });

    console.log(
        "JavaScript Paket Promosi berhasil dijalankan."
    );

});