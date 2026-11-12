document.addEventListener("DOMContentLoaded", async function () {

    // =========================================
    // 1. MENGAMBIL ELEMEN HTML
    // =========================================

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


    // Membersihkan data struk saat meninggalkan halaman
    function clearReceiptData() {
        sessionStorage.removeItem("artha_payment_data");
    }

    // Reset data ketika memulai transaksi baru
    const newTransactionButton = Array.from(
        document.querySelectorAll(".receipt-actions a")
    ).find(function (link) {
        return new URL(link.href).pathname.endsWith("/transaksiPOS.html");
    });

    if (newTransactionButton) {
        newTransactionButton.addEventListener("click", function () {
            clearReceiptData();

            // Transaksi baru dimulai dengan keranjang kosong
            sessionStorage.removeItem("artha_pos_cart");
        });
    }

    // Membersihkan struk saat berpindah ke halaman lain
    window.addEventListener("pagehide", function () {
        clearReceiptData();
    });

    // Mencegah struk lama muncul kembali dari cache browser
    window.addEventListener("pageshow", function (event) {
        if (
            event.persisted &&
            !sessionStorage.getItem("artha_payment_data")
        ) {
            window.location.reload();
        }
    });

    // =========================================
    // 2. VALIDASI ELEMEN HTML
    // =========================================

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


    // =========================================
    // 3. FORMAT RUPIAH
    // =========================================

    function formatRupiah(amount) {

        return "Rp " + Number(amount).toLocaleString("id-ID");

    }


    // =========================================
    // 4. MEMBACA DATA PEMBAYARAN
    // =========================================

    let paymentData;

    try {

        const savedData = sessionStorage.getItem(
            "artha_payment_data"
        );

        if (!savedData) {

            throw new Error(
                "Data pembayaran tidak ditemukan."
            );

        }

        paymentData = JSON.parse(savedData);

        if (
            !paymentData ||
            !Array.isArray(paymentData.items) ||
            paymentData.items.length === 0
        ) {

            throw new Error(
                "Data transaksi tidak valid."
            );

        }

    } catch (error) {

        console.error(
            "Gagal membaca data struk:",
            error
        );

        receiptItems.textContent =
            "Data transaksi tidak ditemukan.";

        if (printButton) {
            printButton.disabled = true;
        }

        if (pdfButton) {
            pdfButton.disabled = true;
        }

        return;

    }


    // =========================================
    // 5. VALIDASI DATA TRANSAKSI
    // =========================================

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

            console.error(
                "Produk tidak valid:",
                item
            );

            receiptItems.textContent =
                "Terdapat data produk yang tidak valid.";

            if (printButton) {
                printButton.disabled = true;
            }

            if (pdfButton) {
                pdfButton.disabled = true;
            }

            return;

        }

        calculatedTotal += price * quantity;

    }

    const total = Number(paymentData.total);

    const received = Number(
        paymentData.receivedAmount
    );

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

        console.error(
            "Validasi pembayaran gagal:",
            paymentData
        );

        receiptItems.textContent =
            "Data pembayaran tidak konsisten. Silakan periksa transaksi.";

        if (printButton) {
            printButton.disabled = true;
        }

        if (pdfButton) {
            pdfButton.disabled = true;
        }

        return;

    }


    // =========================================
    // 6. IDENTITAS TRANSAKSI
    // =========================================

    const completedDate = new Date(
        paymentData.completedAt
    );

    const generatedId =
        "TRX-" + completedDate.getTime();

    transactionId.textContent =
        paymentData.transactionId || generatedId;

    receiptDate.textContent =
        completedDate.toLocaleString("id-ID", {

            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"

        });


    // =========================================
    // 7. MENAMPILKAN DAFTAR PRODUK
    // =========================================

    receiptItems.replaceChildren();

    paymentData.items.forEach(function (item) {

        const row = document.createElement("div");

        row.className = "receipt-line";


        // NAMA PRODUK DAN JUMLAH

        const productName = document.createElement("span");

        productName.textContent =
            item.name + " x" + item.quantity;


        // SUBTOTAL PRODUK

        const subtotal = document.createElement("span");

        subtotal.textContent = formatRupiah(
            Number(item.price) * Number(item.quantity)
        );


        // MEMASUKKAN DATA KE BARIS

        row.appendChild(productName);
        row.appendChild(subtotal);

        receiptItems.appendChild(row);

    });


    // =========================================
    // 8. RINGKASAN PEMBAYARAN
    // =========================================

    receiptTotal.textContent =
        formatRupiah(total);

    receiptMethod.textContent =
        paymentData.paymentMethod || "-";

    receiptReceived.textContent =
        formatRupiah(received);

    receiptChange.textContent =
        formatRupiah(change);


    // =========================================
    // 9. FUNGSI CETAK STRUK
    // =========================================

    if (printButton) {

        printButton.addEventListener("click", function () {

            window.print();

        });

    }


    // =========================================
    // 10. DOWNLOAD PDF DINAMIS
    // =========================================

    if (pdfButton) {

        pdfButton.addEventListener(
            "click",
            async function (event) {

                event.preventDefault();

                // VALIDASI LIBRARY PDF

                if (typeof html2pdf === "undefined") {

                    console.error(
                        "Library html2pdf tidak tersedia."
                    );

                    if (window.arthaPopup) {

                        window.arthaPopup.error(
                            "Library PDF belum berhasil dimuat."
                        );

                    }

                    return;

                }


                let measureContainer = null;

                const originalButtonHTML =
                    pdfButton.innerHTML;

                try {

                    // =================================
                    // STATUS DOWNLOAD
                    // =================================

                    pdfButton.disabled = true;

                    pdfButton.textContent =
                        "Menyiapkan PDF...";


                    // =================================
                    // KONFIGURASI KERTAS
                    // =================================

                    const paperWidthMM = 80;

                    const paddingMM = 8;

                    // 1 CSS px = 25.4 / 96 mm
                    const pxToMM = 25.4 / 96;


                    // =================================
                    // MENUNGGU FONT
                    // =================================

                    if (
                        document.fonts &&
                        document.fonts.ready
                    ) {

                        await document.fonts.ready;

                    }


                    // =================================
                    // SALIN STRUK UNTUK PDF
                    // =================================

                    // Salinan dibuat agar tampilan
                    // struk pada halaman tidak berubah.

                    const pdfReceipt =
                        receiptPaper.cloneNode(true);

                    pdfReceipt.classList.add(
                        "receipt-pdf-export"
                    );


                    // =================================
                    // ATUR UKURAN SALINAN
                    // =================================

                    pdfReceipt.style.setProperty(
                        "width",
                        paperWidthMM + "mm",
                        "important"
                    );

                    pdfReceipt.style.setProperty(
                        "min-width",
                        "0",
                        "important"
                    );

                    pdfReceipt.style.setProperty(
                        "max-width",
                        "none",
                        "important"
                    );

                    pdfReceipt.style.setProperty(
                        "height",
                        "auto",
                        "important"
                    );

                    pdfReceipt.style.setProperty(
                        "min-height",
                        "0",
                        "important"
                    );

                    pdfReceipt.style.setProperty(
                        "max-height",
                        "none",
                        "important"
                    );

                    pdfReceipt.style.setProperty(
                        "padding",
                        paddingMM + "mm",
                        "important"
                    );

                    pdfReceipt.style.setProperty(
                        "margin",
                        "0",
                        "important"
                    );

                    pdfReceipt.style.setProperty(
                        "box-sizing",
                        "border-box",
                        "important"
                    );

                    pdfReceipt.style.setProperty(
                        "position",
                        "static",
                        "important"
                    );

                    pdfReceipt.style.setProperty(
                        "overflow",
                        "visible",
                        "important"
                    );

                    pdfReceipt.style.setProperty(
                        "border",
                        "none",
                        "important"
                    );

                    pdfReceipt.style.setProperty(
                        "border-radius",
                        "0",
                        "important"
                    );

                    pdfReceipt.style.setProperty(
                        "box-shadow",
                        "none",
                        "important"
                    );

                    pdfReceipt.style.setProperty(
                        "background",
                        "#FFFFFF",
                        "important"
                    );


                    // =================================
                    // ATUR BARIS PRODUK
                    // =================================

                    const pdfRows =
                        pdfReceipt.querySelectorAll(
                            ".receipt-line"
                        );

                    pdfRows.forEach(function (row) {

                        row.style.display = "flex";

                        row.style.alignItems =
                            "flex-start";

                        row.style.justifyContent =
                            "space-between";

                        row.style.gap = "10px";

                        row.style.width = "100%";

                        row.style.boxSizing =
                            "border-box";


                        const spans =
                            row.querySelectorAll("span");

                        if (spans.length >= 2) {

                            spans[0].style.flex = "1";

                            spans[0].style.minWidth = "0";

                            spans[0].style.overflowWrap =
                                "anywhere";

                            spans[1].style.flexShrink = "0";

                            spans[1].style.textAlign =
                                "right";

                            spans[1].style.whiteSpace =
                                "nowrap";

                        }

                    });


                    // =================================
                    // WADAH PENGUKURAN
                    // =================================

                    measureContainer =
                        document.createElement("div");

                    measureContainer.style.position =
                        "fixed";

                    measureContainer.style.left =
                        "-10000px";

                    measureContainer.style.top = "0";

                    measureContainer.style.width =
                        paperWidthMM + "mm";

                    measureContainer.style.height =
                        "auto";

                    measureContainer.style.margin = "0";

                    measureContainer.style.padding = "0";

                    measureContainer.style.background =
                        "#FFFFFF";

                    measureContainer.style.overflow =
                        "visible";

                    measureContainer.style.zIndex =
                        "-1";

                    measureContainer.appendChild(
                        pdfReceipt
                    );

                    document.body.appendChild(
                        measureContainer
                    );


                    // =================================
                    // TUNGGU LAYOUT SELESAI
                    // =================================

                    await new Promise(function (resolve) {

                        requestAnimationFrame(resolve);

                    });


                    // =================================
                    // HITUNG TINGGI STRUK
                    // =================================

                    const receiptHeightPX = Math.max(
                        pdfReceipt.scrollHeight,
                        pdfReceipt.getBoundingClientRect().height
                    );

                    const contentHeightMM =
                        receiptHeightPX * pxToMM;


                    // Tambahan toleransi 2 mm untuk
                    // mencegah bagian bawah terpotong
                    // karena pembulatan ukuran canvas.

                    const paperHeightMM =
                        Math.ceil(contentHeightMM * 10) / 10 + 2;


                    // =================================
                    // BATAS DIMENSI PDF
                    // =================================

                    if (paperHeightMM > 5000) {

                        throw new Error(
                            "Struk terlalu panjang untuk satu halaman PDF."
                        );

                    }


                    // =================================
                    // KONFIGURASI HTML2PDF
                    // =================================

                    const options = {

                        // Padding sudah ada pada
                        // elemen PDF sebesar 8mm.

                        margin: 0,

                        filename:
                            "Struk-" +
                            (
                                paymentData.transactionId ||
                                generatedId
                            ) +
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


                    // =================================
                    // GENERATE PDF
                    // =================================

                    await html2pdf()

                        .set(options)

                        .from(pdfReceipt)

                        .save();


                    console.log(
                        "PDF struk berhasil diunduh."
                    );

                    console.log(
                        "Ukuran PDF:",
                        paperWidthMM + "mm x " +
                        paperHeightMM.toFixed(1) + "mm"
                    );

                } catch (error) {

                    console.error(
                        "Gagal membuat PDF:",
                        error
                    );

                    if (window.arthaPopup) {

                        window.arthaPopup.error(
                            "PDF gagal dibuat. Silakan coba kembali."
                        );

                    }

                } finally {

                    // =================================
                    // HAPUS SALINAN STRUK SEMENTARA
                    // =================================

                    if (measureContainer) {

                        measureContainer.remove();

                    }


                    // =================================
                    // PULIHKAN TOMBOL
                    // =================================

                    pdfButton.disabled = false;

                    pdfButton.innerHTML =
                        originalButtonHTML;

                }

            }
        );

    }


    // =========================================
    // 11. LOG STATUS
    // =========================================

    console.log(
        "Cetak Struk ARTHA berhasil dimuat."
    );

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