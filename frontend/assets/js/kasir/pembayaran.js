document.addEventListener("DOMContentLoaded", function () {

    // 1. MENGAMBIL ELEMEN HTML
    const tableBody = document.getElementById("paymentTableBody");
    const totalElement = document.getElementById("paymentTotal");
    const receivedInput = document.getElementById("uang-diterima");
    const changeValue = document.querySelector(".change-value");
    const paymentEquation = document.getElementById("paymentEquation");
    const quickAmounts = document.querySelectorAll(".quick-amounts a");
    const finishButton = document.querySelector(
        ".payment-actions .button-primary"
    );

    if (
        !tableBody ||
        !totalElement ||
        !receivedInput ||
        !changeValue ||
        !paymentEquation ||
        !finishButton
    ) {

        console.error("Elemen pembayaran tidak ditemukan.");

        return;

    }

    // 2. FUNGSI POPUP CUSTOM ARTHA
    function showPaymentPopup(type, message, options = {}) {
        if (
            window.arthaPopup &&
            typeof window.arthaPopup[type] === "function"
        ) {
            return window.arthaPopup[type](message, options);
        }
        console.error(
            "ARTHA Custom Popup belum tersedia. Periksa popup.js."
        );
        return Promise.resolve(false);
    }

    // 3. MEMBACA DATA TRANSAKSI
    let transactionData;

    try {
        const savedData = sessionStorage.getItem("artha_pos_cart");
        if (!savedData) {
            throw new Error("Data transaksi tidak ditemukan.");
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
        console.error("Gagal membaca transaksi:", error);
        tableBody.replaceChildren();
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 5;
        cell.textContent = "Data transaksi tidak ditemukan.";
        row.appendChild(cell);
        tableBody.appendChild(row);
        totalElement.textContent = "Rp 0";
        finishButton.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            showPaymentPopup(
                "warning",
                "Uang yang diterima masih kurang " +
                formatRupiah(kekurangan) +
                ". Silakan masukkan nominal pembayaran yang mencukupi.",
                {
                    title: "Uang Tidak Cukup",
                    confirmText: "Mengerti"
                }
            );

        });

        return;

    }

    // 4. FORMAT RUPIAH
    function formatRupiah(amount) {
        return "Rp " + Number(amount).toLocaleString("id-ID");
    }

    function parseRupiah(value) {
        return Number(
            String(value).replace(/\D/g, "")
        ) || 0;
    }

    // 5. VALIDASI DATA PRODUK
    const validItems = transactionData.items.filter(function (item) {
        const price = Number(item.price);
        const quantity = Number(item.quantity);
        return (
            item.id !== undefined &&
            item.id !== null &&
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

        console.error("Terdapat data produk yang tidak valid.");

        tableBody.replaceChildren();

        showPaymentPopup(
            "warning",
            "Data produk tidak valid. Periksa kembali keranjang.",
            {
                title: "Data Transaksi Tidak Valid",
                confirmText: "Mengerti"
            }
        );


        finishButton.addEventListener("click", function (event) {

            event.preventDefault();

            event.stopPropagation();

        });

        return;

    }

    // 6. MENAMPILKAN RINGKASAN TRANSAKSI
    let calculatedTotal = 0;
    tableBody.replaceChildren();
    validItems.forEach(function (item) {
        const price = Number(item.price);
        const quantity = Number(item.quantity);
        const subtotal = price * quantity;
        calculatedTotal += subtotal;
        const row = document.createElement("tr");
        const values = [
            item.id,
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

    const total = calculatedTotal;
    totalElement.textContent = formatRupiah(total);

    // 7. MENGHITUNG UANG DITERIMA DAN KEMBALIAN
    let receivedAmount = 0;

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

    // 8. INPUT UANG DITERIMA
    receivedInput.addEventListener("focus", function () {
        if (receivedAmount === 0) {
            this.value = "";
        }
    });

    receivedInput.addEventListener("input", function () {
        // Posisi kursor sebelum format berubah
        const cursorPosition = this.selectionStart;
        // Jumlah angka sebelum posisi kursor
        const digitsBeforeCursor = this.value
            .slice(0, cursorPosition)
            .replace(/\D/g, "")
            .length;

        // Mengambil angka saja
        const rawValue = this.value.replace(/\D/g, "");
        // Menghitung uang diterima
        receivedAmount = Number(rawValue) || 0;
        // Format Rupiah
        const formattedValue = rawValue
            ? Number(rawValue).toLocaleString("id-ID")
            : "";

        this.value = formattedValue;

        // Mengembalikan posisi kursor
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

        // Memperbarui perhitungan
        updatePayment(false);
    });

    // 9. MENGEMBALIKAN NILAI KETIKA INPUT KOSONG
    receivedInput.addEventListener("blur", function () {
        if (this.value === "") {
            receivedAmount = 0;
        }
        updatePayment(true);
    });

    // 10. TOMBOL NOMINAL UANG CEPAT
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

    // 11. MENYELESAIKAN TRANSAKSI
    finishButton.addEventListener("click", function (event) {

        // VALIDASI UANG TIDAK CUKUP
        if (receivedAmount < total) {
            event.preventDefault();
            event.stopPropagation();
            const kekurangan = total - receivedAmount;

            showPaymentPopup(
                "warning",
                "Uang yang diterima masih kurang " +
                formatRupiah(kekurangan) +
                ". Silakan masukkan nominal pembayaran yang mencukupi.",
                {
                    title: "Uang Tidak Cukup",
                    confirmText: "Mengerti"
                }
            );

            return;
        }

        // MEMBUAT DATA PEMBAYARAN
        const paymentData = {
            transactionId: "TRX-" + Date.now(),
            items: validItems,
            total: total,
            paymentMethod: "Tunai",
            receivedAmount: receivedAmount,
            change: receivedAmount - total,
            completedAt: new Date().toISOString()
        };

        // MENYIMPAN DATA PEMBAYARAN
        try {
            sessionStorage.setItem(
                "artha_payment_data",
                JSON.stringify(paymentData)
            );

            // MENGHAPUS KERANJANG AKTIF

            // Data pembayaran sudah disimpan.
            // Data ini tetap tersedia untuk cetak struk.
            sessionStorage.removeItem("artha_pos_cart");
            
            // MENGOSONGKAN RINGKASAN TRANSAKSI
            tableBody.replaceChildren();
            totalElement.textContent = formatRupiah(0);

            // RESET PEMBAYARAN
            receivedAmount = 0;

            receivedInput.value = "0";

            changeValue.textContent = formatRupiah(0);

            changeValue.style.color = "#269B68";


            paymentEquation.textContent =

                formatRupiah(0) +
                " − " +
                formatRupiah(0);


            console.log(

                "Transaksi ARTHA berhasil disimpan:",

                paymentData

            );


            // Navigasi menuju cetak struk dilakukan
            // secara otomatis oleh href tombol Selesai Transaksi.


        } catch (error) {

            event.preventDefault();

            event.stopPropagation();

            console.error(

                "Gagal menyimpan pembayaran:",

                error

            );


            showPaymentPopup(

                "error",
                "Data pembayaran gagal disimpan. Silakan coba kembali.",
                {
                    title: "Pembayaran Gagal",
                    confirmText: "Mengerti"
                }
            );
        }
    });

    // 12. AUTO CLEAR KETIKA KELUAR PEMBAYARAN
    window.addEventListener("pagehide", function () {
        sessionStorage.removeItem("artha_pos_cart");
        console.log("Keranjang transaksi aktif telah dibersihkan.");
    });

    // 13. RESET TAMPILAN KETIKA KEMBALI
    window.addEventListener("pageshow", function (event) {
        if (
            event.persisted &&
            !sessionStorage.getItem("artha_pos_cart")
        ) {
            tableBody.replaceChildren();
            totalElement.textContent = formatRupiah(0);
            receivedAmount = 0;
            receivedInput.value = "0";
            changeValue.textContent = formatRupiah(0);
            changeValue.style.color = "#269B68";
            paymentEquation.textContent =
                formatRupiah(0) + " − " + formatRupiah(0);
        }
    });

    // 14. LOG STATUS
    console.log("Pembayaran ARTHA berhasil dimuat.");
    console.log("Jumlah produk:", validItems.length);
    console.log("Total pembayaran:", formatRupiah(total));

});