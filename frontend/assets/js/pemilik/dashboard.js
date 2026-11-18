document.addEventListener("DOMContentLoaded", async function () {
    "use strict";

    const yearSelect = document.querySelector(".owner-year-select");
    const chartBars = document.querySelector(".owner-chart-bars");
    const barGroups = document.querySelectorAll(".owner-bar-group");
    const yAxis = document.querySelector(".owner-chart-y-axis");

    const omzetElement = document.getElementById("ownerTotalOmzet");
    const transaksiElement = document.getElementById("ownerTotalTransaksi");
    const rekomendasiElement = document.getElementById("ownerTotalRekomendasi");

    const months = [
        "Januari", "Februari", "Maret", "April",
        "Mei", "Juni", "Juli", "Agustus",
        "September", "Oktober", "November", "Desember"
    ];

    if (
        !yearSelect ||
        !chartBars ||
        barGroups.length !== 12 ||
        !yAxis ||
        !omzetElement ||
        !transaksiElement ||
        !rekomendasiElement
    ) {
        console.error("[ARTHA] Elemen Dashboard Pemilik tidak lengkap.");
        return;
    }

    function formatNumber(value) {
        return Number(value || 0).toLocaleString("id-ID", {
            maximumFractionDigits: 0
        });
    }

    function formatRupiah(value) {
        return "Rp" + formatNumber(value);
    }

    function formatCompactRupiah(value) {
        const amount = Number(value) || 0;

        if (amount >= 1000000000) {
            return "Rp" + (amount / 1000000000).toLocaleString("id-ID", {
                maximumFractionDigits: 1
            }) + " M";
        }

        if (amount >= 1000000) {
            return "Rp" + (amount / 1000000).toLocaleString("id-ID", {
                maximumFractionDigits: 1
            }) + " jt";
        }

        if (amount >= 1000) {
            return "Rp" + (amount / 1000).toLocaleString("id-ID", {
                maximumFractionDigits: 0
            }) + " rb";
        }

        return formatRupiah(amount);
    }

    function getNiceMaximum(values) {
        const highest = Math.max(...values.map(Number), 0);

        if (highest <= 0) return 4;

        const roughStep = highest / 4;
        const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
        const normalized = roughStep / magnitude;

        let step;

        if (normalized <= 1) {
            step = 1;
        } else if (normalized <= 2) {
            step = 2;
        } else if (normalized <= 5) {
            step = 5;
        } else {
            step = 10;
        }

        return step * magnitude * 4;
    }

    function renderChart(values, year) {
        const maximum = getNiceMaximum(values);
        const axisLabels = yAxis.querySelectorAll("span");

        axisLabels.forEach(function (label, index) {
            const value = maximum * (4 - index) / 4;

            label.textContent = index === 4
                ? "0"
                : formatCompactRupiah(value);
        });

        barGroups.forEach(function (group, index) {
            const bar = group.querySelector(".owner-bar");
            const value = Number(values[index]) || 0;

            if (!bar) return;

            const height = maximum > 0
                ? (value / maximum) * 100
                : 0;

            bar.style.height = height + "%";
            bar.dataset.value = String(value);

            bar.title =
                months[index] + " " + year + ": " + formatRupiah(value);

            bar.setAttribute(
                "aria-label",
                months[index] + " " + year + ": " + formatRupiah(value)
            );

            bar.classList.remove("yellow", "blue");
            bar.classList.add(index % 3 === 2 ? "yellow" : "blue");
        });
    }

    async function loadDashboard(year) {
        omzetElement.textContent = "...";
        transaksiElement.textContent = "...";
        rekomendasiElement.textContent = "...";

        try {
            if (
                !window.ARTHA_API ||
                typeof window.ARTHA_API.get !== "function"
            ) {
                throw new Error(
                    "ARTHA API belum tersedia. Periksa urutan pemuatan api.js."
                );
            }

            const response = await window.ARTHA_API.get(
                "pemilik/dashboard?year=" + encodeURIComponent(year)
            );

            const data = response.data;

            if (
                !data ||
                !Array.isArray(data.penjualan_bulanan) ||
                data.penjualan_bulanan.length !== 12
            ) {
                throw new Error(
                    "Format data Dashboard Pemilik tidak sesuai."
                );
            }

            omzetElement.textContent =
                formatCompactRupiah(data.total_omzet);

            transaksiElement.textContent =
                formatNumber(data.jumlah_transaksi);

            rekomendasiElement.textContent =
                formatNumber(data.total_rekomendasi);

            renderChart(data.penjualan_bulanan, data.tahun);

            console.info(
                "[ARTHA] Dashboard Pemilik berhasil dimuat dari MySQL.",
                data
            );

        } catch (error) {
            console.error(
                "[ARTHA] Gagal memuat Dashboard Pemilik:",
                error
            );

            omzetElement.textContent = "—";
            transaksiElement.textContent = "—";
            rekomendasiElement.textContent = "—";

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

    yearSelect.addEventListener("change", function () {
        loadDashboard(Number(yearSelect.value));
    });

    await loadDashboard(Number(yearSelect.value));

    console.log("[ARTHA] Dashboard Pemilik siap digunakan.");
});