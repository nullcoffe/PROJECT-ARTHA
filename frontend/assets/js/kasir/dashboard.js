document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    const cards = document.querySelectorAll(
        ".summary-cards .summary-card strong"
    );

    const historyBody = document.querySelector(
        ".history-table tbody"
    );

    const historyDescription = document.querySelector(
        ".history-section .section-heading p"
    );

    let isLoading = false;

    function formatRupiah(value) {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(Number(value) || 0);
    }

    function showHistoryMessage(message) {
        if (!historyBody) return;

        historyBody.replaceChildren();

        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 4;
        cell.textContent = message;
        cell.style.textAlign = "center";

        row.appendChild(cell);
        historyBody.appendChild(row);
    }

    function renderSummary(data) {
        if (cards.length < 3) {
            throw new Error(
                "Elemen ringkasan dashboard tidak lengkap."
            );
        }

        cards[0].textContent = formatRupiah(
            data.total_penjualan
        );

        cards[1].textContent = Number(
            data.jumlah_transaksi
        ).toLocaleString("id-ID");

        cards[2].textContent = Number(
            data.total_produk
        ).toLocaleString("id-ID");
    }

    function renderHistory(transactions) {
        historyBody.replaceChildren();

        if (!transactions.length) {
            showHistoryMessage(
                "Belum ada transaksi."
            );
            return;
        }

        transactions.forEach(function (item) {
            const row = document.createElement("tr");

            const idCell = document.createElement("td");
            const timeCell = document.createElement("td");
            const totalCell = document.createElement("td");
            const statusCell = document.createElement("td");

            idCell.textContent = item.id || "-";

            timeCell.textContent = item.waktu || "-";
            if (item.tanggal) {
                timeCell.title = item.tanggal;
            }

            totalCell.textContent = formatRupiah(
                item.total
            );

            statusCell.textContent = item.status || "Selesai";

            if (item.status === "Selesai") {
                statusCell.classList.add("status-done");
            }

            row.append(
                idCell,
                timeCell,
                totalCell,
                statusCell
            );

            historyBody.appendChild(row);
        });
    }

    async function loadDashboard() {
        if (isLoading) return;

        isLoading = true;

        showHistoryMessage("Memuat data transaksi...");

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
                "kasir/dashboard"
            );

            const data = response.data;

            if (
                !data ||
                !Array.isArray(data.transaksi_terbaru)
            ) {
                throw new Error(
                    "Format respons dashboard tidak valid."
                );
            }

            renderSummary(data);
            renderHistory(data.transaksi_terbaru);

            if (historyDescription) {
                historyDescription.textContent =
                    `Menampilkan ${data.transaksi_terbaru.length} riwayat teratas`;
            }

            console.info(
                "[ARTHA] Dashboard berhasil dimuat:",
                data
            );

        } catch (error) {
            console.error(
                "[ARTHA] Gagal memuat dashboard:",
                error
            );

            showHistoryMessage(
                "Gagal memuat riwayat transaksi."
            );

            if (historyDescription) {
                historyDescription.textContent =
                    "Data dashboard tidak tersedia";
            }

            if (window.arthaPopup?.error) {
                await window.arthaPopup.error(
                    error.message,
                    {
                        title: "Gagal Memuat Dashboard"
                    }
                );
            } else {
                window.alert(error.message);
            }

        } finally {
            isLoading = false;
        }
    }

    loadDashboard();
});