
document.addEventListener("DOMContentLoaded", async function () {
    "use strict";

    // Mengambil elemen dashboard.
    const yearSelect = document.getElementById("adminYearSelect");
    const chart = document.getElementById("adminSalesChart");
    const chartBars = document.getElementById("adminChartBars");
    const chartYAxis = document.getElementById("adminChartYAxis");

    const totalProduk = document.getElementById("adminTotalProduk");
    const totalPengguna = document.getElementById("adminTotalPengguna");
    const stokMenipis = document.getElementById("adminStokMenipis");

    const months = [
        "Jan", "Feb", "Mar", "Apr",
        "Mei", "Jun", "Jul", "Agu",
        "Sep", "Okt", "Nov", "Des"
    ];

    // Memastikan seluruh elemen tersedia.
    if (
        !yearSelect ||
        !chart ||
        !chartBars ||
        !chartYAxis ||
        !totalProduk ||
        !totalPengguna ||
        !stokMenipis
    ) {
        console.error(
            "[ARTHA] Elemen Dashboard Admin tidak lengkap."
        );
        return;
    }

    // Format angka.
    function formatNumber(value) {
        return Number(value || 0).toLocaleString("id-ID");
    }

    // Format nilai sumbu grafik.
    function formatRupiahAxis(value) {
        if (value >= 1000000000) {
            return "Rp" + (value / 1000000000)
                .toLocaleString("id-ID", {
                    maximumFractionDigits: 1
                }) + " M";
        }

        if (value >= 1000000) {
            return "Rp" + (value / 1000000)
                .toLocaleString("id-ID", {
                    maximumFractionDigits: 1
                }) + " jt";
        }

        if (value >= 1000) {
            return "Rp" + (value / 1000)
                .toLocaleString("id-ID", {
                    maximumFractionDigits: 1
                }) + " rb";
        }

        return "Rp" + formatNumber(value);
    }

    // Menentukan skala grafik secara otomatis.
    function getChartMaximum(values) {
        const maximumValue = Math.max(
            ...values.map(Number),
            0
        );

        if (maximumValue === 0) {
            return 4;
        }

        const roughStep = maximumValue / 4;
        const magnitude = Math.pow(
            10,
            Math.floor(Math.log10(roughStep))
        );

        const normalized = roughStep / magnitude;

        let niceStep;

        if (normalized <= 1) {
            niceStep = 1;
        } else if (normalized <= 2) {
            niceStep = 2;
        } else if (normalized <= 5) {
            niceStep = 5;
        } else {
            niceStep = 10;
        }

        return niceStep * magnitude * 4;
    }

    // Membuat batang grafik.
    function createBar(value, index, maximum) {
        const group = document.createElement("div");
        group.className = "admin-bar-group";

        const barArea = document.createElement("div");
        barArea.className = "admin-bar-area";

        const bar = document.createElement("div");

        const color = index % 3 === 2
            ? "yellow"
            : "blue";

        bar.className = "admin-bar " + color;

        const numericValue = Number(value) || 0;

        const height = maximum > 0
            ? (numericValue / maximum) * 100
            : 0;

        bar.style.setProperty(
            "--bar-height",
            height + "%"
        );

        if (numericValue <= 0) {
            bar.style.minHeight = "0";
        }

        bar.title =
            months[index] + ": Rp " + formatNumber(numericValue);

        bar.setAttribute(
            "aria-label",
            "Penjualan " + months[index] +
            ": Rp " + formatNumber(numericValue)
        );

        const monthLabel = document.createElement("span");
        monthLabel.textContent = months[index];

        barArea.appendChild(bar);

        group.appendChild(barArea);
        group.appendChild(monthLabel);

        return group;
    }

    // Menampilkan grafik dari hasil database.
    function renderChart(values, year) {
        const maximum = getChartMaximum(values);

        chartBars.replaceChildren();
        chartYAxis.replaceChildren();

        // Membuat lima label sumbu Y.
        for (let index = 4; index >= 0; index--) {
            const label = document.createElement("span");

            const value = maximum * index / 4;

            label.textContent = index === 0
                ? "0"
                : formatRupiahAxis(value);

            chartYAxis.appendChild(label);
        }

        // Membuat 12 batang berdasarkan data penjualan.
        values.forEach(function (value, index) {
            chartBars.appendChild(
                createBar(value, index, maximum)
            );
        });

        chart.setAttribute(
            "aria-label",
            "Grafik penjualan bulanan tahun " + year
        );

        console.info(
            "[ARTHA] Grafik penjualan tahun " +
            year + " berhasil ditampilkan."
        );
    }

    // Mengambil data dashboard dari MySQL.
    async function loadDashboard(year) {
        totalProduk.textContent = "...";
        totalPengguna.textContent = "...";
        stokMenipis.textContent = "...";

        chartBars.replaceChildren();

        const loading = document.createElement("p");
        loading.textContent = "Memuat data penjualan...";
        loading.style.gridColumn = "1 / -1";
        loading.style.textAlign = "center";

        chartBars.appendChild(loading);

        try {
            if (
                !window.ARTHA_API ||
                typeof window.ARTHA_API.get !== "function"
            ) {
                throw new Error(
                    "ARTHA API belum berhasil dimuat."
                );
            }

            const response = await window.ARTHA_API.get(
                "admin/dashboard?year=" +
                encodeURIComponent(year)
            );

            const data = response.data;

            if (
                !data ||
                !Array.isArray(data.penjualan_bulanan) ||
                data.penjualan_bulanan.length !== 12
            ) {
                throw new Error(
                    "Format data dashboard dari server tidak sesuai."
                );
            }

            // Memperbarui kartu statistik.
            totalProduk.textContent = formatNumber(
                data.total_produk
            );

            totalPengguna.textContent = formatNumber(
                data.total_pengguna
            );

            stokMenipis.textContent = formatNumber(
                data.stok_menipis
            );

            // Memperbarui grafik penjualan.
            renderChart(
                data.penjualan_bulanan,
                data.tahun
            );

            console.info(
                "[ARTHA] Dashboard Admin berhasil dimuat dari MySQL.",
                data
            );

        } catch (error) {
            console.error(
                "[ARTHA] Gagal memuat Dashboard Admin:",
                error
            );

            totalProduk.textContent = "—";
            totalPengguna.textContent = "—";
            stokMenipis.textContent = "—";

            chartBars.replaceChildren();

            const errorMessage = document.createElement("p");

            errorMessage.textContent =
                "Gagal memuat data penjualan. " +
                error.message;

            errorMessage.style.gridColumn = "1 / -1";
            errorMessage.style.textAlign = "center";
            errorMessage.style.color = "#D93025";

            chartBars.appendChild(errorMessage);

            if (
                window.arthaPopup &&
                typeof window.arthaPopup.error === "function"
            ) {
                await window.arthaPopup.error(
                    error.message,
                    {
                        title: "Gagal Memuat Dashboard"
                    }
                );
            }
        }
    }

    // Memuat ulang dashboard ketika tahun diganti.
    yearSelect.addEventListener("change", function () {
        const selectedYear = Number(yearSelect.value);

        loadDashboard(selectedYear);
    });

    // Memuat dashboard pertama kali.
    await loadDashboard(
        Number(yearSelect.value)
    );

    console.log(
        "[ARTHA] Dashboard Admin siap digunakan."
    );
});