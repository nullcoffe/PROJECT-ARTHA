
document.addEventListener("DOMContentLoaded", async function () {

    // 1. Mengambil elemen HTML
    const yearSelect = document.getElementById("adminYearSelect");
    const chart = document.getElementById("adminSalesChart");
    const chartBars = document.getElementById("adminChartBars");

    if (!yearSelect || !chart || !chartBars) {
        console.error("Elemen dashboard Admin tidak ditemukan.");
        return;
    }

    // 2. Menyiapkan data simulasi penjualan tahun 2024 dan 2025
    const salesData = {
        2024: [35, 42, 50, 38, 55, 62, 48, 70, 58, 76, 65, 85],
        2025: [28.33, 45.83, 33.33, 53.33, 47.5, 66.67, 45, 64.17, 52.5, 78.33, 68.33, 81.67]
    };

    // 3. Menentukan nama bulan
    const months = [
        "Jan", "Feb", "Mar", "Apr",
        "Mei", "Jun", "Jul", "Agu",
        "Sep", "Okt", "Nov", "Des"
    ];

    // 4. Menyimpan tahun terakhir yang memiliki data
    let lastValidYear = ["2024", "2025"].includes(yearSelect.value)
        ? yearSelect.value
        : "2025";

    let popupActive = false;

    // 5. Membuat batang grafik
    function createBar(height, index) {
        const group = document.createElement("div");
        group.className = "admin-bar-group";

        const barArea = document.createElement("div");
        barArea.className = "admin-bar-area";

        const bar = document.createElement("div");
        const color = index % 3 === 2 ? "yellow" : "blue";

        bar.className = `admin-bar ${color}`;
        bar.style.setProperty("--bar-height", `${height}%`);

        bar.setAttribute(
            "aria-label",
            `Penjualan ${months[index]}: ${height}% dari skala grafik`
        );

        const monthLabel = document.createElement("span");
        monthLabel.textContent = months[index];

        barArea.appendChild(bar);
        group.appendChild(barArea);
        group.appendChild(monthLabel);

        return group;
    }

    // 6. Menampilkan grafik berdasarkan tahun
    function renderChart(year) {
        const data = salesData[year];

        if (!data || data.length !== 12) {
            console.error("Data grafik tahun " + year + " tidak tersedia.");
            return;
        }

        chartBars.replaceChildren();

        data.forEach(function (value, index) {
            chartBars.appendChild(createBar(value, index));
        });

        chart.setAttribute(
            "aria-label",
            `Grafik simulasi penjualan bulanan tahun ${year}`
        );

        console.log(`Grafik simulasi tahun ${year} berhasil ditampilkan.`);
    }

    // 7. Menampilkan Custom Popup ARTHA untuk tahun yang belum tersedia
    async function showYearPopup(year) {

        if (popupActive) return;

        if (
            !window.arthaPopup ||
            typeof window.arthaPopup.info !== "function"
        ) {
            console.error("Custom Popup ARTHA belum dimuat.");
            yearSelect.value = lastValidYear;
            return;
        }

        popupActive = true;

        try {
            await window.arthaPopup.info(
                `Data penjualan untuk tahun ${year} belum tersedia. Silakan pilih tahun 2024 atau 2025 untuk melihat laporan penjualan.`,
                {
                    title: `Data Tahun ${year} Belum Tersedia`,
                    confirmText: "Mengerti"
                }
            );
        } catch (error) {
            console.error("Gagal menampilkan popup:", error);
        } finally {
            yearSelect.value = lastValidYear;
            popupActive = false;
        }
    }

    // 8. Menangani perubahan pilihan tahun
    yearSelect.addEventListener("change", async function () {

        const selectedYear = yearSelect.value;

        if (Object.hasOwn(salesData, selectedYear)) {
            lastValidYear = selectedYear;
            renderChart(selectedYear);
        } else {
            await showYearPopup(selectedYear);
        }

    });

    // 9. Menginisialisasi dashboard berdasarkan tahun awal
    const initialYear = yearSelect.value;

    if (Object.hasOwn(salesData, initialYear)) {
        lastValidYear = initialYear;
        renderChart(initialYear);
    } else {
        yearSelect.value = lastValidYear;
        renderChart(lastValidYear);
        await showYearPopup(initialYear);
    }

    console.log("Dashboard Admin berhasil dijalankan.");

});
