
document.addEventListener("DOMContentLoaded", function () {

    // 1. Mengambil elemen HTML
    const yearSelect = document.querySelector(".report-year-select");
    const chartBars = document.querySelector(".report-chart-bars");
    const summaryCards = document.querySelectorAll(".report-stat-card");
    const chart = document.querySelector(".report-chart-card");
    const tableBody = document.querySelector(".report-table tbody");
    const tableTitle = document.querySelector(".report-table-card h2");

    // 2. Memeriksa elemen halaman
    if (!yearSelect || !chartBars || !chart || summaryCards.length < 3 || !tableBody) {
        console.error("Elemen halaman Laporan Penjualan tidak ditemukan.");
        return;
    }

    // 3. Menentukan jumlah transaksi berdasarkan tahun
    const transactionCounts = {
        "2024": 149,
        "2025": 201,
        "2026": 0
    };

    // 4. Menentukan data grafik penjualan
    const salesData = {
        "2024": [35, 42, 50, 38, 55, 62, 48, 70, 58, 76, 65, 85],
        "2025": [35, 55, 43, 63, 56, 76, 54, 74, 62, 88, 80, 94]
    };

    // 5. Menentukan data laporan produk per tahun
    const productData = {
        "2024": [
            { name: "Beras 5 kg", quantity: 72, contribution: "16,8%" },
            { name: "Minyak Goreng 1 L", quantity: 68, contribution: "14,5%" },
            { name: "Gula Pasir 1 kg", quantity: 59, contribution: "12,1%" },
            { name: "Telur Ayam 1 kg", quantity: 51, contribution: "10,2%" },
            { name: "Mie Instan Goreng", quantity: 45, contribution: "8,4%" }
        ],

        "2025": [
            { name: "Beras 5 kg", quantity: 84, contribution: "18,5%" },
            { name: "Minyak Goreng 1 L", quantity: 76, contribution: "14,2%" },
            { name: "Gula Pasir 1 kg", quantity: 65, contribution: "11,8%" },
            { name: "Telur Ayam 1 kg", quantity: 58, contribution: "9,6%" },
            { name: "Mie Instan Goreng", quantity: 53, contribution: "7,4%" }
        ]
    };

    // 6. Menentukan nama bulan
    const months = [
        "Jan", "Feb", "Mar", "Apr",
        "Mei", "Jun", "Jul", "Agu",
        "Sep", "Okt", "Nov", "Des"
    ];

    // 7. Menyimpan tahun terakhir yang valid
    let previousValidYear = ["2024", "2025"].includes(yearSelect.value)
        ? yearSelect.value
        : "2025";

    let isPopupActive = false;

    // 8. Mengatur warna batang grafik
    function getBarColor(index) {
        return index % 3 === 2 ? "yellow" : "blue";
    }

    // 9. Memperbarui grafik penjualan
    function renderChart(year) {
        const data = salesData[year];

        if (!data || data.length !== 12) {
            console.error("Data grafik tahun " + year + " tidak tersedia.");
            return;
        }

        const barGroups = chartBars.querySelectorAll(".report-bar-group");

        if (barGroups.length !== 12) {
            console.error("Struktur grafik harus memiliki 12 batang.");
            return;
        }

        barGroups.forEach(function (group, index) {
            const bar = group.querySelector(".report-bar");
            const label = group.querySelector("span");

            if (!bar || !label) return;

            bar.style.setProperty("--bar-height", data[index] + "%");
            bar.classList.remove("blue", "yellow");
            bar.classList.add(getBarColor(index));

            bar.setAttribute(
                "aria-label",
                "Penjualan " + months[index] + ": " + data[index] + "% dari skala grafik"
            );

            label.textContent = months[index];
        });

        chart.setAttribute(
            "aria-label",
            "Grafik penjualan bulanan tahun " + year
        );
    }

    // 10. Memperbarui statistik laporan
    function renderStatistics(year) {
        const totalTransactions = summaryCards[0].querySelector("h2");
        const totalProducts = summaryCards[1].querySelector("h2");
        const reportPeriod = summaryCards[2].querySelector("h2");

        if (totalTransactions) {
            totalTransactions.textContent = transactionCounts[year];
        }

        if (totalProducts) {
            totalProducts.textContent = "60";
        }

        if (reportPeriod) {
            reportPeriod.textContent = year;
        }
    }

    // 11. Memperbarui tabel laporan produk
    function renderProductTable(year) {
        const products = productData[year];

        if (!products) {
            console.error("Data produk tahun " + year + " tidak tersedia.");
            return;
        }

        tableBody.replaceChildren();

        const sortedProducts = [...products].sort(function (a, b) {
            return b.quantity - a.quantity;
        });

        sortedProducts.forEach(function (product) {
            const row = document.createElement("tr");

            const nameCell = document.createElement("td");
            const quantityCell = document.createElement("td");
            const contributionCell = document.createElement("td");

            nameCell.textContent = product.name;
            quantityCell.textContent = product.quantity + " pcs";
            contributionCell.textContent = product.contribution;

            row.append(
                nameCell,
                quantityCell,
                contributionCell
            );

            tableBody.appendChild(row);
        });

        if (tableTitle) {
            tableTitle.textContent = "Tabel Laporan Produk - " + year;
        }

        console.log("Tabel produk tahun " + year + " berhasil diperbarui.");
    }

    // 12. Memperbarui seluruh laporan
    function updateReport(year) {
        renderChart(year);
        renderStatistics(year);
        renderProductTable(year);
    }

    // 13. Menampilkan popup tahun yang belum tersedia
    async function showUnavailablePopup() {
        if (isPopupActive) return;

        if (
            !window.arthaPopup ||
            typeof window.arthaPopup.info !== "function"
        ) {
            console.error("Custom Popup ARTHA belum dimuat.");
            return;
        }

        isPopupActive = true;

        try {
            await window.arthaPopup.info(
                "Data penjualan untuk tahun 2026 belum tersedia. Silakan pilih tahun 2024 atau 2025 untuk melihat laporan penjualan.",
                {
                    title: "Data Tahun 2026 Belum Tersedia",
                    confirmText: "Mengerti"
                }
            );
        } catch (error) {
            console.error("Gagal menampilkan popup laporan:", error);
        } finally {
            isPopupActive = false;
        }
    }

    // 14. Menangani perubahan dropdown tahun
    yearSelect.addEventListener("change", async function () {
        const selectedYear = yearSelect.value;

        if (!Object.prototype.hasOwnProperty.call(salesData, selectedYear)) {
            yearSelect.value = previousValidYear;
            await showUnavailablePopup();
            return;
        }

        previousValidYear = selectedYear;

        updateReport(selectedYear);

        console.log(
            "Seluruh laporan tahun " + selectedYear + " berhasil diperbarui."
        );
    });

    // 15. Menginisialisasi laporan berdasarkan tahun awal
    if (!Object.prototype.hasOwnProperty.call(salesData, yearSelect.value)) {
        yearSelect.value = "2025";
    }

    previousValidYear = yearSelect.value;

    updateReport(previousValidYear);

    console.log("JavaScript Laporan Penjualan berhasil dijalankan.");

});
