
document.addEventListener("DOMContentLoaded", function () {

    // 1. Mengambil elemen HTML
    const yearSelect = document.querySelector(".owner-year-select");
    const chartBars = document.querySelector(".owner-chart-bars");
    const barGroups = document.querySelectorAll(".owner-bar-group");

    // 2. Memeriksa elemen utama
    if (!yearSelect || !chartBars || barGroups.length !== 12) {
        console.error("Elemen Dashboard Pemilik tidak ditemukan atau struktur grafik tidak sesuai.");
        return;
    }

    // 3. Memeriksa Custom Popup ARTHA
    if (!window.arthaPopup || typeof window.arthaPopup.info !== "function") {
        console.error("Custom Popup ARTHA belum dimuat. Periksa urutan script popup.js.");
        return;
    }

    // 4. Data penjualan simulasi tahun 2024 dan 2025
    const salesData = {
        "2024": {
            values: [28, 42, 36, 50, 45, 60, 48, 65, 55, 72, 68, 80]
        },
        "2025": {
            values: [35, 55, 43, 63, 56, 76, 54, 74, 62, 88, 80, 94]
        }
    };

    // 5. Nama bulan
    const months = [
        "Januari", "Februari", "Maret", "April",
        "Mei", "Juni", "Juli", "Agustus",
        "September", "Oktober", "November", "Desember"
    ];

    // 6. Format Rupiah
    function formatRupiah(value) {
        return "Rp" + new Intl.NumberFormat("id-ID", {
            maximumFractionDigits: 0
        }).format(value);
    }

    // 7. Menampilkan grafik sesuai tahun
    function renderChart(year) {
        const selectedData = salesData[year];

        if (!selectedData) return;

        barGroups.forEach(function (group, index) {
            const bar = group.querySelector(".owner-bar");
            const value = selectedData.values[index];

            if (!bar) return;

            bar.style.height = value + "%";
            bar.dataset.value = value;
            bar.title = `${months[index]} ${year}: ${formatRupiah(value * 120000)}`;

            bar.setAttribute(
                "aria-label",
                `${months[index]} ${year}, omzet simulasi ${formatRupiah(value * 120000)}`
            );

            bar.classList.remove("yellow", "blue");
            bar.classList.add(value >= 75 ? "yellow" : "blue");
        });
    }

    // 8. Status popup
    let unavailablePopupShown = false;

    // 9. Menampilkan Custom Popup ketika tahun 2026 dipilih
    async function showUnavailablePopup() {

        if (unavailablePopupShown) return;

        unavailablePopupShown = true;

        try {
            await window.arthaPopup.info(
                "Data penjualan untuk tahun 2026 belum tersedia. Silakan pilih tahun 2024 atau 2025 untuk melihat laporan penjualan.",
                {
                    title: "Data Tahun 2026 Belum Tersedia",
                    confirmText: "Mengerti"
                }
            );

        } catch (error) {
            console.error("Gagal menampilkan popup:", error);

        } finally {
            unavailablePopupShown = false;
            yearSelect.value = "2025";
            renderChart("2025");
        }
    }

    // 10. Menangani perubahan tahun
    yearSelect.addEventListener("change", function () {

        const selectedYear = yearSelect.value;

        if (selectedYear === "2026") {
            showUnavailablePopup();
            return;
        }

        if (salesData[selectedYear]) {
            renderChart(selectedYear);
        }
    });

    // 11. Menangani jika halaman pertama kali dibuka pada tahun 2026
    if (yearSelect.value === "2026") {
        showUnavailablePopup();
    } else {
        renderChart(yearSelect.value);
    }

    console.log("Dashboard Pemilik berhasil dijalankan.");

});
