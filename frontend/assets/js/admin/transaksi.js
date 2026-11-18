document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    // =====================================================
    // 1. ELEMENT HALAMAN
    // =====================================================

    const filterYear = document.getElementById("filterYear");
    const tableBody = document.getElementById("transactionTableBody");
    const monthPopup = document.getElementById("popup-select-month");
    const monthTrigger = document.querySelector(".transaction-month-trigger");
    const monthTriggerText = monthTrigger?.querySelector("span");

    const monthRadios = document.querySelectorAll(
        'input[name="popup-selected-month"]'
    );

    const monthApply = document.querySelector(
        ".month-popup-footer .artha-popup-btn--dark"
    );

    const monthCancel = document.querySelector(
        ".month-popup-footer .artha-popup-btn--text"
    );

    const monthClose = document.querySelector(".month-popup-close");

    const pagination = document.querySelector(".transaction-pagination");

    const pageNumbers = document.querySelector(
        ".transaction-page-numbers"
    );

    const paginationButtons = pagination?.querySelectorAll(
        ".transaction-page-nav"
    );

    const summaryCards = document.querySelectorAll(
        ".transaction-summary-card"
    );

    // =====================================================
    // 2. VALIDASI ELEMENT
    // =====================================================

    if (
        !filterYear ||
        !tableBody ||
        !monthPopup ||
        !monthTrigger ||
        !monthTriggerText ||
        !pageNumbers ||
        !paginationButtons ||
        paginationButtons.length < 2
    ) {
        console.error(
            "[ARTHA] Elemen halaman Transaksi tidak ditemukan."
        );
        return;
    }

    // =====================================================
    // 3. KONFIGURASI
    // =====================================================

    const API_BASE = "/artha/backend/api/";
    const ROWS_PER_PAGE = 5;

    const monthNames = {
        "01": "Januari",
        "02": "Februari",
        "03": "Maret",
        "04": "April",
        "05": "Mei",
        "06": "Juni",
        "07": "Juli",
        "08": "Agustus",
        "09": "September",
        "10": "Oktober",
        "11": "November",
        "12": "Desember"
    };

    let currentPage = 1;
    let selectedMonth = "all";
    let temporaryMonth = "all";

    let transactions = [];
    let filteredTransactions = [];

    // =====================================================
    // 4. API REQUEST
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

        return result;
    }

    function getResponseData(result) {
        if (!result || typeof result !== "object") {
            return null;
        }

        return result.data ?? result.payload ?? null;
    }

    // =====================================================
    // 5. FORMAT DATA
    // =====================================================

    function formatRupiah(value) {
        return "Rp." + new Intl.NumberFormat("id-ID", {
            maximumFractionDigits: 0
        }).format(Number(value) || 0);
    }

    // =====================================================
    // 6. MEMUAT TRANSAKSI DARI MYSQL
    // =====================================================

    async function loadTransactions() {
        tableBody.replaceChildren();

        const loadingRow = document.createElement("tr");
        const loadingCell = document.createElement("td");

        loadingCell.colSpan = 3;
        loadingCell.textContent = "Memuat data transaksi...";
        loadingCell.style.textAlign = "center";

        loadingRow.appendChild(loadingCell);
        tableBody.appendChild(loadingRow);

        try {
            const result = await apiRequest("admin/transactions");
            const data = getResponseData(result);

            if (!Array.isArray(data)) {
                throw new Error(
                    "Format data transaksi dari server tidak sesuai."
                );
            }

            transactions = data.map(function (item) {
                return {
                    id: String(
                        item.id ?? item.nomor_transaksi ?? ""
                    ),
                    date: String(item.date ?? ""),
                    total: Number(item.total) || 0,
                    year: String(item.year ?? ""),
                    month: String(item.month ?? "").padStart(2, "0"),
                    products: Array.isArray(item.products)
                        ? item.products.map(String)
                        : []
                };
            }).filter(function (item) {
                return (
                    item.id !== "" &&
                    /^\d{2}\/\d{2}\/\d{2}$/.test(item.date) &&
                    /^\d{4}$/.test(item.year) &&
                    /^(0[1-9]|1[0-2])$/.test(item.month) &&
                    Number.isFinite(item.total)
                );
            });

            // Urutkan tanggal terbaru terlebih dahulu.
            transactions.sort(function (a, b) {
                const dateA =
                    a.year + a.month + a.date.split("/")[0];

                const dateB =
                    b.year + b.month + b.date.split("/")[0];

                return dateB.localeCompare(dateA);
            });

            selectedMonth = "all";
            temporaryMonth = "all";
            currentPage = 1;

            updateYearOptions();
            updateMonthOptions();
            applyFilters();

            console.info(
                `[ARTHA] ${transactions.length} transaksi berhasil dimuat dari MySQL.`,
                transactions
            );

        } catch (error) {
            console.error(
                "[ARTHA] Gagal memuat transaksi:",
                error
            );

            tableBody.replaceChildren();

            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 3;
            cell.className = "transaction-empty-state";
            cell.textContent = "Gagal memuat data transaksi.";
            cell.style.textAlign = "center";

            row.appendChild(cell);
            tableBody.appendChild(row);

            if (
                window.arthaPopup &&
                typeof window.arthaPopup.error === "function"
            ) {
                await window.arthaPopup.error(error.message, {
                    title: "Gagal Memuat Transaksi"
                });
            } else {
                window.alert(error.message);
            }
        }
    }

    // =====================================================
    // 7. FILTER TAHUN
    // =====================================================

    function updateYearOptions() {
        const databaseYears = transactions
            .map(item => Number(item.year))
            .filter(year =>
                Number.isInteger(year) && year > 0
            );

        const availableYears = [
            ...new Set([
                2024,
                2025,
                2026,
                ...databaseYears
            ])
        ].sort((a, b) => a - b);

        filterYear.replaceChildren();

        const allOption = document.createElement("option");
        allOption.value = "all";
        allOption.textContent = "Semua Tahun";

        filterYear.appendChild(allOption);

        availableYears.forEach(function (year) {
            const option = document.createElement("option");

            option.value = String(year);
            option.textContent = String(year);

            filterYear.appendChild(option);
        });

        filterYear.value = "all";
    }

    function getTransactionsByYear(year) {
        return transactions.filter(function (transaction) {
            return (
                year === "all" ||
                transaction.year === year
            );
        });
    }

    // =====================================================
    // 8. BULAN TERSEDIA
    // =====================================================

    function getAvailableMonths() {
        const yearTransactions = getTransactionsByYear(
            filterYear.value
        );

        return [
            ...new Set(
                yearTransactions.map(item => item.month)
            )
        ].sort();
    }

    // =====================================================
    // 9. UPDATE PILIHAN BULAN
    // =====================================================

    function updateMonthOptions() {
        const availableMonths = getAvailableMonths();

        monthRadios.forEach(function (radio) {
            const label = radio.closest(
                ".month-popup-option"
            );

            if (radio.value === "all") {
                radio.disabled = false;

                if (label) {
                    label.classList.remove("month-unavailable");
                }

                return;
            }

            const available = availableMonths.includes(
                radio.value
            );

            radio.disabled = !available;

            if (label) {
                label.classList.toggle(
                    "month-unavailable",
                    !available
                );
            }
        });

        monthTriggerText.textContent =
            selectedMonth === "all"
                ? "Semua Bulan"
                : monthNames[selectedMonth];

        monthTrigger.setAttribute(
            "aria-disabled",
            "false"
        );
    }

    // =====================================================
    // 10. FILTER TRANSAKSI
    // =====================================================

    function applyFilters() {
        const selectedYear = filterYear.value;

        filteredTransactions = transactions.filter(
            function (transaction) {
                const yearMatch =
                    selectedYear === "all" ||
                    transaction.year === selectedYear;

                const monthMatch =
                    selectedMonth === "all" ||
                    transaction.month === selectedMonth;

                return yearMatch && monthMatch;
            }
        );

        currentPage = 1;

        renderTransactions();
        updatePeriodInformation();
    }

    // =====================================================
    // 11. RENDER TABEL
    // =====================================================

    function renderTransactions() {
        tableBody.replaceChildren();

        const totalData = filteredTransactions.length;

        const totalPages = Math.ceil(
            totalData / ROWS_PER_PAGE
        );

        currentPage = totalPages === 0
            ? 1
            : Math.min(currentPage, totalPages);

        const startIndex =
            (currentPage - 1) * ROWS_PER_PAGE;

        const pageData = filteredTransactions.slice(
            startIndex,
            startIndex + ROWS_PER_PAGE
        );

        if (pageData.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 3;
            cell.className = "transaction-empty-state";
            cell.textContent =
                "Tidak ada transaksi pada periode ini.";

            cell.style.textAlign = "center";

            row.appendChild(cell);
            tableBody.appendChild(row);

        } else {
            pageData.forEach(function (transaction) {
                const row = document.createElement("tr");

                row.dataset.year = transaction.year;
                row.dataset.month = transaction.month;
                row.dataset.products =
                    transaction.products.join("|");

                const idCell = document.createElement("td");
                idCell.textContent = transaction.id;

                const dateCell = document.createElement("td");
                dateCell.textContent = transaction.date;

                const totalCell = document.createElement("td");
                totalCell.textContent = formatRupiah(
                    transaction.total
                );

                row.append(
                    idCell,
                    dateCell,
                    totalCell
                );

                tableBody.appendChild(row);
            });
        }

        renderStatistics();
        renderPagination(totalPages);
    }

    // =====================================================
    // 12. STATISTIK
    // =====================================================

    function renderStatistics() {
        if (summaryCards.length < 2) return;

        const totalTransactions =
            filteredTransactions.length;

        const uniqueProducts = new Set();

        filteredTransactions.forEach(function (transaction) {
            transaction.products.forEach(function (product) {
                uniqueProducts.add(
                    product.trim().toLowerCase()
                );
            });
        });

        const totalElement =
            summaryCards[0].querySelector("h2");

        const productElement =
            summaryCards[1].querySelector("h2");

        if (totalElement) {
            totalElement.textContent = totalTransactions;
        }

        if (productElement) {
            productElement.textContent = uniqueProducts.size;
        }
    }

    // =====================================================
    // 13. INFORMASI PERIODE
    // =====================================================

    function updatePeriodInformation() {
        const periodTitle =
            document.getElementById("periodTitle");

        const periodDescription =
            document.getElementById("periodDescription");

        const periodYear =
            document.getElementById("periodYear");

        const year = filterYear.value;

        if (periodTitle) {
            periodTitle.textContent =
                selectedMonth === "all"
                    ? "Semua Periode"
                    : monthNames[selectedMonth];
        }

        if (periodDescription) {
            periodDescription.textContent = "Periode Tahun";
        }

        if (periodYear) {
            const databaseYears = transactions
                .map(item => Number(item.year))
                .filter(year =>
                    Number.isInteger(year) && year > 0
                );

            const minYear = Math.min(2024, ...databaseYears);
            const maxYear = Math.max(2026, ...databaseYears);

            periodYear.textContent =
                year === "all"
                    ? `${minYear}–${maxYear}`
                    : year;
        }
    }

    // =====================================================
    // 14. PAGINATION RESPONSIF
    // =====================================================

    function renderPagination(totalPages) {
        pageNumbers.replaceChildren();

        const previousButton = paginationButtons[0];
        const nextButton = paginationButtons[1];

        pagination.style.width = "100%";
        pagination.style.maxWidth = "100%";
        pagination.style.boxSizing = "border-box";
        pagination.style.overflow = "hidden";

        pageNumbers.style.display = "flex";
        pageNumbers.style.flexWrap = "wrap";
        pageNumbers.style.alignItems = "center";
        pageNumbers.style.justifyContent = "center";
        pageNumbers.style.gap = "6px";
        pageNumbers.style.width = "100%";
        pageNumbers.style.maxWidth = "100%";
        pageNumbers.style.minWidth = "0";
        pageNumbers.style.boxSizing = "border-box";
        pageNumbers.style.overflow = "hidden";

        previousButton.disabled = currentPage <= 1;

        nextButton.disabled =
            totalPages === 0 ||
            currentPage >= totalPages;

        function addPageButton(page) {
            const button = document.createElement("button");

            button.type = "button";
            button.className = "transaction-page-number";
            button.textContent = String(page);

            if (page === currentPage) {
                button.classList.add("active");
                button.setAttribute("aria-current", "page");
            }

            button.addEventListener("click", function () {
                currentPage = page;
                renderTransactions();
            });

            pageNumbers.appendChild(button);
        }

        function addEllipsis() {
            const ellipsis = document.createElement("span");

            ellipsis.className = "pagination-ellipsis";
            ellipsis.textContent = "…";
            ellipsis.setAttribute("aria-hidden", "true");

            pageNumbers.appendChild(ellipsis);
        }

        if (totalPages <= 5) {
            for (let page = 1; page <= totalPages; page++) {
                addPageButton(page);
            }

            return;
        }

        addPageButton(1);

        let startPage = Math.max(2, currentPage - 1);
        let endPage = Math.min(totalPages - 1, currentPage + 1);

        if (currentPage <= 3) {
            startPage = 2;
            endPage = 4;
        } else if (currentPage >= totalPages - 2) {
            startPage = totalPages - 3;
            endPage = totalPages - 1;
        }

        if (startPage > 2) {
            addEllipsis();
        }

        for (let page = startPage; page <= endPage; page++) {
            addPageButton(page);
        }

        if (endPage < totalPages - 1) {
            addEllipsis();
        }

        addPageButton(totalPages);
    }

    // =====================================================
    // 15. POPUP BULAN - DIPERBAIKI
    // =====================================================
    function openMonthPopup() {
        temporaryMonth = selectedMonth;

        monthRadios.forEach(function (radio) {
            radio.checked = radio.value === temporaryMonth;

            radio.disabled =
                radio.value !== "all" &&
                !getAvailableMonths().includes(radio.value);
        });

        // Paksa overlay tampil
        monthPopup.style.setProperty(
            "display",
            "flex",
            "important"
        );

        monthPopup.style.setProperty(
            "visibility",
            "visible",
            "important"
        );

        monthPopup.style.setProperty(
            "opacity",
            "1",
            "important"
        );

        monthPopup.style.setProperty(
            "pointer-events",
            "auto",
            "important"
        );

        monthPopup.style.setProperty(
            "z-index",
            "99999",
            "important"
        );

        monthPopup.setAttribute("aria-hidden", "false");

        monthPopup.classList.add("is-open");

        document.body.style.overflow = "hidden";

        console.info("[ARTHA] Popup bulan berhasil dibuka.");
    }

    function closeMonthPopup() {
        monthPopup.style.setProperty(
            "display",
            "none",
            "important"
        );

        monthPopup.style.visibility = "hidden";
        monthPopup.style.opacity = "0";
        monthPopup.style.pointerEvents = "none";

        monthPopup.setAttribute("aria-hidden", "true");

        monthPopup.classList.remove("is-open");

        document.body.style.overflow = "";
    }
    // =====================================================
    // 16. EVENT FILTER TAHUN
    // =====================================================

    filterYear.addEventListener("change", function () {
        selectedMonth = "all";
        temporaryMonth = "all";

        updateMonthOptions();
        applyFilters();
    });

    // =====================================================
    // 17. EVENT POPUP
    // =====================================================

    monthTrigger.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();

        openMonthPopup();
    });

    monthRadios.forEach(function (radio) {
        radio.addEventListener("change", function () {
            if (radio.checked && !radio.disabled) {
                temporaryMonth = radio.value;
            }
        });
    });

    monthApply?.addEventListener("click", function (event) {
        event.preventDefault();

        const selectedRadio = document.querySelector(
            'input[name="popup-selected-month"]:checked'
        );

        if (!selectedRadio || selectedRadio.disabled) {
            return;
        }

        selectedMonth = selectedRadio.value;

        monthTriggerText.textContent =
            selectedMonth === "all"
                ? "Semua Bulan"
                : monthNames[selectedMonth];

        applyFilters();
        closeMonthPopup();
    });

    monthCancel?.addEventListener("click", function (event) {
        event.preventDefault();

        temporaryMonth = selectedMonth;
        closeMonthPopup();
    });

    monthClose?.addEventListener("click", function (event) {
        event.preventDefault();

        temporaryMonth = selectedMonth;
        closeMonthPopup();
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            temporaryMonth = selectedMonth;
            closeMonthPopup();
        }
    });

    monthPopup.addEventListener("click", function (event) {
        if (event.target === monthPopup) {
            temporaryMonth = selectedMonth;
            closeMonthPopup();
        }
    });

    // =====================================================
    // 18. NAVIGASI PAGINATION
    // =====================================================

    paginationButtons[0].addEventListener("click", function () {
        if (currentPage > 1) {
            currentPage--;
            renderTransactions();
        }
    });

    paginationButtons[1].addEventListener("click", function () {
        const totalPages = Math.ceil(
            filteredTransactions.length / ROWS_PER_PAGE
        );

        if (currentPage < totalPages) {
            currentPage++;
            renderTransactions();
        }
    });

    // =====================================================
    // 19. INISIALISASI
    // =====================================================

    closeMonthPopup();

    loadTransactions();

    console.info(
        "[ARTHA] Modul Transaksi berhasil diinisialisasi."
    );

});