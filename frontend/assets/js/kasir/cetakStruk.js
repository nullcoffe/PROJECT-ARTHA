document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    // Mengambil elemen struk.
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

    let paymentData = null;

    // Menampilkan popup ARTHA.
    async function showPopup(type, message, options = {}) {
        if (
            window.arthaPopup &&
            typeof window.arthaPopup[type] === "function"
        ) {
            return window.arthaPopup[type](message, options);
        }

        window.alert(message);
    }

    // Memastikan elemen HTML tersedia.
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
        console.error("[ARTHA] Elemen struk tidak lengkap.");
        return;
    }

    // Format nominal Rupiah.
    function formatRupiah(amount) {
        return "Rp " + Number(amount || 0).toLocaleString("id-ID");
    }

    // Menampilkan pesan kegagalan pada area struk.
    function showReceiptError(message) {
        receiptItems.replaceChildren();

        const errorMessage = document.createElement("p");
        errorMessage.textContent = message;
        errorMessage.style.textAlign = "center";

        receiptItems.appendChild(errorMessage);

        if (printButton) printButton.disabled = true;
        if (pdfButton) pdfButton.disabled = true;
    }

    // Mengubah data database menjadi format tampilan struk.
    function normalizeReceipt(data) {
        if (
            !data ||
            !data.nomor_transaksi ||
            !Array.isArray(data.items) ||
            data.items.length === 0
        ) {
            throw new Error(
                "Data struk tidak lengkap atau tidak memiliki detail produk."
            );
        }

        const items = data.items.map(function (item) {
            const price = Number(item.harga_satuan);
            const quantity = Number(item.jumlah);
            const subtotal = Number(item.subtotal);

            if (
                !item.nama_produk ||
                !Number.isFinite(price) ||
                price < 0 ||
                !Number.isFinite(quantity) ||
                quantity <= 0 ||
                !Number.isFinite(subtotal) ||
                subtotal < 0
            ) {
                throw new Error(
                    "Terdapat detail produk yang tidak valid pada transaksi."
                );
            }

            if (Math.abs(subtotal - price * quantity) > 0.01) {
                throw new Error(
                    "Subtotal produk tidak sesuai dengan data transaksi."
                );
            }

            return {
                id_produk: Number(item.id_produk),
                code: item.kode_produk || "-",
                name: item.nama_produk,
                unit: item.satuan || "",
                price: price,
                quantity: quantity,
                subtotal: subtotal
            };
        });

        const total = Number(data.total_bayar);
        const received = Number(data.uang_diterima);
        const change = Number(data.uang_kembalian);

        const calculatedTotal = items.reduce(
            function (sum, item) {
                return sum + item.subtotal;
            },
            0
        );

        if (
            !Number.isFinite(total) ||
            !Number.isFinite(received) ||
            !Number.isFinite(change) ||
            Math.abs(total - calculatedTotal) > 0.01 ||
            received < total ||
            Math.abs(change - (received - total)) > 0.01
        ) {
            throw new Error(
                "Data pembayaran pada database tidak konsisten."
            );
        }

        return {
            transactionId: data.nomor_transaksi,
            completedAt: data.tanggal_transaksi,
            items: items,
            total: total,
            paymentMethod: data.metode_pembayaran || "Tunai",
            receivedAmount: received,
            change: change
        };
    }

    // Mengambil struk langsung dari database melalui API.
    async function loadReceipt() {
        try {
            if (
                !window.ARTHA_API ||
                typeof window.ARTHA_API.get !== "function"
            ) {
                throw new Error(
                    "ARTHA API belum tersedia. Pastikan api.js sudah dimuat."
                );
            }

            const params = new URLSearchParams(
                window.location.search
            );

            // Jika nomor tidak diberikan, tampilkan transaksi terakhir milik Kasir.
            const number = params.get("nomor_transaksi") || "latest";

            const response = await window.ARTHA_API.get(
                "kasir/transactions/" + encodeURIComponent(number)
            );

            paymentData = normalizeReceipt(response.data);

            renderReceipt();

            console.info(
                "[ARTHA] Struk berhasil dimuat dari MySQL:",
                paymentData.transactionId
            );

        } catch (error) {
            console.error(
                "[ARTHA] Gagal memuat struk dari database:",
                error
            );

            showReceiptError(
                error.message || "Gagal memuat data struk."
            );

            await showPopup(
                "error",
                error.message || "Data struk tidak dapat dimuat.",
                {
                    title: "Gagal Memuat Struk",
                    confirmText: "Mengerti"
                }
            );
        }
    }

    // Menampilkan data transaksi pada kertas struk.
    function renderReceipt() {
        transactionId.textContent = paymentData.transactionId;

        const dateValue = new Date(
            String(paymentData.completedAt).replace(" ", "T")
        );

        receiptDate.textContent = Number.isNaN(dateValue.getTime())
            ? paymentData.completedAt
            : dateValue.toLocaleString("id-ID", {
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            });

        receiptItems.replaceChildren();

        paymentData.items.forEach(function (item) {
            const row = document.createElement("div");
            row.className = "receipt-line";

            const productName = document.createElement("span");
            productName.textContent =
                item.name +
                " x" +
                item.quantity +
                (item.unit ? " " + item.unit : "");

            const subtotal = document.createElement("span");
            subtotal.textContent = formatRupiah(item.subtotal);

            row.append(productName, subtotal);
            receiptItems.appendChild(row);
        });

        receiptTotal.textContent = formatRupiah(paymentData.total);
        receiptMethod.textContent = paymentData.paymentMethod;
        receiptReceived.textContent = formatRupiah(
            paymentData.receivedAmount
        );
        receiptChange.textContent = formatRupiah(paymentData.change);

        if (printButton) printButton.disabled = false;
        if (pdfButton) pdfButton.disabled = false;
    }

    // Mencetak struk menggunakan dialog cetak browser.
    if (printButton) {
        printButton.addEventListener("click", function () {
            if (!paymentData) return;
            window.print();
        });
    }

    // Menyimpan struk sebagai PDF.
    if (pdfButton) {
        pdfButton.addEventListener("click", async function (event) {
            event.preventDefault();

            if (!paymentData) return;

            if (typeof html2pdf === "undefined") {
                await showPopup(
                    "error",
                    "Library PDF belum berhasil dimuat. Periksa koneksi internet.",
                    {
                        title: "PDF Tidak Tersedia"
                    }
                );
                return;
            }

            const originalButtonHTML = pdfButton.innerHTML;
            let temporaryContainer = null;

            try {
                pdfButton.disabled = true;
                pdfButton.textContent = "Menyiapkan PDF...";

                if (document.fonts && document.fonts.ready) {
                    await document.fonts.ready;
                }

                const pdfReceipt = receiptPaper.cloneNode(true);

                pdfReceipt.classList.add("receipt-pdf-export");

                Object.assign(pdfReceipt.style, {
                    width: "80mm",
                    minWidth: "0",
                    maxWidth: "80mm",
                    height: "auto",
                    minHeight: "0",
                    maxHeight: "none",
                    padding: "8mm",
                    margin: "0",
                    boxSizing: "border-box",
                    position: "static",
                    overflow: "visible",
                    border: "none",
                    borderRadius: "0",
                    boxShadow: "none",
                    background: "#FFFFFF"
                });

                temporaryContainer = document.createElement("div");

                Object.assign(temporaryContainer.style, {
                    position: "fixed",
                    left: "-10000px",
                    top: "0",
                    width: "80mm",
                    background: "#FFFFFF",
                    overflow: "visible"
                });

                temporaryContainer.appendChild(pdfReceipt);
                document.body.appendChild(temporaryContainer);

                await new Promise(function (resolve) {
                    requestAnimationFrame(resolve);
                });

                const heightPX = Math.max(
                    pdfReceipt.scrollHeight,
                    pdfReceipt.getBoundingClientRect().height
                );

                const heightMM = Math.ceil(
                    heightPX * 25.4 / 96
                ) + 18;

                if (heightMM > 5000) {
                    throw new Error(
                        "Ukuran struk terlalu panjang."
                    );
                }

                const fileName =
                    "Struk-" +
                    paymentData.transactionId +
                    ".pdf";

                await html2pdf()
                    .set({
                        margin: 0,
                        filename: fileName,
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
                            format: [80, heightMM],
                            orientation: "portrait"
                        },
                        pagebreak: {
                            mode: []
                        }
                    })
                    .from(pdfReceipt)
                    .save();

                await showPopup(
                    "success",
                    "Struk berhasil disimpan sebagai PDF.",
                    {
                        title: "PDF Berhasil"
                    }
                );

            } catch (error) {
                console.error(
                    "[ARTHA] Gagal membuat PDF:",
                    error
                );

                await showPopup(
                    "error",
                    error.message ||
                    "Gagal membuat PDF. Silakan coba kembali.",
                    {
                        title: "Gagal Menyimpan PDF"
                    }
                );

            } finally {
                if (temporaryContainer) {
                    temporaryContainer.remove();
                }

                pdfButton.disabled = false;
                pdfButton.innerHTML = originalButtonHTML;
            }
        });
    }

    // Membersihkan data keranjang saat Kasir memulai transaksi baru.
    const newTransactionButton = document.querySelector(
        '.receipt-actions a[href="transaksiPOS.php"]'
    );

    if (newTransactionButton) {
        newTransactionButton.addEventListener("click", function () {
            sessionStorage.removeItem("artha_payment_data");
            sessionStorage.removeItem("artha_pos_cart");
        });
    }

    // Memulai pengambilan data struk.
    loadReceipt();
});