
document.addEventListener("DOMContentLoaded", function () {

    // 1. Mengambil elemen HTML
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

    // 2. Memeriksa kelengkapan elemen HTML
    if (!form || !supportSelect || !confidenceSelect || !periodSelect ||
        !supportCustom || !confidenceCustom || !transactionValue ||
        !rulesBody || !pagination || !paginationInfo) {
        console.error("Elemen Analisis Apriori tidak lengkap.");
        return;
    }

    // 3. Mengatur konfigurasi tampilan
    const ITEMS_PER_PAGE = 5;
    const STORAGE_KEY = "artha_apriori_results";
    let currentPage = 1;
    let associationRules = [];

    // 4. Menentukan daftar produk simulasi
    const productNames = [
        "Beras",
        "Kopi Sachet",
        "Minyak Goreng",
        "Telur",
        "Gula",
        "Tepung Panir",
        "Plastik Kemasan",
        "Korek Api"
    ];

    // 5. Menentukan pola transaksi simulasi
    const transactionPatterns = [
        ["Beras", "Minyak Goreng", "Telur"],
        ["Beras", "Kopi Sachet"],
        ["Gula", "Kopi Sachet"],
        ["Minyak Goreng", "Telur"],
        ["Beras", "Telur", "Gula"],
        ["Tepung Panir", "Telur"],
        ["Beras", "Gula"],
        ["Kopi Sachet", "Gula", "Telur"],
        ["Minyak Goreng", "Beras", "Gula"],
        ["Plastik Kemasan", "Tepung Panir"],
        ["Beras", "Minyak Goreng"],
        ["Telur", "Gula"]
    ];

    // 6. Membuat generator angka acak berdasarkan seed
    function createRandom(seed) {
        let value = seed;

        return function () {
            value = (value * 9301 + 49297) % 233280;
            return value / 233280;
        };
    }

    // 7. Membuat transaksi simulasi
    function generateTransactions(total, seed) {
        const random = createRandom(seed);
        const transactions = [];

        for (let i = 0; i < total; i++) {
            const patternIndex = Math.floor(
                random() * transactionPatterns.length
            );

            const basket = new Set(transactionPatterns[patternIndex]);

            productNames.forEach(function (product) {
                if (random() < 0.12) {
                    basket.add(product);
                }
            });

            transactions.push(Array.from(basket));
        }

        return transactions;
    }

    // 8. Menyediakan dataset transaksi berdasarkan tahun
    const transactionData = {
        "2024": generateTransactions(149, 2024),
        "2025": generateTransactions(201, 2025),
        "2026": []
    };

    // 9. Mengatur format angka desimal
    function formatNumber(value, digits = 2) {
        return Number(value).toLocaleString("id-ID", {
            minimumFractionDigits: digits,
            maximumFractionDigits: digits
        });
    }

    // 10. Mengatur format persentase
    function formatPercent(value) {
        return formatNumber(value) + "%";
    }

    // 11. Mengamankan teks sebelum ditampilkan dalam HTML
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

    // 12. Menghitung jumlah transaksi yang mengandung itemset
    function countItemset(transactions, items) {
        return transactions.filter(function (transaction) {
            return items.every(function (item) {
                return transaction.includes(item);
            });
        }).length;
    }

    // 13. Menghasilkan kombinasi produk
    function generateCombinations(items, size) {
        const results = [];

        function combine(start, current) {
            if (current.length === size) {
                results.push([...current]);
                return;
            }

            for (let i = start; i < items.length; i++) {
                current.push(items[i]);
                combine(i + 1, current);
                current.pop();
            }
        }

        combine(0, []);
        return results;
    }

    // 14. Menghasilkan seluruh subset nonkosong
    function generateSubsets(items) {
        const results = [];

        for (let size = 1; size < items.length; size++) {
            results.push(...generateCombinations(items, size));
        }

        return results;
    }

    // 15. Mengurutkan produk berdasarkan urutan daftar produk
    function sortItems(items) {
        return [...items].sort(function (a, b) {
            return productNames.indexOf(a) - productNames.indexOf(b);
        });
    }

    // 16. Membentuk kandidat itemset berikutnya dengan pruning
    function generateCandidates(previousFrequent, nextSize) {
        const candidates = new Map();

        const previousKeys = new Set(
            previousFrequent.map(function (itemset) {
                return itemset.items.join("|");
            })
        );

        for (let i = 0; i < previousFrequent.length; i++) {
            for (let j = i + 1; j < previousFrequent.length; j++) {

                const first = previousFrequent[i].items;
                const second = previousFrequent[j].items;

                const prefixLength = nextSize - 2;

                const samePrefix = first
                    .slice(0, prefixLength)
                    .every(function (item, index) {
                        return item === second[index];
                    });

                if (!samePrefix) {
                    continue;
                }

                const combined = sortItems(
                    Array.from(new Set([...first, ...second]))
                );

                if (combined.length !== nextSize) {
                    continue;
                }

                const subsets = generateCombinations(
                    combined,
                    nextSize - 1
                );

                const allSubsetsFrequent = subsets.every(
                    function (subset) {
                        return previousKeys.has(subset.join("|"));
                    }
                );

                if (allSubsetsFrequent) {
                    candidates.set(combined.join("|"), combined);
                }
            }
        }

        return Array.from(candidates.values());
    }

    // 17. Menghitung nilai lift
    function calculateLift(confidence, consequentCount, totalTransactions) {
        if (consequentCount === 0 || totalTransactions === 0) {
            return 0;
        }

        return (confidence / 100) /
            (consequentCount / totalTransactions);
    }

    // 18. Menjalankan algoritma Apriori
    function runApriori(transactions, minimumSupport, minimumConfidence) {
        const totalTransactions = transactions.length;

        if (totalTransactions === 0) {
            return [];
        }

        const frequentItemsets = [];

        let currentCandidates = productNames.map(function (item) {
            return [item];
        });

        let itemsetSize = 1;

        while (currentCandidates.length > 0) {

            const currentFrequent = [];

            currentCandidates.forEach(function (items) {
                const count = countItemset(transactions, items);
                const support = count / totalTransactions * 100;

                if (support >= minimumSupport) {
                    currentFrequent.push({
                        items: items,
                        count: count,
                        support: support
                    });
                }
            });

            if (currentFrequent.length === 0) {
                break;
            }

            frequentItemsets.push(...currentFrequent);

            itemsetSize++;

            currentCandidates = generateCandidates(
                currentFrequent,
                itemsetSize
            );
        }

        // 19. Membentuk aturan asosiasi dari frequent itemset
        const rules = [];

        frequentItemsets.forEach(function (itemset) {

            if (itemset.items.length < 2) {
                return;
            }

            const subsets = generateSubsets(itemset.items);

            subsets.forEach(function (antecedent) {

                const consequent = itemset.items.filter(function (item) {
                    return !antecedent.includes(item);
                });

                const antecedentCount = countItemset(
                    transactions,
                    antecedent
                );

                const consequentCount = countItemset(
                    transactions,
                    consequent
                );

                if (antecedentCount === 0 || consequentCount === 0) {
                    return;
                }

                const confidence =
                    itemset.count / antecedentCount * 100;

                if (confidence < minimumConfidence) {
                    return;
                }

                const lift = calculateLift(
                    confidence,
                    consequentCount,
                    totalTransactions
                );

                rules.push({
                    antecedent: antecedent,
                    consequent: consequent,
                    itemsetSize: itemset.items.length,
                    supportCount: itemset.count,
                    antecedentCount: antecedentCount,
                    consequentCount: consequentCount,
                    totalTransactions: totalTransactions,
                    support: itemset.support,
                    confidence: confidence,
                    lift: lift
                });
            });
        });

        // 20. Mengurutkan aturan berdasarkan lift dan support
        rules.sort(function (a, b) {
            return b.lift - a.lift || b.support - a.support;
        });

        return rules;
    }

    // 21. Menentukan warna berdasarkan nilai lift
    function getLiftClass(lift) {
        if (lift > 1.000001) {
            return "lift-positive";
        }

        if (lift < 0.999999) {
            return "lift-negative";
        }

        return "lift-neutral";
    }

    // 22. Membentuk teks aturan asosiasi
    function getRuleName(rule) {
        return rule.antecedent.join(" + ") +
            " → " +
            rule.consequent.join(" + ");
    }

    // 23. Membuat isi detail aturan
    function renderRuleDetail(rule, index) {
        const antecedent = escapeHTML(rule.antecedent.join(" + "));
        const consequent = escapeHTML(rule.consequent.join(" + "));
        const number = String(index + 1).padStart(2, "0");

        const supportCalculation =
            rule.supportCount + " ÷ " +
            rule.totalTransactions + " × 100% = " +
            formatPercent(rule.support);

        const confidenceCalculation =
            rule.supportCount + " ÷ " +
            rule.antecedentCount + " × 100% = " +
            formatPercent(rule.confidence);

        const liftCalculation =
            "(" + rule.supportCount + " ÷ " +
            rule.antecedentCount + ") ÷ (" +
            rule.consequentCount + " ÷ " +
            rule.totalTransactions + ") = " +
            formatNumber(rule.lift);

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
            <tr class="artha-rule-detail" id="detail-rule-${index}" hidden>
                <td colspan="7">
                    <div class="artha-expand">

                        <div class="artha-expand-header">
                            <h3>Rincian Aturan #${number}</h3>
                            <span>${rule.itemsetSize}-itemset · ${rule.antecedent.length} → ${rule.consequent.length}</span>
                        </div>

                        <div class="artha-expand-box">
                            <div class="artha-rule-pair">
                                <div>
                                    <span class="artha-detail-label">JIKA — Antecedent (A)</span>
                                    <strong>${antecedent}</strong>
                                </div>
                                <div>
                                    <span class="artha-detail-label">MAKA — Consequent (B)</span>
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
                            <p class="artha-interpretation">${interpretation}</p>
                        </div>

                    </div>
                </td>
            </tr>
        `;
    }


    // Menampilkan kandidat paket promosi secara dinamis
    function renderPromoPackages() {

        const promoList = document.getElementById("promo-package-list");
        const promoDescription = document.getElementById("promo-package-description");

        if (!promoList) {
            console.warn("Elemen kandidat paket promosi tidak ditemukan.");
            return;
        }

        const selectedRules = associationRules.slice(0, 5);

        if (selectedRules.length === 0) {

            promoList.innerHTML = `
                <div class="promo-package-empty">
                    Belum ada kandidat paket promosi.
                    Jalankan analisis Apriori dengan parameter yang sesuai.
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
                "Ditemukan " + selectedRules.length +
                " kandidat paket promosi berdasarkan hasil analisis Apriori.";
        }

        let html = "";

        selectedRules.forEach(function (rule, index) {

            const products = [
                ...new Set([
                    ...rule.antecedent,
                    ...rule.consequent
                ])
            ];

            const productNamesHTML = products.map(function (product) {
                return escapeHTML(product);
            }).join(" + ");

            html += `
                <article class="promo-package-card">

                    <div class="promo-package-title">
                        Paket Promosi ${index + 1}
                    </div>

                    <div class="promo-package-products">
                        ${productNamesHTML}
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
        });

        promoList.innerHTML = html;
    }

    // 24. Menampilkan tabel aturan sesuai halaman
    function renderRules() {
        const totalRules = associationRules.length;
        const totalPages = Math.ceil(totalRules / ITEMS_PER_PAGE);

        if (totalRules === 0) {
            rulesBody.innerHTML = `
                <tr>
                    <td colspan="7" class="transaction-empty-state">
                        Tidak ditemukan aturan asosiasi yang memenuhi
                        minimum support dan minimum confidence.
                    </td>
                </tr>
            `;

            pagination.innerHTML = "";
            paginationInfo.textContent = "Menampilkan 0 aturan.";
            return;
        }

        currentPage = Math.min(
            Math.max(currentPage, 1),
            totalPages
        );

        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = Math.min(
            startIndex + ITEMS_PER_PAGE,
            totalRules
        );

        let html = "";

        associationRules.slice(startIndex, endIndex).forEach(
            function (rule, localIndex) {
                const globalIndex = startIndex + localIndex;
                const ruleNumber = globalIndex + 1;

                html += `
                    <tr class="apriori-rule-row">
                        <td>${ruleNumber}</td>
                        <td class="apriori-rule-name">${escapeHTML(getRuleName(rule))}</td>
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
                                <span class="artha-detail-chevron" aria-hidden="true"></span>
                            </button>
                        </td>
                    </tr>
                    ${renderRuleDetail(rule, globalIndex)}
                `;
            }
        );

        rulesBody.innerHTML = html;
        renderPagination(totalPages);

        paginationInfo.textContent =
            "Menampilkan " + (startIndex + 1) +
            "–" + endIndex + " dari " + totalRules + " aturan";
    }


    // 25. Membuat pagination ringkas berdasarkan jumlah aturan
    function renderPagination(totalPages) {

        if (totalPages <= 1) {
            pagination.innerHTML = "";
            return;
        }

        let html = `
            <button type="button"
                class="apriori-page-button"
                data-page="${currentPage - 1}"
                ${currentPage === 1 ? "disabled" : ""}>
                Sebelumnya
            </button>
        `;

        const pages = new Set();

        pages.add(1);
        pages.add(totalPages);

        for (
            let page = currentPage - 1;
            page <= currentPage + 1;
            page++
        ) {
            if (page >= 1 && page <= totalPages) {
                pages.add(page);
            }
        }

        const visiblePages = Array.from(pages).sort(
            function (a, b) {
                return a - b;
            }
        );

        let previousPage = 0;

        visiblePages.forEach(function (page) {

            if (previousPage !== 0 && page - previousPage > 1) {
                html += `
                    <span class="apriori-page-ellipsis">...</span>
                `;
            }

            html += `
                <button type="button"
                    class="apriori-page-number ${page === currentPage ? "active" : ""}"
                    data-page="${page}"
                    ${page === currentPage ? 'aria-current="page"' : ""}>
                    ${page}
                </button>
            `;

            previousPage = page;
        });

        html += `
            <button type="button"
                class="apriori-page-button"
                data-page="${currentPage + 1}"
                ${currentPage === totalPages ? "disabled" : ""}>
                Selanjutnya
            </button>
        `;

        pagination.innerHTML = html;
    }

    // 26. Mengatur perpindahan halaman pagination
    pagination.addEventListener("click", function (event) {
        const button = event.target.closest("button[data-page]");

        if (!button || button.disabled) {
            return;
        }

        currentPage = Number(button.dataset.page);
        renderRules();

        document.getElementById("hasil-analisis").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });

    // 27. Mengatur buka dan tutup semua detail aturan
    rulesBody.addEventListener("click", function (event) {
        const button = event.target.closest(".artha-detail-button");

        if (!button) {
            return;
        }

        const index = Number(button.dataset.detailIndex);
        const detailRow = document.getElementById("detail-rule-" + index);

        if (!detailRow) {
            return;
        }

        const isExpanded =
            button.getAttribute("aria-expanded") === "true";

        const nextExpanded = !isExpanded;

        button.setAttribute("aria-expanded", String(nextExpanded));
        button.setAttribute(
            "aria-label",
            nextExpanded
                ? "Tutup detail aturan " + (index + 1)
                : "Buka detail aturan " + (index + 1)
        );

        detailRow.hidden = !nextExpanded;
    });

    // 28. Memperbarui jumlah transaksi berdasarkan tahun
    function renderTransactionCount(year) {
        transactionValue.querySelectorAll("span").forEach(function (item) {
            item.style.display = "none";
        });

        const count = transactionData[year]?.length ?? 0;

        if (transactionPlaceholder) {
            transactionPlaceholder.textContent = count > 0
                ? count + " Transaksi (Simulasi)"
                : "Data transaksi tahun " + year + " belum tersedia.";

            transactionPlaceholder.style.display = "inline";
        }
    }

    // 29. Mengatur perubahan periode transaksi
    periodSelect.addEventListener("change", function () {
        renderTransactionCount(periodSelect.value);

        if (infoText) {
            infoText.textContent = periodSelect.value === "2026"
                ? "Data transaksi tahun 2026 belum tersedia."
                : "Pilih parameter analisis sebelum menjalankan analisis asosiasi.";
        }
    });

    // 30. Mengatur input custom minimum support
    supportSelect.addEventListener("change", function () {
        const isCustom = supportSelect.value === "custom";

        supportCustom.style.display = isCustom ? "block" : "none";
        supportCustom.required = isCustom;

        if (!isCustom) {
            supportCustom.value = "";
            supportCustom.setCustomValidity("");
        } else {
            supportCustom.focus();
        }
    });

    // 31. Mengatur input custom minimum confidence
    confidenceSelect.addEventListener("change", function () {
        const isCustom = confidenceSelect.value === "custom";

        confidenceCustom.style.display = isCustom ? "block" : "none";
        confidenceCustom.required = isCustom;

        if (!isCustom) {
            confidenceCustom.value = "";
            confidenceCustom.setCustomValidity("");
        } else {
            confidenceCustom.focus();
        }
    });

    // 32. Memvalidasi input custom
    function validateCustomInput(input, label) {
        if (!input.required) {
            return true;
        }

        const value = Number(input.value);

        if (
            input.value.trim() === "" ||
            !Number.isFinite(value) ||
            value <= 0 ||
            value > 100
        ) {
            input.setCustomValidity(
                label + " harus lebih dari 0 dan maksimal 100."
            );

            input.reportValidity();
            return false;
        }

        input.setCustomValidity("");
        return true;
    }

    // 33. Menghapus pesan validasi ketika input diperbaiki
    [supportCustom, confidenceCustom].forEach(function (input) {
        input.addEventListener("input", function () {
            input.setCustomValidity("");
        });
    });

    // 34. Membuka panduan parameter Apriori
    infoButton?.addEventListener("click", function () {
        if (infoDialog && !infoDialog.open) {
            infoDialog.showModal();
        }
    });

    // 35. Menutup panduan parameter Apriori
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

    // 36. Menampilkan pesan ketika hasil analisis kosong
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
    }

    // 37. Menjalankan analisis ketika form dikirim
    form.addEventListener("submit", function (event) {
        event.preventDefault();

        if (!form.reportValidity()) {
            return;
        }

        if (
            !validateCustomInput(supportCustom, "Minimum Support") ||
            !validateCustomInput(confidenceCustom, "Minimum Confidence")
        ) {
            return;
        }

        const year = periodSelect.value;
        const transactions = transactionData[year];

        if (!transactions || transactions.length === 0) {
            if (infoText) {
                infoText.textContent =
                    "Analisis tidak dapat dijalankan karena data transaksi tahun " +
                    year + " belum tersedia.";
            }

            renderEmptyResult(
                "Data transaksi tahun " + year + " belum tersedia."
            );

            if (resultPeriod) {
                resultPeriod.textContent = "Tahun " + year;
            }

            periodSelect.focus();
            return;
        }

        const minimumSupport = supportSelect.value === "custom"
            ? Number(supportCustom.value)
            : Number(supportSelect.value);

        const minimumConfidence = confidenceSelect.value === "custom"
            ? Number(confidenceCustom.value)
            : Number(confidenceSelect.value);

        // 38. Menjalankan perhitungan Apriori
        associationRules = runApriori(
            transactions,
            minimumSupport,
            minimumConfidence
        );

        currentPage = 1;

        // Menyimpan hasil analisis terbaru untuk seluruh halaman Pemilik.
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                year: year,
                totalTransactions: transactions.length,
                minimumSupport: minimumSupport,
                minimumConfidence: minimumConfidence,
                rules: associationRules,
                analyzedAt: new Date().toISOString()
            }));
        } catch (error) {
            console.error("Gagal menyimpan hasil analisis Apriori:", error);
        }

        // 39. Memperbarui tabel hasil
        renderRules();

        // 40. Memperbarui periode hasil
        if (resultPeriod) {
            resultPeriod.textContent = "Tahun " + year;
        }

        // 41. Memperbarui informasi analisis
        if (infoText) {
            infoText.textContent =
                "Analisis selesai menggunakan " + transactions.length +
                " transaksi simulasi. Minimum Support " +
                minimumSupport + "% dan Minimum Confidence " +
                minimumConfidence + "%. Jumlah aturan yang ditemukan: " +
                associationRules.length + ".";
        }

        // 42. Menampilkan bagian hasil analisis
        document.getElementById("hasil-analisis").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

        // 43. Mencatat hasil analisis pada console
        console.log("Hasil Analisis Apriori:", {
            tahun: year,
            totalTransaksi: transactions.length,
            minimumSupport: minimumSupport,
            minimumConfidence: minimumConfidence,
            frequentRules: associationRules.length,
            aturan: associationRules
        });
    });


    // 44. Memulihkan hasil analisis terakhir ketika halaman dibuka
    function restoreAnalysisResults() {

        try {

            const savedResults = localStorage.getItem(STORAGE_KEY);

            // Jika belum pernah ada analisis, tampilkan kondisi awal.
            if (!savedResults) {

                associationRules = [];
                currentPage = 1;

                form.reset();

                supportCustom.value = "";
                supportCustom.required = false;
                supportCustom.style.display = "none";
                supportCustom.setCustomValidity("");

                confidenceCustom.value = "";
                confidenceCustom.required = false;
                confidenceCustom.style.display = "none";
                confidenceCustom.setCustomValidity("");

                renderEmptyResult(
                    "Jalankan analisis untuk menampilkan hasil."
                );

                if (resultPeriod) {
                    resultPeriod.textContent = "Belum dianalisis";
                }

                if (transactionPlaceholder) {
                    transactionPlaceholder.textContent =
                        "Jumlah transaksi akan ditampilkan oleh sistem";
                    transactionPlaceholder.style.display = "inline";
                }

                if (infoText) {
                    infoText.textContent =
                        "Pilih parameter analisis dan periode transaksi sebelum menjalankan analisis asosiasi.";
                }

                return;
            }

            const results = JSON.parse(savedResults);

            // Memvalidasi data hasil analisis
            if (
                !results ||
                !Array.isArray(results.rules) ||
                !results.year ||
                !results.analyzedAt ||
                !Number.isFinite(Number(results.minimumSupport)) ||
                !Number.isFinite(Number(results.minimumConfidence)) ||
                !Number.isFinite(Number(results.totalTransactions))
            ) {

                associationRules = [];

                renderEmptyResult(
                    "Belum ada hasil analisis Apriori. Silakan jalankan analisis."
                );

                return;
            }

            // Memulihkan seluruh aturan asosiasi
            associationRules = results.rules;

            // Memulihkan periode transaksi
            periodSelect.value = String(results.year);

            renderTransactionCount(String(results.year));

            // Memulihkan parameter minimum support.
            const supportOption = supportSelect.querySelector(
                'option[value="' + results.minimumSupport + '"]'
            );

            if (supportOption) {
                supportSelect.value = String(results.minimumSupport);
                supportCustom.value = "";
                supportCustom.required = false;
                supportCustom.style.display = "none";
            } else {
                supportSelect.value = "custom";
                supportCustom.value = String(results.minimumSupport);
                supportCustom.required = true;
                supportCustom.style.display = "block";
            }

            // Memulihkan parameter minimum confidence.
            const confidenceOption = confidenceSelect.querySelector(
                'option[value="' + results.minimumConfidence + '"]'
            );

            if (confidenceOption) {
                confidenceSelect.value = String(results.minimumConfidence);
                confidenceCustom.value = "";
                confidenceCustom.required = false;
                confidenceCustom.style.display = "none";
            } else {
                confidenceSelect.value = "custom";
                confidenceCustom.value = String(results.minimumConfidence);
                confidenceCustom.required = true;
                confidenceCustom.style.display = "block";
            }

            // Memulihkan tabel hasil analisis
            currentPage = 1;
            renderRules();

            // Memulihkan informasi periode
            if (resultPeriod) {
                resultPeriod.textContent = "Tahun " + results.year;
            }

            // Memulihkan informasi analisis
            if (infoText) {
                infoText.textContent =
                    "Menampilkan hasil analisis terakhir menggunakan " +
                    results.totalTransactions +
                    " transaksi simulasi. Minimum Support " +
                    results.minimumSupport +
                    "% dan Minimum Confidence " +
                    results.minimumConfidence +
                    "%. Jumlah aturan yang ditemukan: " +
                    results.rules.length + ".";
            }

            console.log(
                "Hasil analisis Apriori berhasil dipulihkan:",
                results
            );

        } catch (error) {

            console.error(
                "Gagal memulihkan hasil analisis Apriori:",
                error
            );

            associationRules = [];

            renderEmptyResult(
                "Data hasil analisis tidak dapat dibaca."
            );

        }
    }

    // Membaca hasil analisis terakhir saat halaman pertama kali dibuka.
    restoreAnalysisResults();

    // Mempertahankan hasil ketika pengguna kembali ke halaman Apriori.
    window.addEventListener("pageshow", function () {
        restoreAnalysisResults();
    });

    // Memperbarui tampilan ketika hasil berubah dari tab browser lain.
    window.addEventListener("storage", function (event) {
        if (event.key === STORAGE_KEY) {
            restoreAnalysisResults();
        }
    });

    console.log(
        "Sistem Analisis Apriori berhasil dijalankan."
    );

});