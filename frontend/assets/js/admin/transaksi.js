
document.addEventListener("DOMContentLoaded", function () {

    // 1. Mengambil elemen HTML
    const filterYear = document.getElementById("filterYear");
    const tableBody = document.getElementById("transactionTableBody");
    const monthPopup = document.getElementById("popup-select-month");
    const monthTrigger = document.querySelector(".transaction-month-trigger");
    const monthTriggerText = monthTrigger?.querySelector("span");
    const monthRadios = document.querySelectorAll('input[name="popup-selected-month"]');
    const monthApply = document.querySelector(".month-popup-footer .artha-popup-btn--dark");
    const monthCancel = document.querySelector(".month-popup-footer .artha-popup-btn--text");
    const monthClose = document.querySelector(".month-popup-close");
    const pagination = document.querySelector(".transaction-pagination");
    const pageNumbers = document.querySelector(".transaction-page-numbers");
    const paginationButtons = pagination?.querySelectorAll(".transaction-page-nav");
    const summaryCards = document.querySelectorAll(".transaction-summary-card");

    // 2. Memeriksa elemen utama
    if (!filterYear || !tableBody || !monthPopup || !monthTrigger || !pageNumbers || !paginationButtons || paginationButtons.length < 2) {
        console.error("Elemen halaman Transaksi tidak ditemukan.");
        return;
    }

    // 3. Konfigurasi halaman
    const STORAGE_KEY = "artha_transactions";
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

    // 4. Data dummy transaksi tahun 2024
    const simulatedTransactions = [
        { id: "TRX-2024-001", date: "15/01/24", customer: "Andi", total: 85000, year: "2024", month: "01", products: ["Beras", "Gula Pasir"] },
        { id: "TRX-2024-002", date: "20/06/24", customer: "Dina", total: 120000, year: "2024", month: "06", products: ["Minyak Goreng", "Telur"] },
        { id: "TRX-2024-003", date: "12/12/24", customer: "Budi", total: 175000, year: "2024", month: "12", products: ["Mi Instan", "Beras"] },
        { id: "TRX-2024-004", date: "08/03/24", customer: "Rina", total: 95000, year: "2024", month: "03", products: ["Gula Pasir", "Telur"] },
        { id: "TRX-2024-005", date: "17/03/24", customer: "Alya", total: 145000, year: "2024", month: "03", products: ["Beras", "Minyak Goreng"] },
        { id: "TRX-2024-006", date: "22/08/24", customer: "Syifa", total: 75000, year: "2024", month: "08", products: ["Mi Instan", "Telur"] },
        { id: "TRX-2024-007", date: "10/10/24", customer: "Indah", total: 110000, year: "2024", month: "10", products: ["Beras", "Gula Pasir"] }
    ];

    // 5. Mengambil data transaksi tahun 2025 dari HTML
    function loadHTMLTransactions() {
        return Array.from(tableBody.querySelectorAll("tr")).map(function (row) {
            const cells = row.querySelectorAll("td");

            if (cells.length < 4) return null;

            const dateParts = cells[1].textContent.trim().split("/");
            const year = row.dataset.year || (dateParts[2] === "25" ? "2025" : "");

            return {
                id: cells[0].textContent.trim(),
                date: cells[1].textContent.trim(),
                customer: cells[2].textContent.trim(),
                total: Number(cells[3].textContent.replace(/[^\d]/g, "")),
                year: year,
                month: row.dataset.month || dateParts[1],
                products: (row.dataset.products || "").split("|").filter(Boolean)
            };
        }).filter(function (transaction) {
            return transaction && transaction.id && transaction.year === "2025" && transaction.month;
        });
    }

    // 6. Menggabungkan seluruh data transaksi
    function initializeTransactions() {
        const htmlTransactions = loadHTMLTransactions();

        transactions = [...simulatedTransactions, ...htmlTransactions];

        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

            if (Array.isArray(saved)) {
                const validSaved = saved.filter(function (item) {
                    return item && item.id && ["2024", "2025"].includes(String(item.year)) && item.month;
                });

                transactions = [...transactions, ...validSaved];
            }
        } catch (error) {
            console.error("Gagal membaca data transaksi:", error);
        }

        const uniqueTransactions = new Map();

        transactions.forEach(function (transaction) {
            uniqueTransactions.set(transaction.id, transaction);
        });

        transactions = Array.from(uniqueTransactions.values());

        transactions.sort(function (a, b) {
            const dateA = a.year + a.month + a.date.split("/")[0];
            const dateB = b.year + b.month + b.date.split("/")[0];
            return dateB.localeCompare(dateA);
        });
    }

    // 7. Format Rupiah
    function formatRupiah(value) {
        return "Rp." + new Intl.NumberFormat("id-ID", {
            maximumFractionDigits: 0
        }).format(value);
    }

    // 8. Mengambil transaksi berdasarkan tahun
    function getTransactionsByYear(year) {
        return transactions.filter(function (transaction) {
            return year === "all" || transaction.year === year;
        });
    }

    // 9. Mengambil bulan yang mempunyai transaksi
    function getAvailableMonths() {
        const yearTransactions = getTransactionsByYear(filterYear.value);

        return [...new Set(yearTransactions.map(function (transaction) {
            return transaction.month;
        }))].sort();
    }

    // 10. Memperbarui pilihan bulan
    function updateMonthOptions() {
        const availableMonths = getAvailableMonths();

        monthRadios.forEach(function (radio) {
            const label = radio.closest(".month-popup-option");

            if (radio.value === "all") {
                radio.disabled = false;
                if (label) {
                    label.hidden = false;
                    label.classList.remove("month-unavailable");
                }
                return;
            }

            const available = availableMonths.includes(radio.value);

            radio.disabled = !available;

            if (label) {
                label.hidden = false;
                label.classList.toggle("month-unavailable", !available);
            }
        });

        monthTriggerText.textContent = selectedMonth === "all"
            ? "Semua Bulan"
            : monthNames[selectedMonth];

        monthTrigger.setAttribute(
            "aria-disabled",
            availableMonths.length ? "false" : "true"
        );
    }


    // 11. Popup informasi tahun 2026
    let unavailablePopupShown = false;

    async function showNoDataPopup() {
        if (unavailablePopupShown) return;

        if (!window.arthaPopup || typeof window.arthaPopup.info !== "function") {
            console.error("ARTHA Custom Popup belum tersedia. Periksa urutan script popup.js.");
            return;
        }

        unavailablePopupShown = true;

        await window.arthaPopup.info(
            "Data transaksi untuk tahun 2026 belum tersedia. Silakan pilih tahun 2024 atau 2025.",
            {
                title: "Data Belum Tersedia",
                confirmText: "Mengerti"
            }
        );
    }

    // 12. Memproses filter tahun dan bulan
    function applyFilters() {
        const selectedYear = filterYear.value;

        filteredTransactions = transactions.filter(function (transaction) {
            const yearMatch = selectedYear === "all" || transaction.year === selectedYear;
            const monthMatch = selectedMonth === "all" || transaction.month === selectedMonth;

            return yearMatch && monthMatch;
        });

        currentPage = 1;

        renderTransactions();
        updatePeriodInformation();
    }

    // 13. Menampilkan transaksi
    function renderTransactions() {
        tableBody.replaceChildren();

        const totalData = filteredTransactions.length;
        const totalPages = Math.ceil(totalData / ROWS_PER_PAGE);

        currentPage = totalPages === 0 ? 1 : Math.min(currentPage, totalPages);

        const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
        const pageData = filteredTransactions.slice(startIndex, startIndex + ROWS_PER_PAGE);

        if (pageData.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 4;
            cell.className = "transaction-empty-state";
            cell.textContent = "Tidak ada transaksi pada periode ini.";

            row.appendChild(cell);
            tableBody.appendChild(row);
        } else {
            pageData.forEach(function (transaction) {
                const row = document.createElement("tr");

                row.dataset.year = transaction.year;
                row.dataset.month = transaction.month;

                const idCell = document.createElement("td");
                idCell.textContent = transaction.id;

                const dateCell = document.createElement("td");
                dateCell.textContent = transaction.date;

                const customerCell = document.createElement("td");
                customerCell.textContent = transaction.customer;

                const totalCell = document.createElement("td");
                totalCell.textContent = formatRupiah(transaction.total);

                row.append(idCell, dateCell, customerCell, totalCell);
                tableBody.appendChild(row);
            });
        }

        renderStatistics();
        renderPagination(totalPages);
    }

    // 14. Memperbarui statistik
    function renderStatistics() {
        if (summaryCards.length < 3) return;

        const totalTransactions = filteredTransactions.length;
        const uniqueProducts = new Set();
        const uniqueCustomers = new Set();

        filteredTransactions.forEach(function (transaction) {
            (transaction.products || []).forEach(function (product) {
                uniqueProducts.add(product.trim().toLowerCase());
            });

            uniqueCustomers.add(transaction.customer.trim().toLowerCase());
        });

        summaryCards[0].querySelector("h2").textContent = totalTransactions;
        summaryCards[1].querySelector("h2").textContent = uniqueProducts.size;
        summaryCards[2].querySelector("h2").textContent = uniqueCustomers.size;
    }

    // 15. Memperbarui informasi periode
    function updatePeriodInformation() {
        const periodTitle = document.getElementById("periodTitle");
        const periodDescription = document.getElementById("periodDescription");
        const periodYear = document.getElementById("periodYear");

        const year = filterYear.value;

        if (periodTitle) {
            periodTitle.textContent = selectedMonth === "all"
                ? "Semua Periode"
                : monthNames[selectedMonth];
        }

        if (periodDescription) {
            periodDescription.textContent = year === "all"
                ? "Menampilkan Tahun"
                : "Periode Tahun";
        }

        if (periodYear) {
            periodYear.textContent = year === "all"
                ? "2024–2026"
                : year;
        }
    }

    // 16. Membuat pagination otomatis
    function renderPagination(totalPages) {
        pageNumbers.replaceChildren();

        const previousButton = paginationButtons[0];
        const nextButton = paginationButtons[1];

        previousButton.disabled = currentPage <= 1;
        nextButton.disabled = totalPages === 0 || currentPage >= totalPages;

        for (let page = 1; page <= totalPages; page++) {
            const button = document.createElement("button");

            button.type = "button";
            button.className = "transaction-page-number";
            button.textContent = page;

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
    }

    // 17. Membuka popup pilihan bulan
    function openMonthPopup() {
        if (!getAvailableMonths().length) {
            window.arthaPopup?.info(
                "Belum ada data transaksi untuk tahun ini.",
                { title: "Data Belum Tersedia" }
            );
            return;
        }

        temporaryMonth = selectedMonth;

        monthRadios.forEach(function (radio) {
            radio.checked = radio.value === temporaryMonth;
        });

        monthPopup.style.display = "flex";
        monthPopup.style.visibility = "visible";
        monthPopup.style.opacity = "1";
        monthPopup.style.pointerEvents = "auto";
        monthPopup.setAttribute("aria-hidden", "false");
    }

    // 18. Menutup popup bulan
    function closeMonthPopup() {
        monthPopup.style.display = "none";
        monthPopup.style.visibility = "hidden";
        monthPopup.style.opacity = "0";
        monthPopup.style.pointerEvents = "none";
        monthPopup.setAttribute("aria-hidden", "true");
    }

    // 19. Menangani perubahan tahun
    filterYear.addEventListener("change", async function () {
        const selectedYear = filterYear.value;

        selectedMonth = "all";
        temporaryMonth = "all";

        updateMonthOptions();
        applyFilters();

        if (selectedYear === "2026") {
            await showNoDataPopup();
        } else {
            unavailablePopupShown = false;
        }
    });


    // 20. Membuka pilihan bulan
    monthTrigger.addEventListener("click", function (event) {
        event.preventDefault();
        openMonthPopup();
    });

    // 21. Menangani perubahan pilihan bulan
    monthRadios.forEach(function (radio) {
        radio.addEventListener("change", function () {
            if (radio.checked && !radio.disabled) {
                temporaryMonth = radio.value;
            }
        });
    });

    // 22. Menerapkan filter bulan
    monthApply?.addEventListener("click", function (event) {
        event.preventDefault();

        const selectedRadio = document.querySelector('input[name="popup-selected-month"]:checked');

        if (!selectedRadio || selectedRadio.disabled) return;

        selectedMonth = selectedRadio.value;

        monthTriggerText.textContent = selectedMonth === "all"
            ? "Semua Bulan"
            : monthNames[selectedMonth];

        applyFilters();
        closeMonthPopup();
    });

    // 23. Membatalkan pilihan bulan
    monthCancel?.addEventListener("click", function (event) {
        event.preventDefault();
        temporaryMonth = selectedMonth;
        closeMonthPopup();
    });

    // 24. Menutup popup bulan
    monthClose?.addEventListener("click", function (event) {
        event.preventDefault();
        temporaryMonth = selectedMonth;
        closeMonthPopup();
    });

    // 25. Menutup popup dengan Escape
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeMonthPopup();
        }
    });

    // 26. Menutup popup ketika overlay diklik
    monthPopup.addEventListener("click", function (event) {
        if (event.target === monthPopup) {
            closeMonthPopup();
        }
    });

    // 27. Pagination sebelumnya
    paginationButtons[0].addEventListener("click", function () {
        if (currentPage > 1) {
            currentPage--;
            renderTransactions();
        }
    });

    // 28. Pagination berikutnya
    paginationButtons[1].addEventListener("click", function () {
        const totalPages = Math.ceil(filteredTransactions.length / ROWS_PER_PAGE);

        if (currentPage < totalPages) {
            currentPage++;
            renderTransactions();
        }
    });

    // 29. Inisialisasi halaman
    initializeTransactions();
    updateMonthOptions();
    applyFilters();
    closeMonthPopup();

    // Menampilkan popup otomatis jika halaman dibuka dengan tahun 2026
    if (filterYear.value === "2026") {
        showNoDataPopup();
    }

    console.log("ARTHA Transaksi berhasil dijalankan.", {
        totalTransaksi: transactions.length,
        tahunTersedia: [...new Set(transactions.map(function (item) {
            return item.year;
        }))],
        transaksi: transactions
    });


});
