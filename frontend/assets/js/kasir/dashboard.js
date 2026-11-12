document.addEventListener("DOMContentLoaded", function () {

    // DASHBOARD KASIR - DATA SIMULASI TAHAP 4
    const dashboardData = {
        totalPenjualan: 573000,
        jumlahTransaksi: 5,
        produkTersedia: 60,

        transaksiTerbaru: [
            {
                id: "TRX-0350",
                waktu: "10:42",
                total: 112000,
                status: "Selesai"
            },
            {
                id: "TRX-0349",
                waktu: "10:35",
                total: 56000,
                status: "Selesai"
            },
            {
                id: "TRX-0348",
                waktu: "10:18",
                total: 78000,
                status: "Selesai"
            },
            {
                id: "TRX-0347",
                waktu: "10:00",
                total: 92000,
                status: "Selesai"
            },
            {
                id: "TRX-0346",
                waktu: "09:45",
                total: 145000,
                status: "Selesai"
            }
        ]
    };

    // Format mata uang Indonesia
    function formatRupiah(angka) {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(angka);
    }

    // MENAMPILKAN RINGKASAN DASHBOARD
    function tampilkanRingkasan() {
        const cards = document.querySelectorAll(
            ".summary-cards .summary-card strong"
        );

        if (cards.length < 3) {
            console.warn("Elemen ringkasan dashboard tidak lengkap.");
            return;
        }

        cards[0].textContent = formatRupiah(
            dashboardData.totalPenjualan
        );

        cards[1].textContent =
            dashboardData.jumlahTransaksi;

        cards[2].textContent =
            dashboardData.produkTersedia;
    }

    // MENAMPILKAN 5 TRANSAKSI TERBARU
    function tampilkanRiwayat() {
        const tbody = document.querySelector(
            ".history-table tbody"
        );

        if (!tbody) {
            console.warn("Tabel riwayat tidak ditemukan.");
            return;
        }

        // Menghapus baris statis HTML
        tbody.replaceChildren();

        const transaksi = dashboardData.transaksiTerbaru.slice(0, 5);

        if (transaksi.length === 0) {
            const row = tbody.insertRow();
            const cell = row.insertCell();

            cell.colSpan = 4;
            cell.textContent = "Belum ada transaksi.";
            return;
        }

        transaksi.forEach(function (item) {
            const row = tbody.insertRow();

            const idCell = row.insertCell();
            const waktuCell = row.insertCell();
            const totalCell = row.insertCell();
            const statusCell = row.insertCell();

            idCell.textContent = item.id;
            waktuCell.textContent = item.waktu;
            totalCell.textContent = formatRupiah(item.total);
            statusCell.textContent = item.status;

            if (item.status === "Selesai") {
                statusCell.classList.add("status-done");
            }
        });
    }

    // INISIALISASI DASHBOARD
    tampilkanRingkasan();
    tampilkanRiwayat();

});