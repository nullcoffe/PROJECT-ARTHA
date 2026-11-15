
document.addEventListener("DOMContentLoaded", async function () {

    // Mengambil elemen struk
    const transactionId = document.getElementById("receipt-transaction-id");
    const receiptDate = document.getElementById("receipt-date");
    const receiptItems = document.getElementById("receipt-items");
    const receiptTotal = document.getElementById("receipt-total");
    const receiptMethod = document.getElementById("receipt-method");
    const receiptReceived = document.getElementById("receipt-received");
    const receiptChange = document.getElementById("receipt-change");

    const receiptPaper = document.querySelector(".receipt-paper");

    const printButton = document.getElementById("btn-print");
    const pdfButton = document.getElementById("btn-save-pdf");

    // Membersihkan data struk
    function clearReceiptData() {
        sessionStorage.removeItem("artha_payment_data");
    }

    // Reset data ketika memulai transaksi baru
    const newTransactionButton = Array.from(
        document.querySelectorAll(".receipt-actions a")
    ).find(function (link) {
        return new URL(link.href).pathname.endsWith("/transaksiPOS.php");
    });

    if (newTransactionButton) {
        newTransactionButton.addEventListener("click", function () {
            clearReceiptData();
            sessionStorage.removeItem("artha_pos_cart");
        });
    }

    // Membersihkan struk saat meninggalkan halaman
    window.addEventListener("pagehide", function () {
        clearReceiptData();
    });

    // Mencegah struk lama muncul dari cache browser
    window.addEventListener("pageshow", function (event) {
        if (
            event.persisted &&
            !sessionStorage.getItem("artha_payment_data")
        ) {
            window.location.reload();
        }
    });

    // Validasi elemen HTML
    if (
        !transactionId ||
        !receiptDate ||
        !receiptItems ||
        !receiptTotal ||
        !receiptMethod ||
        !receiptReceived ||
        !receiptChange ||
        !receiptPaper
    ) {
        console.error("Elemen struk tidak ditemukan.");
        return;
    }

    // Format mata uang Rupiah
    function formatRupiah(amount) {
        return "Rp " + Number(amount).toLocaleString("id-ID");
    }

    // Membaca data pembayaran
    let paymentData;

    try {
        const savedData = sessionStorage.getItem("artha_payment_data");

        if (!savedData) {
            throw new Error("Data pembayaran tidak ditemukan.");
        }

        paymentData = JSON.parse(savedData);

        if (
            !paymentData ||
            !Array.isArray(paymentData.items) ||
            paymentData.items.length === 0
        ) {
            throw new Error("Data transaksi tidak valid.");
        }

    } catch (error) {
        console.error("Gagal membaca data struk:", error);

        receiptItems.textContent = "Data transaksi tidak ditemukan.";

        if (printButton) printButton.disabled = true;
        if (pdfButton) pdfButton.disabled = true;

        return;
    }

    // Validasi data transaksi
    let calculatedTotal = 0;

    for (const item of paymentData.items) {
        const price = Number(item.price);
        const quantity = Number(item.quantity);

        if (
            !item.id ||
            !item.name ||
            !Number.isFinite(price) ||
            price < 0 ||
            !Number.isInteger(quantity) ||
            quantity <= 0
        ) {
            console.error("Produk tidak valid:", item);

            receiptItems.textContent =
                "Terdapat data produk yang tidak valid.";

            if (printButton) printButton.disabled = true;
            if (pdfButton) pdfButton.disabled = true;

            return;
        }

        calculatedTotal += price * quantity;
    }

    const total = Number(paymentData.total);
    const received = Number(paymentData.receivedAmount);
    const change = Number(paymentData.change);

    if (
        !Number.isFinite(total) ||
        !Number.isFinite(received) ||
        !Number.isFinite(change) ||
        total !== calculatedTotal ||
        received < total ||
        change !== received - total ||
        !paymentData.completedAt ||
        !Number.isFinite(Date.parse(paymentData.completedAt))
    ) {
        console.error("Validasi pembayaran gagal:", paymentData);

        receiptItems.textContent =
            "Data pembayaran tidak konsisten. Silakan periksa transaksi.";

        if (printButton) printButton.disabled = true;
        if (pdfButton) pdfButton.disabled = true;

        return;
    }

    // Menampilkan identitas transaksi
    const completedDate = new Date(paymentData.completedAt);

    const generatedId = "TRX-" + completedDate.getTime();

    transactionId.textContent =
        paymentData.transactionId || generatedId;

    receiptDate.textContent = completedDate.toLocaleString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });

    // Menampilkan daftar produk
    receiptItems.replaceChildren();

    paymentData.items.forEach(function (item) {
        const row = document.createElement("div");
        row.className = "receipt-line";

        const productName = document.createElement("span");
        productName.textContent = item.name + " x" + item.quantity;

        const subtotal = document.createElement("span");
        subtotal.textContent = formatRupiah(
            Number(item.price) * Number(item.quantity)
        );

        row.appendChild(productName);
        row.appendChild(subtotal);

        receiptItems.appendChild(row);
    });

    // Menampilkan ringkasan pembayaran
    receiptTotal.textContent = formatRupiah(total);
    receiptMethod.textContent = paymentData.paymentMethod || "-";
    receiptReceived.textContent = formatRupiah(received);
    receiptChange.textContent = formatRupiah(change);

    // Fungsi cetak struk
    if (printButton) {
        printButton.addEventListener("click", function () {
            window.print();
        });
    }

    // Download PDF dinamis
    if (pdfButton) {
        pdfButton.addEventListener("click", async function (event) {

            event.preventDefault();

            // Memastikan library PDF tersedia
            if (typeof html2pdf === "undefined") {
                console.error("Library html2pdf tidak tersedia.");

                if (window.arthaPopup) {
                    window.arthaPopup.error(
                        "Library PDF belum berhasil dimuat."
                    );
                }

                return;
            }

            let measureContainer = null;

            const originalButtonHTML = pdfButton.innerHTML;

            try {
                // Mengubah status tombol
                pdfButton.disabled = true;
                pdfButton.textContent = "Menyiapkan PDF...";

                const paperWidthMM = 80;
                const paddingMM = 8;
                const pxToMM = 25.4 / 96;

                // Menunggu font selesai dimuat
                if (document.fonts && document.fonts.ready) {
                    await document.fonts.ready;
                }

                // Membuat salinan struk untuk PDF
                const pdfReceipt = receiptPaper.cloneNode(true);

                pdfReceipt.classList.add("receipt-pdf-export");

                // Mengatur ukuran dan tampilan salinan
                const pdfStyles = {
                    width: paperWidthMM + "mm",
                    "min-width": "0",
                    "max-width": "none",
                    height: "auto",
                    "min-height": "0",
                    "max-height": "none",
                    padding: paddingMM + "mm",
                    margin: "0",
                    "box-sizing": "border-box",
                    position: "static",
                    overflow: "visible",
                    border: "none",
                    "border-radius": "0",
                    "box-shadow": "none",
                    background: "#FFFFFF"
                };

                Object.entries(pdfStyles).forEach(function ([property, value]) {
                    pdfReceipt.style.setProperty(
                        property,
                        value,
                        "important"
                    );
                });

                // Mengatur baris produk
                const pdfRows = pdfReceipt.querySelectorAll(".receipt-line");

                pdfRows.forEach(function (row) {
                    row.style.display = "flex";
                    row.style.alignItems = "flex-start";
                    row.style.justifyContent = "space-between";
                    row.style.gap = "10px";
                    row.style.width = "100%";
                    row.style.boxSizing = "border-box";

                    const spans = row.querySelectorAll("span");

                    if (spans.length >= 2) {
                        spans[0].style.flex = "1";
                        spans[0].style.minWidth = "0";
                        spans[0].style.overflowWrap = "anywhere";

                        spans[1].style.flexShrink = "0";
                        spans[1].style.textAlign = "right";
                        spans[1].style.whiteSpace = "nowrap";
                    }
                });

                // Membuat wadah pengukuran PDF
                measureContainer = document.createElement("div");

                measureContainer.style.position = "fixed";
                measureContainer.style.left = "-10000px";
                measureContainer.style.top = "0";
                measureContainer.style.width = paperWidthMM + "mm";
                measureContainer.style.height = "auto";
                measureContainer.style.margin = "0";
                measureContainer.style.padding = "0";
                measureContainer.style.background = "#FFFFFF";
                measureContainer.style.overflow = "visible";
                measureContainer.style.zIndex = "-1";

                measureContainer.appendChild(pdfReceipt);
                document.body.appendChild(measureContainer);

                // Menunggu layout selesai
                await new Promise(function (resolve) {
                    requestAnimationFrame(resolve);
                });

                // Menghitung tinggi struk
                const receiptHeightPX = Math.max(
                    pdfReceipt.scrollHeight,
                    pdfReceipt.getBoundingClientRect().height
                );

                const contentHeightMM = receiptHeightPX * pxToMM;

                const paperHeightMM =
                    Math.ceil(contentHeightMM * 10) / 10 + 2;

                // Membatasi ukuran PDF
                if (paperHeightMM > 5000) {
                    throw new Error(
                        "Struk terlalu panjang untuk satu halaman PDF."
                    );
                }

                // Konfigurasi PDF
                const options = {
                    margin: 0,

                    filename:
                        "Struk-" +
                        (paymentData.transactionId || generatedId) +
                        ".pdf",

                    image: {
                        type: "jpeg",
                        quality: 0.98
                    },

                    html2canvas: {
                        scale: 2,
                        useCORS: true,
                        backgroundColor: "#FFFFFF",
                        scrollX: 0,
                        scrollY: 0
                    },

                    jsPDF: {
                        unit: "mm",
                        format: [
                            paperWidthMM,
                            paperHeightMM
                        ],
                        orientation: "portrait"
                    },

                    pagebreak: {
                        mode: []
                    }
                };

                // Membuat dan mengunduh PDF
                await html2pdf()
                    .set(options)
                    .from(pdfReceipt)
                    .save();

                console.log("PDF struk berhasil diunduh.");

                console.log(
                    "Ukuran PDF:",
                    paperWidthMM + "mm x " +
                    paperHeightMM.toFixed(1) + "mm"
                );

            } catch (error) {
                console.error("Gagal membuat PDF:", error);

                if (window.arthaPopup) {
                    window.arthaPopup.error(
                        "PDF gagal dibuat. Silakan coba kembali."
                    );
                }

            } finally {

                // Menghapus salinan struk sementara
                if (measureContainer) {
                    measureContainer.remove();
                }

                // Mengembalikan tombol PDF
                pdfButton.disabled = false;
                pdfButton.innerHTML = originalButtonHTML;
            }
        });
    }

    // Informasi status
    console.log("Cetak Struk ARTHA berhasil dimuat.");

    console.log(
        "Nomor transaksi:",
        transactionId.textContent
    );

    console.log(
        "Jumlah produk:",
        paymentData.items.length
    );

    console.log(
        "Total transaksi:",
        formatRupiah(total)
    );

});