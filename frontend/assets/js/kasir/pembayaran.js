document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    // Mengambil elemen halaman pembayaran.
    const tableBody = document.getElementById("paymentTableBody");
    const totalElement = document.getElementById("paymentTotal");
    const receivedInput = document.getElementById("uang-diterima");
    const changeValue = document.querySelector(".change-value");
    const paymentEquation = document.getElementById("paymentEquation");

    const quickAmounts = document.querySelectorAll(".quick-amounts a");

    const finishButton = document.getElementById("finishTransaction");

    if (
        !tableBody ||
        !totalElement ||
        !receivedInput ||
        !changeValue ||
        !paymentEquation ||
        !finishButton
    ) {
        console.error("[ARTHA] Elemen pembayaran tidak lengkap.");
        return;
    }

    // Menampilkan popup ARTHA.
    async function showPaymentPopup(type, message, options = {}) {
        if (
            window.arthaPopup &&
            typeof window.arthaPopup[type] === "function"
        ) {
            return window.arthaPopup[type](message, options);
        }

        window.alert(message);
        return false;
    }

    // Format nominal Rupiah.
    function formatRupiah(amount) {
        return "Rp " + Number(amount || 0).toLocaleString("id-ID");
    }

    // Mengambil angka dari input Rupiah.
    function parseRupiah(value) {
        return Number(String(value).replace(/\D/g, "")) || 0;
    }

    // Mengambil data keranjang dari sessionStorage.
    let transactionData;

    try {
        const savedData = sessionStorage.getItem("artha_pos_cart");

        if (!savedData) {
            throw new Error("Data keranjang tidak ditemukan.");
        }

        transactionData = JSON.parse(savedData);

        if (
            !transactionData ||
            !Array.isArray(transactionData.items) ||
            transactionData.items.length === 0
        ) {
            throw new Error("Data keranjang tidak valid.");
        }

    } catch (error) {
        console.error("[ARTHA] Gagal membaca keranjang:", error);

        tableBody.replaceChildren();

        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 5;
        cell.textContent = "Data transaksi tidak ditemukan.";

        row.appendChild(cell);
        tableBody.appendChild(row);

        totalElement.textContent = formatRupiah(0);

        finishButton.addEventListener("click", function (event) {
            event.preventDefault();

            showPaymentPopup(
                "warning",
                "Silakan kembali ke halaman POS dan pilih produk terlebih dahulu.",
                {
                    title: "Keranjang Kosong"
                }
            );
        });

        return;
    }

    // Memvalidasi seluruh data produk.
    const validItems = transactionData.items.filter(function (item) {
        const productId = Number(item.id_produk ?? item.id);
        const price = Number(item.price);
        const quantity = Number(item.quantity);

        return (
            Number.isInteger(productId) &&
            productId > 0 &&
            item.name &&
            Number.isFinite(price) &&
            price >= 0 &&
            Number.isInteger(quantity) &&
            quantity > 0
        );
    });

    if (
        validItems.length !== transactionData.items.length ||
        validItems.length === 0
    ) {
        finishButton.addEventListener("click", function (event) {
            event.preventDefault();
        });

        showPaymentPopup(
            "error",
            "Terdapat data produk yang tidak valid. Silakan kembali ke POS.",
            {
                title: "Data Transaksi Tidak Valid"
            }
        );

        return;
    }

    // Menampilkan ringkasan transaksi.
    let total = 0;

    tableBody.replaceChildren();

    validItems.forEach(function (item) {
        const productId = Number(item.id_produk ?? item.id);
        const price = Number(item.price);
        const quantity = Number(item.quantity);

        const subtotal = price * quantity;

        total += subtotal;

        const row = document.createElement("tr");

        const values = [
            item.code || ("PRD" + String(productId).padStart(3, "0")),
            item.name,
            formatRupiah(price),
            quantity,
            formatRupiah(subtotal)
        ];

        values.forEach(function (value, index) {
            const cell = document.createElement("td");

            if (index === 0) {
                const strong = document.createElement("strong");
                strong.textContent = value;
                cell.appendChild(strong);
            } else {
                cell.textContent = value;
            }

            row.appendChild(cell);
        });

        tableBody.appendChild(row);
    });

    totalElement.textContent = formatRupiah(total);

    // Mengatur nominal pembayaran.
    let receivedAmount = 0;
    let isProcessing = false;

    function updatePayment(formatInput = false) {
        const change = receivedAmount - total;

        if (formatInput) {
            receivedInput.value =
                receivedAmount.toLocaleString("id-ID");
        }

        if (change >= 0) {
            changeValue.textContent = formatRupiah(change);
            changeValue.style.color = "#269B68";
        } else {
            changeValue.textContent =
                "Kurang " + formatRupiah(Math.abs(change));

            changeValue.style.color = "#E05252";
        }

        paymentEquation.textContent =
            formatRupiah(receivedAmount) +
            " − " +
            formatRupiah(total);
    }

    updatePayment(true);

    // Mengatur input uang diterima.
    receivedInput.addEventListener("focus", function () {
        if (receivedAmount === 0) {
            this.value = "";
        }
    });

    receivedInput.addEventListener("input", function () {
        const cursorPosition = this.selectionStart || 0;

        const digitsBeforeCursor = this.value
            .slice(0, cursorPosition)
            .replace(/\D/g, "")
            .length;

        const rawValue = this.value.replace(/\D/g, "");

        receivedAmount = Number(rawValue) || 0;

        const formattedValue = rawValue
            ? Number(rawValue).toLocaleString("id-ID")
            : "";

        this.value = formattedValue;

        let newCursorPosition = 0;
        let digitCount = 0;

        while (
            newCursorPosition < formattedValue.length &&
            digitCount < digitsBeforeCursor
        ) {
            if (/\d/.test(formattedValue[newCursorPosition])) {
                digitCount++;
            }

            newCursorPosition++;
        }

        this.setSelectionRange(
            newCursorPosition,
            newCursorPosition
        );

        updatePayment(false);
    });

    receivedInput.addEventListener("blur", function () {
        if (this.value === "") {
            receivedAmount = 0;
        }

        updatePayment(true);
    });

    // Tombol nominal pembayaran cepat.
    quickAmounts.forEach(function (button) {
        button.addEventListener("click", function (event) {
            event.preventDefault();

            const amount = parseRupiah(
                button.dataset.amount || button.textContent
            );

            if (amount > 0) {
                receivedAmount += amount;
                updatePayment(true);
            }
        });
    });

    // Memproses pembayaran ke database.
    finishButton.addEventListener("click", async function (event) {
        event.preventDefault();

        if (isProcessing) {
            return;
        }

        if (receivedAmount < total) {
            const shortage = total - receivedAmount;

            await showPaymentPopup(
                "warning",
                "Uang yang diterima masih kurang " +
                formatRupiah(shortage) +
                ". Silakan masukkan nominal pembayaran yang mencukupi.",
                {
                    title: "Uang Tidak Cukup",
                    confirmText: "Mengerti"
                }
            );

            return;
        }

        if (
            !window.ARTHA_API ||
            typeof window.ARTHA_API.post !== "function"
        ) {
            await showPaymentPopup(
                "error",
                "ARTHA API belum tersedia. Periksa pemuatan api.js.",
                {
                    title: "Koneksi API Bermasalah"
                }
            );

            return;
        }

        // Membentuk payload yang dibutuhkan backend.
        const payload = {
            uang_diterima: receivedAmount,
            items: validItems.map(function (item) {
                return {
                    id_produk: Number(item.id_produk ?? item.id),
                    jumlah: Number(item.quantity)
                };
            })
        };

        isProcessing = true;

        finishButton.style.pointerEvents = "none";
        finishButton.style.opacity = "0.6";

        const originalButtonText = finishButton.textContent;

        finishButton.textContent = "Memproses Pembayaran...";

        try {
            // Mengirim transaksi ke backend.
            const response = await window.ARTHA_API.post(
                "kasir/transactions",
                payload
            );

            const result = response.data;

            if (
                !result ||
                !result.nomor_transaksi ||
                !Array.isArray(result.items)
            ) {
                throw new Error(
                    "Respons penyimpanan transaksi tidak lengkap."
                );
            }

            // Mengubah hasil backend menjadi format data struk.
            const paymentData = {
                transactionId: result.nomor_transaksi,

                databaseId: result.id_transaksi,

                items: result.items.map(function (item) {
                    return {
                        id: item.kode_produk,
                        id_produk: item.id_produk,
                        code: item.kode_produk,
                        name: item.nama_produk,
                        unit: item.satuan,
                        price: Number(item.harga_satuan),
                        quantity: Number(item.jumlah),
                        subtotal: Number(item.subtotal)
                    };
                }),

                total: Number(result.total_bayar),

                paymentMethod: "Tunai",

                receivedAmount: Number(result.uang_diterima),

                change: Number(result.uang_kembalian),

                completedAt: result.tanggal_transaksi
                    ? result.tanggal_transaksi.replace(" ", "T")
                    : new Date().toISOString()
            };

            // Memastikan nominal yang dikembalikan backend sesuai.
            if (
                !Number.isFinite(paymentData.total) ||
                !Number.isFinite(paymentData.receivedAmount) ||
                !Number.isFinite(paymentData.change) ||
                paymentData.receivedAmount < paymentData.total ||
                Math.abs(
                    paymentData.receivedAmount -
                    paymentData.total -
                    paymentData.change
                ) > 0.01
            ) {
                throw new Error(
                    "Data pembayaran dari server tidak konsisten."
                );
            }

            // Menyimpan data untuk halaman cetak struk.
            sessionStorage.setItem(
                "artha_payment_data",
                JSON.stringify(paymentData)
            );

            // Menghapus keranjang setelah transaksi berhasil disimpan.
            sessionStorage.removeItem("artha_pos_cart");

            console.info(
                "[ARTHA] Transaksi berhasil disimpan ke MySQL.",
                paymentData
            );

            await showPaymentPopup(
                "success",
                "Transaksi " +
                paymentData.transactionId +
                " berhasil disimpan. Stok produk telah diperbarui.",
                {
                    title: "Pembayaran Berhasil",
                    confirmText: "Cetak Struk"
                }
            );

            // Membuka halaman cetak struk.
            window.location.href = "cetakStruk.php?nomor_transaksi=" + encodeURIComponent(paymentData.transactionId);

        } catch (error) {
            console.error(
                "[ARTHA] Gagal menyimpan transaksi:",
                error
            );

            await showPaymentPopup(
                "error",
                error.message ||
                "Transaksi gagal disimpan. Silakan coba kembali.",
                {
                    title: "Pembayaran Gagal",
                    confirmText: "Mengerti"
                }
            );

        } finally {
            isProcessing = false;

            finishButton.style.pointerEvents = "";
            finishButton.style.opacity = "";
            finishButton.textContent = originalButtonText;
        }
    });

    // Memastikan tampilan tidak memuat transaksi lama dari cache.
    window.addEventListener("pageshow", function (event) {
        if (
            event.persisted &&
            !sessionStorage.getItem("artha_pos_cart")
        ) {
            window.location.reload();
        }
    });

    console.info("[ARTHA] Modul pembayaran berhasil dimuat.");
    console.info("[ARTHA] Jumlah produk:", validItems.length);
    console.info("[ARTHA] Total pembayaran:", formatRupiah(total));
});