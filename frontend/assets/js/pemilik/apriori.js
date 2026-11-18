document.addEventListener("DOMContentLoaded", function () {
    // =====================================================
    // 1. ELEMEN HALAMAN
    // =====================================================
    const form = document.querySelector(".apriori-form");
    const supportSelect = document.getElementById("minimum-support");
    const confidenceSelect = document.getElementById("minimum-confidence");
    const periodSelect = document.getElementById("transaction-period");
    const supportCustom = document.querySelector(".apriori-support-custom");
    const confidenceCustom = document.querySelector(".apriori-confidence-custom");
    const infoButton = document.getElementById("open-apriori-info");
    const infoDialog = document.getElementById("apriori-info-dialog");
    const closeInfoButton = document.getElementById("close-apriori-info");
    const doneInfoButton = document.getElementById("done-apriori-info");
    const transactionValue = document.querySelector(".apriori-transaction-value");
    const transactionPlaceholder = document.querySelector(".transaction-placeholder");
    const resultPeriod = document.querySelector(".apriori-result-period");
    const infoText = document.querySelector(".apriori-info");
    const rulesBody = document.getElementById("apriori-rules-body");
    const pagination = document.getElementById("apriori-pagination");
    const paginationInfo = document.getElementById("apriori-pagination-info");
    const submitButton = form?.querySelector('[type="submit"]');

    if (
        !form || !supportSelect || !confidenceSelect || !periodSelect ||
        !supportCustom || !confidenceCustom || !transactionValue ||
        !rulesBody || !pagination || !paginationInfo
    ) {
        console.error("[ARTHA] Elemen Analisis Apriori tidak lengkap.");
        return;
    }

    // =====================================================
    // 2. KONFIGURASI API
    // =====================================================
    const API_BASE = "/artha/backend/api/";
    const API_ENDPOINT = "pemilik/apriori/analyze";
    const ITEMS_PER_PAGE = 5;

    let currentPage = 1;
    let associationRules = [];
    let analysisSummary = null;
    let isLoading = false;

    // =====================================================
    // 3. REQUEST API
    // =====================================================
    async function apiRequest(endpoint, options = {}) {
        const response = await fetch(
            API_BASE + String(endpoint).replace(/^\/+/, ""),
            {
                credentials: "same-origin",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    ...(options.headers || {})
                },
                ...options
            }
        );

        let result;

        try {
            result = await response.json();
        } catch (error) {
            throw new Error(
                `Respons server tidak valid (HTTP ${response.status}).`
            );
        }

        if (!response.ok || result.success === false) {
            throw new Error(
                result.message ||
                `Permintaan gagal diproses (HTTP ${response.status}).`
            );
        }

        return result;
    }

    function getResponseData(response) {
        return response?.data ?? response?.payload ?? null;
    }

    // =====================================================
    // 4. FORMAT DAN UTILITAS
    // =====================================================
    function formatNumber(value, digits = 2) {
        return Number(value ?? 0).toLocaleString("id-ID", {
            minimumFractionDigits: digits,
            maximumFractionDigits: digits
        });
    }

    function formatPercent(value) {
        return `${formatNumber(value)}%`;
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, function (character) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            }[character];
        });
    }

    function getLiftClass(lift) {
        if (Number(lift) > 1.000001) return "lift-positive";
        if (Number(lift) < 0.999999) return "lift-negative";
        return "lift-neutral";
    }

    function getRuleName(rule) {
        return `${rule.antecedent_names.join(" + ")} → ${rule.consequent_names.join(" + ")}`;
    }

    function normalizeRule(rule, summary) {
        return {
            antecedent: Array.isArray(rule.antecedent)
                ? rule.antecedent : [],

            consequent: Array.isArray(rule.consequent)
                ? rule.consequent : [],

            antecedent_names: Array.isArray(rule.antecedent_names)
                ? rule.antecedent_names : [],

            consequent_names: Array.isArray(rule.consequent_names)
                ? rule.consequent_names : [],

            itemsetSize: Number(rule.itemset_size ?? 0),
            supportCount: Number(rule.support_count ?? 0),
            antecedentCount: Number(rule.antecedent_count ?? 0),
            consequentCount: Number(rule.consequent_count ?? 0),

            totalTransactions: Number(
                rule.total_transactions ??
                summary.jumlah_transaksi ??
                0
            ),

            support: Number(rule.support ?? 0),
            confidence: Number(rule.confidence ?? 0),
            lift: Number(rule.lift ?? 0)
        };
    }

    function setLoading(loading) {
        isLoading = loading;

        if (submitButton) {
            submitButton.disabled = loading;

            submitButton.dataset.originalText ??=
                submitButton.textContent.trim();

            submitButton.textContent = loading
                ? "Memproses Analisis..."
                : submitButton.dataset.originalText;
        }

        form.setAttribute("aria-busy", String(loading));
    }

    function scrollToResults() {
        document.getElementById("hasil-analisis")?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    // =====================================================
    // 5. DETAIL ATURAN ASOSIASI
    // =====================================================
    function renderRuleDetail(rule, index) {
        const antecedent = escapeHTML(
            rule.antecedent_names.join(" + ")
        );

        const consequent = escapeHTML(
            rule.consequent_names.join(" + ")
        );

        const number = String(index + 1).padStart(2, "0");

        const supportCalculation =
            `${rule.supportCount} ÷ ${rule.totalTransactions} × 100% = ${formatPercent(rule.support)}`;

        const confidenceCalculation =
            `${rule.supportCount} ÷ ${rule.antecedentCount} × 100% = ${formatPercent(rule.confidence)}`;

        const liftCalculation =
            `(${rule.supportCount} ÷ ${rule.antecedentCount}) ÷ (${rule.consequentCount} ÷ ${rule.totalTransactions}) = ${formatNumber(rule.lift)}`;

        let interpretation;

        if (rule.lift > 1) {
            interpretation =
                "Nilai lift lebih dari 1 menunjukkan asosiasi positif. " +
                "Produk consequent memiliki peluang kemunculan lebih tinggi " +
                "ketika produk antecedent muncul dibandingkan peluang " +
                "kemunculannya secara keseluruhan.";
        } else if (rule.lift < 1) {
            interpretation =
                "Nilai lift kurang dari 1 menunjukkan asosiasi negatif. " +
                "Produk consequent memiliki peluang kemunculan lebih rendah " +
                "ketika produk antecedent muncul dibandingkan peluang " +
                "kemunculannya secara keseluruhan.";
        } else {
            interpretation =
                "Nilai lift sama dengan 1 menunjukkan hubungan independen. " +
                "Kemunculan produk consequent tidak menunjukkan perubahan " +
                "peluang berdasarkan kemunculan produk antecedent.";
        }

        return `
            <tr class="artha-rule-detail"
                id="detail-rule-${index}" hidden>

                <td colspan="7">
                    <div class="artha-expand">

                        <div class="artha-expand-header">
                            <h3>Rincian Aturan #${number}</h3>
                            <span>
                                ${rule.itemsetSize}-itemset ·
                                ${rule.antecedent_names.length} →
                                ${rule.consequent_names.length}
                            </span>
                        </div>

                        <div class="artha-expand-box">
                            <div class="artha-rule-pair">

                                <div>
                                    <span class="artha-detail-label">
                                        JIKA — Antecedent (A)
                                    </span>
                                    <strong>${antecedent}</strong>
                                </div>

                                <div>
                                    <span class="artha-detail-label">
                                        MAKA — Consequent (B)
                                    </span>
                                    <strong>${consequent}</strong>
                                </div>

                            </div>
                        </div>

                        <div class="artha-expand-box">
                            <h4>Bukti Transaksi</h4>

                            <div class="artha-evidence-grid">

                                <div class="artha-evidence-item">
                                    <span>Total Transaksi (N)</span>
                                    <strong>${rule.totalTransactions}</strong>
                                </div>

                                <div class="artha-evidence-item">
                                    <span>Mengandung A</span>
                                    <strong>${rule.antecedentCount}</strong>
                                </div>

                                <div class="artha-evidence-item">
                                    <span>Mengandung B</span>
                                    <strong>${rule.consequentCount}</strong>
                                </div>

                                <div class="artha-evidence-item">
                                    <span>Mengandung A dan B</span>
                                    <strong>${rule.supportCount}</strong>
                                </div>

                            </div>
                        </div>

                        <div class="artha-expand-box">
                            <h4>Perhitungan Apriori</h4>

                            <div class="artha-calculation">

                                <div class="artha-calc-row">
                                    <span>Support</span>
                                    <p>${supportCalculation}</p>
                                </div>

                                <div class="artha-calc-row">
                                    <span>Confidence</span>
                                    <p>${confidenceCalculation}</p>
                                </div>

                                <div class="artha-calc-row">
                                    <span>Lift</span>
                                    <p>${liftCalculation}</p>
                                </div>

                            </div>
                        </div>

                        <div class="artha-expand-box">
                            <h4>Interpretasi</h4>
                            <p class="artha-interpretation">
                                ${interpretation}
                            </p>
                        </div>

                    </div>
                </td>
            </tr>
        `;
    }

    // =====================================================
    // 6. KANDIDAT PAKET PROMOSI
    // =====================================================
    function renderPromoPackages() {
        const promoList =
            document.getElementById("promo-package-list");

        const promoDescription =
            document.getElementById("promo-package-description");

        if (!promoList) return;

        const selectedRules = associationRules.slice(0, 5);

        if (selectedRules.length === 0) {
            promoList.innerHTML = `
                <div class="promo-package-empty">
                    Tidak ada kandidat paket promosi yang
                    memenuhi parameter analisis.
                </div>
            `;

            if (promoDescription) {
                promoDescription.textContent =
                    "Tidak ditemukan aturan asosiasi yang memenuhi parameter analisis.";
            }

            return;
        }

        if (promoDescription) {
            promoDescription.textContent =
                `Ditemukan ${selectedRules.length} kandidat paket promosi berdasarkan hasil analisis Apriori.`;
        }

        promoList.innerHTML = selectedRules.map(function (rule, index) {
            const products = [
                ...new Set([
                    ...rule.antecedent_names,
                    ...rule.consequent_names
                ])
            ];

            return `
                <article class="promo-package-card">

                    <div class="promo-package-title">
                        Paket Promosi ${index + 1}
                    </div>

                    <div class="promo-package-products">
                        ${products.map(escapeHTML).join(" + ")}
                    </div>

                    <div class="promo-package-metrics">

                        <span>
                            Support ${formatPercent(rule.support)}
                        </span>

                        <span>
                            Confidence ${formatPercent(rule.confidence)}
                        </span>

                        <span>
                            Lift ${formatNumber(rule.lift)}
                        </span>

                    </div>

                </article>
            `;
        }).join("");
    }

    // =====================================================
    // 7. TABEL DAN PAGINATION
    // =====================================================
    function renderEmptyResult(message) {
        associationRules = [];
        currentPage = 1;

        rulesBody.innerHTML = `
            <tr>
                <td colspan="7" class="transaction-empty-state">
                    ${escapeHTML(message)}
                </td>
            </tr>
        `;

        pagination.innerHTML = "";
        paginationInfo.textContent = "Menampilkan 0 aturan.";

        renderPromoPackages();
    }

    function renderRules() {
        const totalRules = associationRules.length;
        const totalPages = Math.ceil(totalRules / ITEMS_PER_PAGE);

        if (totalRules === 0) {
            renderEmptyResult(
                "Tidak ditemukan aturan asosiasi yang memenuhi minimum support dan minimum confidence."
            );
            return;
        }

        currentPage = Math.min(
            Math.max(currentPage, 1),
            totalPages
        );

        const startIndex =
            (currentPage - 1) * ITEMS_PER_PAGE;

        const endIndex = Math.min(
            startIndex + ITEMS_PER_PAGE,
            totalRules
        );

        rulesBody.innerHTML = associationRules
            .slice(startIndex, endIndex)
            .map(function (rule, localIndex) {

                const globalIndex = startIndex + localIndex;
                const ruleNumber = globalIndex + 1;

                return `
                    <tr class="apriori-rule-row">

                        <td>${ruleNumber}</td>

                        <td class="apriori-rule-name">
                            ${escapeHTML(getRuleName(rule))}
                        </td>

                        <td>
                            <span class="apriori-itemset-badge">
                                ${rule.itemsetSize}-itemset
                            </span>
                        </td>

                        <td>${formatPercent(rule.support)}</td>

                        <td>${formatPercent(rule.confidence)}</td>

                        <td>
                            <span class="lift-value ${getLiftClass(rule.lift)}">
                                ${formatNumber(rule.lift)}
                            </span>
                        </td>

                        <td>
                            <button
                                type="button"
                                class="artha-detail-button"
                                data-detail-index="${globalIndex}"
                                aria-label="Buka detail aturan ${ruleNumber}"
                                aria-expanded="false"
                                aria-controls="detail-rule-${globalIndex}">

                                <span
                                    class="artha-detail-chevron"
                                    aria-hidden="true">
                                </span>

                            </button>
                        </td>

                    </tr>

                    ${renderRuleDetail(rule, globalIndex)}
                `;
            })
            .join("");

        renderPagination(totalPages);

        paginationInfo.textContent =
            `Menampilkan ${startIndex + 1}–${endIndex} dari ${totalRules} aturan`;

        renderPromoPackages();
    }

    function renderPagination(totalPages) {
        if (totalPages <= 1) {
            pagination.innerHTML = "";
            return;
        }

        let html = `
            <button
                type="button"
                class="apriori-page-button"
                data-page="${currentPage - 1}"
                ${currentPage === 1 ? "disabled" : ""}>
                Sebelumnya
            </button>
        `;

        const pages = new Set([1, totalPages]);

        for (
            let page = currentPage - 1;
            page <= currentPage + 1;
            page++
        ) {
            if (page >= 1 && page <= totalPages) {
                pages.add(page);
            }
        }

        let previousPage = 0;

        [...pages].sort((a, b) => a - b)
            .forEach(function (page) {

                if (
                    previousPage !== 0 &&
                    page - previousPage > 1
                ) {
                    html += `
                        <span class="apriori-page-ellipsis">
                            ...
                        </span>
                    `;
                }

                html += `
                    <button
                        type="button"
                        class="apriori-page-number ${page === currentPage ? "active" : ""}"
                        data-page="${page}"
                        ${page === currentPage ? 'aria-current="page"' : ""}>
                        ${page}
                    </button>
                `;

                previousPage = page;
            });

        html += `
            <button
                type="button"
                class="apriori-page-button"
                data-page="${currentPage + 1}"
                ${currentPage === totalPages ? "disabled" : ""}>
                Selanjutnya
            </button>
        `;

        pagination.innerHTML = html;
    }

    pagination.addEventListener("click", function (event) {
        const button = event.target.closest("button[data-page]");

        if (!button || button.disabled) return;

        currentPage = Number(button.dataset.page);

        renderRules();
        scrollToResults();
    });

    rulesBody.addEventListener("click", function (event) {
        const button = event.target.closest(".artha-detail-button");

        if (!button) return;

        const index = Number(button.dataset.detailIndex);

        const detailRow =
            document.getElementById(`detail-rule-${index}`);

        if (!detailRow) return;

        const expanded =
            button.getAttribute("aria-expanded") === "true";

        button.setAttribute("aria-expanded", String(!expanded));

        button.setAttribute(
            "aria-label",
            `${expanded ? "Buka" : "Tutup"} detail aturan ${index + 1}`
        );

        detailRow.hidden = expanded;
    });

    // =====================================================
    // 8. PERIODE DAN INPUT PARAMETER
    // =====================================================
    function renderTransactionCount(year) {
        transactionValue.querySelectorAll("span")
            .forEach(function (item) {
                item.style.display = "none";
            });

        if (transactionPlaceholder) {
            transactionPlaceholder.textContent =
                `Jumlah transaksi tahun ${year}.`;

            transactionPlaceholder.style.display = "inline";
        }
    }

    periodSelect.addEventListener("change", function () {
        renderTransactionCount(periodSelect.value);

        if (infoText) {
            infoText.textContent =
                "Pilih parameter analisis sebelum menjalankan analisis asosiasi.";
        }
    });

    supportSelect.addEventListener("change", function () {
        const custom = supportSelect.value === "custom";

        supportCustom.style.display =
            custom ? "block" : "none";

        supportCustom.required = custom;

        if (!custom) {
            supportCustom.value = "";
            supportCustom.setCustomValidity("");
        } else {
            supportCustom.focus();
        }
    });

    confidenceSelect.addEventListener("change", function () {
        const custom = confidenceSelect.value === "custom";

        confidenceCustom.style.display =
            custom ? "block" : "none";

        confidenceCustom.required = custom;

        if (!custom) {
            confidenceCustom.value = "";
            confidenceCustom.setCustomValidity("");
        } else {
            confidenceCustom.focus();
        }
    });

    function validateCustomInput(input, label) {
        if (!input.required) return true;

        const value = Number(input.value);

        if (
            input.value.trim() === "" ||
            !Number.isFinite(value) ||
            value <= 0 ||
            value > 100
        ) {
            input.setCustomValidity(
                `${label} harus lebih dari 0 dan maksimal 100.`
            );

            input.reportValidity();
            return false;
        }

        input.setCustomValidity("");
        return true;
    }

    [supportCustom, confidenceCustom]
        .forEach(function (input) {
            input.addEventListener("input", function () {
                input.setCustomValidity("");
            });
        });

    // =====================================================
    // 9. DIALOG PANDUAN
    // =====================================================
    infoButton?.addEventListener("click", function () {
        if (infoDialog && !infoDialog.open) {
            infoDialog.showModal();
        }
    });

    closeInfoButton?.addEventListener("click", function () {
        infoDialog?.close();
    });

    doneInfoButton?.addEventListener("click", function () {
        infoDialog?.close();
    });

    infoDialog?.addEventListener("click", function (event) {
        if (event.target === infoDialog) {
            infoDialog.close();
        }
    });

    // =====================================================
    // 10. MENJALANKAN ANALISIS MELALUI BACKEND PHP
    // =====================================================
    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        if (isLoading || !form.reportValidity()) return;

        if (
            !validateCustomInput(supportCustom, "Minimum Support") ||
            !validateCustomInput(confidenceCustom, "Minimum Confidence")
        ) {
            return;
        }

        const year = Number(periodSelect.value);

        const minimumSupport =
            supportSelect.value === "custom"
                ? Number(supportCustom.value)
                : Number(supportSelect.value);

        const minimumConfidence =
            confidenceSelect.value === "custom"
                ? Number(confidenceCustom.value)
                : Number(confidenceSelect.value);

        if (
            !Number.isInteger(year) ||
            year < 2000 ||
            year > 2100
        ) {
            periodSelect.setCustomValidity(
                "Tahun analisis tidak valid."
            );

            periodSelect.reportValidity();
            return;
        }

        periodSelect.setCustomValidity("");

        setLoading(true);

        if (infoText) {
            infoText.textContent =
                "Mengambil transaksi dan menjalankan algoritma Apriori dari database...";
        }

        if (transactionPlaceholder) {
            transactionPlaceholder.textContent =
                "Sedang menghitung transaksi dari database...";
        }

        try {
            const response = await apiRequest(API_ENDPOINT, {
                method: "POST",

                body: JSON.stringify({
                    tahun: year,
                    minimum_support: minimumSupport,
                    minimum_confidence: minimumConfidence
                })
            });

            const data = getResponseData(response);

            if (!data || !Array.isArray(data.aturan)) {
                throw new Error(
                    "Format hasil analisis dari server tidak sesuai."
                );
            }

            analysisSummary = data;

            associationRules = data.aturan.map(function (rule) {
                return normalizeRule(rule, data);
            });

            currentPage = 1;

            if (transactionPlaceholder) {
                transactionPlaceholder.textContent =
                    `${Number(data.jumlah_transaksi).toLocaleString("id-ID")} Transaksi (Database)`;
            }

            if (resultPeriod) {
                resultPeriod.textContent = `Tahun ${data.tahun}`;
            }

            if (infoText) {
                infoText.textContent =
                    `Analisis selesai menggunakan ${Number(data.jumlah_transaksi).toLocaleString("id-ID")} transaksi dari database. ` +
                    `Minimum Support ${formatNumber(data.minimum_support)}% dan Minimum Confidence ${formatNumber(data.minimum_confidence)}%. ` +
                    `Ditemukan ${Number(data.jumlah_aturan).toLocaleString("id-ID")} aturan asosiasi.`;
            }

            renderRules();
            scrollToResults();

            console.log(
                "[ARTHA] Hasil Analisis Apriori dari backend:",
                {
                    idAnalisis: data.id_analisis_apriori,
                    tahun: data.tahun,
                    jumlahTransaksi: data.jumlah_transaksi,
                    minimumSupport: data.minimum_support,
                    minimumSupportCount: data.minimum_support_count,
                    minimumConfidence: data.minimum_confidence,
                    jumlahFrequentItemset: data.jumlah_frequent_itemset,
                    jumlahAturan: data.jumlah_aturan,
                    aturan: data.aturan
                }
            );

        } catch (error) {
            console.error(
                "[ARTHA] Analisis Apriori gagal:",
                error
            );

            renderEmptyResult(
                error.message || "Analisis Apriori gagal dijalankan."
            );

            if (infoText) {
                infoText.textContent =
                    error.message || "Analisis Apriori gagal dijalankan.";
            }

            if (transactionPlaceholder) {
                transactionPlaceholder.textContent =
                    "Data transaksi tidak berhasil dimuat.";
            }

        } finally {
            setLoading(false);
        }
    });

    // =====================================================
    // 11. KONDISI AWAL
    // =====================================================
    supportCustom.required = false;
    supportCustom.style.display = "none";

    confidenceCustom.required = false;
    confidenceCustom.style.display = "none";

    renderEmptyResult(
        "Jalankan analisis untuk menampilkan hasil dari database."
    );

    if (resultPeriod) {
        resultPeriod.textContent = "Belum dianalisis";
    }

    if (transactionPlaceholder) {
        transactionPlaceholder.textContent =
            "Jumlah transaksi";

        transactionPlaceholder.style.display = "inline";
    }

    if (infoText) {
        infoText.textContent =
            "Pilih parameter analisis dan periode transaksi sebelum menjalankan analisis asosiasi.";
    }

    console.log(
        "[ARTHA] Modul Analisis Apriori siap terhubung ke backend MySQL."
    );
});