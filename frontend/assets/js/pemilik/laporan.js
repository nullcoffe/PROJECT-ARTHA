document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    const yearSelect = document.querySelector(".report-year-select");
    const chartBars = document.querySelector(".report-chart-bars");
    const summaryCards = document.querySelectorAll(".report-stat-card");
    const chart = document.querySelector(".report-chart-card");
    const yAxis = document.querySelector(".report-y-axis");
    const tableBody = document.querySelector(".report-table tbody");
    const tableTitle = document.querySelector(".report-table-card h2");

    const months = [
        "Jan", "Feb", "Mar", "Apr",
        "Mei", "Jun", "Jul", "Agu",
        "Sep", "Okt", "Nov", "Des"
    ];

    if (
        !yearSelect ||
        !chartBars ||
        summaryCards.length < 3 ||
        !tableBody ||
        !window.ARTHA_API
    ) {
        console.error("Komponen laporan atau ARTHA API tidak ditemukan.");
        return;
    }

    const barGroups = chartBars.querySelectorAll(".report-bar-group");

    if (barGroups.length !== 12) {
        console.error("Grafik laporan harus memiliki 12 batang.");
        return;
    }

    let currentRequest = 0;

    function formatNumber(value) {
        return new Intl.NumberFormat("id-ID", {
            maximumFractionDigits: 2
        }).format(Number(value) || 0);
    }

    function formatRupiah(value) {
        return "Rp " + new Intl.NumberFormat("id-ID", {
            maximumFractionDigits: 0
        }).format(Number(value) || 0);
    }

    function formatCompact(value) {
        const amount = Number(value) || 0;

        if (amount >= 1000000000) {
            return "Rp" + (amount / 1000000000).toFixed(1) + " M";
        }

        if (amount >= 1000000) {
            return "Rp" + (amount / 1000000).toFixed(1) + " jt";
        }

        if (amount >= 1000) {
            return "Rp" + (amount / 1000).toFixed(0) + " rb";
        }

        return formatRupiah(amount);
    }

    function showLoading() {
        summaryCards.forEach(function (card) {
            const value = card.querySelector("h2");

            if (value) {
                value.textContent = "Memuat...";
            }
        });

        tableBody.innerHTML = `
            <tr>
                <td colspan="3">Memuat data laporan...</td>
            </tr>
        `;
    }

    function showError(message) {
        if (
            window.arthaPopup &&
            typeof window.arthaPopup.error === "function"
        ) {
            window.arthaPopup.error(message, {
                title: "Gagal Memuat Laporan",
                confirmText: "Mengerti"
            });
        } else if (
            window.arthaPopup &&
            typeof window.arthaPopup.info === "function"
        ) {
            window.arthaPopup.info(message, {
                title: "Gagal Memuat Laporan",
                confirmText: "Mengerti"
            });
        } else {
            alert(message);
        }
    }

    function renderStatistics(data) {
        const totalTransactions =
            summaryCards[0].querySelector("h2");

        const totalProducts =
            summaryCards[1].querySelector("h2");

        const reportPeriod =
            summaryCards[2].querySelector("h2");

        if (totalTransactions) {
            totalTransactions.textContent =
                formatNumber(data.total_transaksi);
        }

        if (totalProducts) {
            totalProducts.textContent =
                formatNumber(data.produk_unik);
        }

        if (reportPeriod) {
            reportPeriod.textContent = data.tahun;
        }
    }

    function renderChart(monthlySales, year) {
        const values = Array.isArray(monthlySales)
            ? monthlySales
            : [];

        const normalizedValues = Array.from(
            { length: 12 },
            function (_, index) {
                return Number(values[index]) || 0;
            }
        );

        const maximum = Math.max(
            ...normalizedValues,
            0
        );

        const scaleMaximum = maximum > 0
            ? Math.ceil(maximum / 4) * 4
            : 4;

        barGroups.forEach(function (group, index) {
            const bar = group.querySelector(".report-bar");
            const label = group.querySelector("span");

            if (!bar || !label) return;

            const value = normalizedValues[index];

            const height = maximum > 0
                ? (value / scaleMaximum) * 100
                : 0;

            bar.style.setProperty(
                "--bar-height",
                Math.max(height, value > 0 ? 2 : 0) + "%"
            );

            bar.classList.remove("blue", "yellow");

            bar.classList.add(
                value === maximum && maximum > 0
                    ? "yellow"
                    : "blue"
            );

            bar.title =
                months[index] + " " + year + ": " +
                formatRupiah(value);

            bar.setAttribute(
                "aria-label",
                "Penjualan " + months[index] + " " +
                year + ": " + formatRupiah(value)
            );

            label.textContent = months[index];
        });

        if (yAxis) {
            const axisValues = [
                scaleMaximum,
                scaleMaximum * 0.75,
                scaleMaximum * 0.5,
                scaleMaximum * 0.25,
                0
            ];

            const labels = yAxis.querySelectorAll("span");

            labels.forEach(function (label, index) {
                if (axisValues[index] !== undefined) {
                    label.textContent =
                        formatCompact(axisValues[index]);
                }
            });
        }

        chart.setAttribute(
            "aria-label",
            "Grafik penjualan bulanan tahun " + year
        );
    }

    function renderProductTable(products, year) {
        tableBody.replaceChildren();

        if (tableTitle) {
            tableTitle.textContent =
                "Tabel Laporan Produk - " + year;
        }

        if (!Array.isArray(products) || products.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 3;
            cell.textContent =
                "Belum ada penjualan produk pada tahun ini.";

            row.appendChild(cell);
            tableBody.appendChild(row);

            return;
        }

        products.forEach(function (product) {
            const row = document.createElement("tr");

            const nameCell = document.createElement("td");
            const quantityCell = document.createElement("td");
            const contributionCell = document.createElement("td");

            nameCell.textContent =
                product.nama_produk || "-";

            quantityCell.textContent =
                formatNumber(product.jumlah_terjual) +
                " " +
                (product.satuan || "");

            contributionCell.textContent =
                formatNumber(product.kontribusi) + "%";

            row.append(
                nameCell,
                quantityCell,
                contributionCell
            );

            tableBody.appendChild(row);
        });
    }

    async function loadReport(year) {
        const requestId = ++currentRequest;

        showLoading();

        try {
            const response = await window.ARTHA_API.get(
                "pemilik/laporan?year=" +
                encodeURIComponent(year)
            );

            if (requestId !== currentRequest) {
                return;
            }

            const data = response.data;

            if (
                !data ||
                !Array.isArray(data.penjualan_bulanan) ||
                !Array.isArray(data.produk_terlaris)
            ) {
                throw new Error(
                    "Format data laporan dari server tidak sesuai."
                );
            }

            renderStatistics(data);

            renderChart(
                data.penjualan_bulanan,
                data.tahun
            );

            renderProductTable(
                data.produk_terlaris,
                data.tahun
            );

            console.log(
                "Laporan Pemilik berhasil dimuat:",
                data
            );

        } catch (error) {
            if (requestId !== currentRequest) {
                return;
            }

            console.error(
                "Gagal mengambil laporan penjualan:",
                error
            );

            tableBody.innerHTML = `
                <tr>
                    <td colspan="3">
                        Gagal memuat data laporan.
                    </td>
                </tr>
            `;

            showError(
                error.message ||
                "Terjadi kesalahan ketika mengambil laporan penjualan."
            );
        }
    }

    yearSelect.addEventListener("change", function () {
        const selectedYear = yearSelect.value;

        if (!/^\d{4}$/.test(selectedYear)) {
            return;
        }

        loadReport(selectedYear);
    });

    loadReport(yearSelect.value);

    console.log(
        "JavaScript Laporan Penjualan ARTHA berhasil dijalankan."
    );
});