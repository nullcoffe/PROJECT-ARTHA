
document.addEventListener("DOMContentLoaded", function () {

    // Mengambil elemen halaman
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

    // Memastikan elemen utama tersedia
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
        console.error("Elemen halaman Transaksi tidak ditemukan.");
        return;
    }

    // Konfigurasi halaman
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
    let unavailablePopupShown = false;

    // Data simulasi transaksi tahun 2024
    const simulatedTransactions = [
        {
            id: "TRX-2024-001",
            date: "15/01/24",
            total: 85000,
            year: "2024",
            month: "01",
            products: ["Beras", "Gula Pasir"]
        },
        {
            id: "TRX-2024-002",
            date: "20/06/24",
            total: 120000,
            year: "2024",
            month: "06",
            products: ["Minyak Goreng", "Telur"]
        },
        {
            id: "TRX-2024-003",
            date: "12/12/24",
            total: 175000,
            year: "2024",
            month: "12",
            products: ["Mi Instan", "Beras"]
        },
        {
            id: "TRX-2024-004",
            date: "08/03/24",
            total: 95000,
            year: "2024",
            month: "03",
            products: ["Gula Pasir", "Telur"]
        },
        {
            id: "TRX-2024-005",
            date: "17/03/24",
            total: 145000,
            year: "2024",
            month: "03",
            products: ["Beras", "Minyak Goreng"]
        },
        {
            id: "TRX-2024-006",
            date: "22/08/24",
            total: 75000,
            year: "2024",
            month: "08",
            products: ["Mi Instan", "Telur"]
        },
        {
            id: "TRX-2024-007",
            date: "10/10/24",
            total: 110000,
            year: "2024",
            month: "10",
            products: ["Beras", "Gula Pasir"]
        }
    ];

    // Memvalidasi format tanggal transaksi
    function validateDate(date) {
        if (typeof date !== "string") return false;

        return /^\d{2}\/\d{2}\/\d{2}$/.test(date);
    }

    // Memvalidasi data transaksi
 
    function validateTransaction(transaction) {
        if (!transaction || typeof transaction !== "object") {
            return false;
        }

        const id = String(transaction.id || "").trim();
        const year = String(transaction.year || "");
        const month = String(transaction.month || "");
        const total = Number(transaction.total);

        if (!id) return false;

        if (!["2024", "2025"].includes(year)) {
            return false;
        }

        if (!/^(0[1-9]|1[0-2])$/.test(month)) {
            return false;
        }

        if (!Number.isFinite(total) || total < 0) {
            return false;
        }

        if (!validateDate(transaction.date)) {
            return false;
        }

        const dateParts = transaction.date.split("/");
        const dateMonth = dateParts[1];
        const dateYear = dateParts[2];

        if (dateMonth !== month) return false;

        if (dateYear !== year.slice(-2)) return false;

        if (
            !Array.isArray(transaction.products) ||
            !transaction.products.every(function (product) {
                return typeof product === "string";
            })
        ) {
            return false;
        }

        return true;
    }

    // Membaca transaksi tahun 2025 dari HTML

    // Membaca transaksi dari HTML
    function loadHTMLTransactions() {

        return Array.from(
            tableBody.querySelectorAll("tr")
        ).map(function (row) {

            const cells = row.querySelectorAll("td");

            if (cells.length !== 3) return null;

            const date = cells[1].textContent.trim();
            const dateParts = date.split("/");

            const transaction = {

                id: cells[0].textContent.trim(),

                date: date,

                total: Number(
                    cells[2].textContent.replace(/[^\d]/g, "")
                ),

                year: String(
                    row.dataset.year ||
                    (dateParts[2] === "25" ? "2025" : "")
                ),

                month: String(
                    row.dataset.month || dateParts[1] || ""
                ).padStart(2, "0"),

                products: (row.dataset.products || "")
                    .split("|")
                    .map(function (product) {
                        return product.trim();
                    })
                    .filter(Boolean)

            };

            return validateTransaction(transaction)
                ? transaction
                : null;

        }).filter(Boolean);

    }

    // Membaca transaksi dari localStorage
    function loadSavedTransactions() {
        try {
            const saved = JSON.parse(
                localStorage.getItem(STORAGE_KEY) || "[]"
            );

            if (!Array.isArray(saved)) {
                console.warn(
                    "Format penyimpanan transaksi tidak valid."
                );
                return [];
            }

            const validSaved = saved.filter(
                validateTransaction
            );

            if (validSaved.length !== saved.length) {
                console.warn(
                    "Beberapa data transaksi sementara tidak valid dan diabaikan."
                );
            }

            return validSaved;

        } catch (error) {

            console.error(
                "Gagal membaca data transaksi:",
                error
            );

            return [];
        }
    }

    // Menggabungkan seluruh sumber transaksi
    function initializeTransactions() {

        const htmlTransactions = loadHTMLTransactions();
        const savedTransactions = loadSavedTransactions();

        const combinedTransactions = [
            ...simulatedTransactions,
            ...htmlTransactions,
            ...savedTransactions
        ];

        // Menghindari transaksi dengan ID duplikat
        const uniqueTransactions = new Map();

        combinedTransactions.forEach(function (transaction) {

            if (!validateTransaction(transaction)) return;

            uniqueTransactions.set(
                transaction.id,
                transaction
            );

        });

        transactions = Array.from(
            uniqueTransactions.values()
        );

        // Mengurutkan transaksi dari tanggal terbaru
        transactions.sort(function (a, b) {

            const dateA = a.year + a.month +
                a.date.split("/")[0];

            const dateB = b.year + b.month +
                b.date.split("/")[0];

            return dateB.localeCompare(dateA);

        });

    }

    // Format mata uang Rupiah
    function formatRupiah(value) {
        return "Rp." + new Intl.NumberFormat("id-ID", {
            maximumFractionDigits: 0
        }).format(value);
    }

    // Mengambil transaksi berdasarkan tahun
    function getTransactionsByYear(year) {
        return transactions.filter(function (transaction) {
            return year === "all" ||
                transaction.year === year;
        });
    }

    // Mengambil bulan yang memiliki transaksi
    function getAvailableMonths() {

        const yearTransactions = getTransactionsByYear(
            filterYear.value
        );

        return [
            ...new Set(
                yearTransactions.map(function (transaction) {
                    return transaction.month;
                })
            )
        ].sort();

    }

    // Memperbarui pilihan bulan
    function updateMonthOptions() {

        const availableMonths = getAvailableMonths();

        monthRadios.forEach(function (radio) {

            const label = radio.closest(
                ".month-popup-option"
            );

            if (radio.value === "all") {

                radio.disabled = false;

                if (label) {
                    label.hidden = false;
                    label.classList.remove(
                        "month-unavailable"
                    );
                }

                return;
            }

            const available = availableMonths.includes(
                radio.value
            );

            radio.disabled = !available;

            if (label) {

                label.hidden = false;

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
            availableMonths.length ? "false" : "true"
        );

    }

    // Menampilkan informasi ketika data tahun tidak tersedia
    async function showNoDataPopup() {

        if (unavailablePopupShown) return;

        if (
            !window.arthaPopup ||
            typeof window.arthaPopup.info !== "function"
        ) {
            console.error(
                "ARTHA Custom Popup belum tersedia."
            );
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

    // Memproses filter tahun dan bulan
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

    // Menampilkan transaksi pada tabel
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

            row.appendChild(cell);
            tableBody.appendChild(row);

        } else {

            pageData.forEach(function (transaction) {

                const row = document.createElement("tr");

                row.dataset.year = transaction.year;
                row.dataset.month = transaction.month;

                row.dataset.products =
                    transaction.products.join("|");

                // Kolom 1: ID Transaksi
                const idCell = document.createElement("td");
                idCell.textContent = transaction.id;

                // Kolom 2: Tanggal
                const dateCell = document.createElement("td");
                dateCell.textContent = transaction.date;

                // Kolom 3: Total
                const totalCell = document.createElement("td");

                totalCell.textContent = formatRupiah(
                    transaction.total
                );

                // Memasukkan tepat tiga kolom
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
    // Memperbarui statistik transaksi
    function renderStatistics() {

        if (summaryCards.length < 2) return;

        const totalTransactions =
            filteredTransactions.length;

        const uniqueProducts = new Set();

        filteredTransactions.forEach(function (transaction) {

            (transaction.products || []).forEach(
                function (product) {

                    uniqueProducts.add(
                        product.trim().toLowerCase()
                    );

                }
            );

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

    // Memperbarui informasi periode
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

            periodDescription.textContent =
                year === "all"
                    ? "Menampilkan Tahun"
                    : "Periode Tahun";

        }

        if (periodYear) {

            periodYear.textContent =
                year === "all"
                    ? "2024–2026"
                    : year;

        }

    }

    // Membuat pagination
    function renderPagination(totalPages) {

        pageNumbers.replaceChildren();

        const previousButton = paginationButtons[0];
        const nextButton = paginationButtons[1];

        previousButton.disabled = currentPage <= 1;

        nextButton.disabled =
            totalPages === 0 ||
            currentPage >= totalPages;

        for (
            let page = 1;
            page <= totalPages;
            page++
        ) {

            const button = document.createElement("button");

            button.type = "button";
            button.className = "transaction-page-number";
            button.textContent = page;

            if (page === currentPage) {

                button.classList.add("active");

                button.setAttribute(
                    "aria-current",
                    "page"
                );

            }

            button.addEventListener("click", function () {

                currentPage = page;
                renderTransactions();

            });

            pageNumbers.appendChild(button);

        }

    }

    // Membuka popup pilihan bulan
    function openMonthPopup() {

        if (!getAvailableMonths().length) {

            window.arthaPopup?.info(
                "Belum ada data transaksi untuk tahun ini.",
                {
                    title: "Data Belum Tersedia"
                }
            );

            return;
        }

        temporaryMonth = selectedMonth;

        monthRadios.forEach(function (radio) {

            radio.checked =
                radio.value === temporaryMonth;

        });

        monthPopup.style.display = "flex";
        monthPopup.style.visibility = "visible";
        monthPopup.style.opacity = "1";
        monthPopup.style.pointerEvents = "auto";

        monthPopup.setAttribute(
            "aria-hidden",
            "false"
        );

    }

    // Menutup popup pilihan bulan
    function closeMonthPopup() {

        monthPopup.style.display = "none";
        monthPopup.style.visibility = "hidden";
        monthPopup.style.opacity = "0";
        monthPopup.style.pointerEvents = "none";

        monthPopup.setAttribute(
            "aria-hidden",
            "true"
        );

    }

    // Menangani perubahan tahun
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

    // Membuka popup bulan
    monthTrigger.addEventListener("click", function (event) {

        event.preventDefault();
        openMonthPopup();

    });

    // Menangani perubahan pilihan bulan
    monthRadios.forEach(function (radio) {

        radio.addEventListener("change", function () {

            if (radio.checked && !radio.disabled) {
                temporaryMonth = radio.value;
            }

        });

    });

    // Menerapkan filter bulan
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

    // Membatalkan pilihan bulan
    monthCancel?.addEventListener("click", function (event) {

        event.preventDefault();

        temporaryMonth = selectedMonth;
        closeMonthPopup();

    });

    // Menutup popup bulan
    monthClose?.addEventListener("click", function (event) {

        event.preventDefault();

        temporaryMonth = selectedMonth;
        closeMonthPopup();

    });

    // Menutup popup dengan Escape
    document.addEventListener("keydown", function (event) {

        if (event.key === "Escape") {
            closeMonthPopup();
        }

    });

    // Menutup popup ketika overlay diklik
    monthPopup.addEventListener("click", function (event) {

        if (event.target === monthPopup) {
            closeMonthPopup();
        }

    });

    // Pagination sebelumnya
    paginationButtons[0].addEventListener("click", function () {

        if (currentPage > 1) {

            currentPage--;
            renderTransactions();

        }

    });

    // Pagination berikutnya
    paginationButtons[1].addEventListener("click", function () {

        const totalPages = Math.ceil(
            filteredTransactions.length / ROWS_PER_PAGE
        );

        if (currentPage < totalPages) {

            currentPage++;
            renderTransactions();

        }

    });

    // Menyiapkan data transaksi
    initializeTransactions();

    // Menyiapkan pilihan bulan
    updateMonthOptions();

    // Menampilkan data awal
    applyFilters();

    // Menutup popup saat halaman pertama kali dimuat
    closeMonthPopup();

    // Menampilkan informasi tahun 2026
    if (filterYear.value === "2026") {
        showNoDataPopup();
    }

    // Informasi pengujian
    console.log("ARTHA Transaksi berhasil dijalankan.", {
        totalTransaksi: transactions.length,

        tahunTersedia: [
            ...new Set(
                transactions.map(function (item) {
                    return item.year;
                })
            )
        ],

        transaksi: transactions
    });

});
