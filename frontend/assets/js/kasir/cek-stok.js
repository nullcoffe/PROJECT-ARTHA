document.addEventListener("DOMContentLoaded", async function () {
    "use strict";

    // Mengambil elemen halaman cek stok.
    const searchForm = document.querySelector(".stock-search");
    const searchInput = document.getElementById("stockSearch");
    const statusFilter = document.getElementById("stockStatusFilter");
    const tableBody = document.getElementById("stockTableBody");

    if (!searchInput || !statusFilter || !tableBody) {
        console.error("[ARTHA] Elemen halaman cek stok tidak ditemukan.");
        return;
    }

    let products = [];
    let isLoading = false;

    // Format mata uang Rupiah.
    function formatRupiah(value) {
        return "Rp " + Number(value || 0).toLocaleString("id-ID");
    }

    // Menghitung status stok berdasarkan batas minimum database.
    function getStockStatus(product) {
        if (product.stock <= 0) {
            return "empty";
        }

        if (product.stock <= product.minimumStock) {
            return "low";
        }

        return "safe";
    }

    // Menentukan label status stok.
    function getStatusLabel(status) {
        const labels = {
            safe: "Aman",
            low: "Stok rendah",
            empty: "Habis"
        };

        return labels[status] || "-";
    }

    // Menentukan class tampilan status.
    function getStatusClass(status) {
        const classes = {
            safe: "stock-safe",
            low: "stock-low",
            empty: "stock-empty"
        };

        return classes[status] || "";
    }

    // Menampilkan pesan pada tabel.
    function showTableMessage(message) {
        tableBody.replaceChildren();

        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 5;
        cell.textContent = message;
        cell.style.textAlign = "center";
        cell.style.padding = "24px";

        row.appendChild(cell);
        tableBody.appendChild(row);
    }

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

    // Mengambil data produk dari respons API.
    function normalizeProducts(data) {
        return data.map(function (item) {
            const productId = Number(item.id_produk);
            const price = Number(item.harga);
            const stock = Number(item.stok);
            const minimumStock = Number(item.stok_minimum);

            if (
                !Number.isInteger(productId) ||
                productId <= 0 ||
                !Number.isFinite(price) ||
                !Number.isFinite(stock) ||
                !Number.isFinite(minimumStock)
            ) {
                return null;
            }

            const product = {
                id: productId,
                code: String(item.kode_produk || ""),
                name: String(item.nama_produk || ""),
                unit: String(item.satuan || "pcs"),
                price: price,
                stock: stock,
                minimumStock: minimumStock
            };

            product.status = getStockStatus(product);

            return product;
        }).filter(Boolean);
    }

    // Membuat baris produk.
    function createProductRow(product) {
        const row = document.createElement("tr");

        const idCell = document.createElement("td");
        idCell.textContent = product.code;

        const nameCell = document.createElement("td");
        nameCell.textContent =
            product.name + " (" + product.unit + ")";

        const priceCell = document.createElement("td");
        priceCell.textContent = formatRupiah(product.price);

        const stockCell = document.createElement("td");

        const stockValue = document.createElement("strong");
        stockValue.textContent =
            product.stock + " " + product.unit;

        stockCell.appendChild(stockValue);

        const statusCell = document.createElement("td");

        const statusLabel = document.createElement("span");
        statusLabel.className = getStatusClass(product.status);
        statusLabel.textContent = getStatusLabel(product.status);

        statusCell.appendChild(statusLabel);

        row.append(
            idCell,
            nameCell,
            priceCell,
            stockCell,
            statusCell
        );

        return row;
    }

    // Menampilkan data produk ke tabel.
    function renderProducts(data) {
        tableBody.replaceChildren();

        if (data.length === 0) {
            showTableMessage("Produk tidak ditemukan.");
            return;
        }

        const fragment = document.createDocumentFragment();

        data.forEach(function (product) {
            fragment.appendChild(
                createProductRow(product)
            );
        });

        tableBody.appendChild(fragment);
    }

    // Memfilter produk berdasarkan pencarian dan status.
    function filterProducts() {
        const keyword = searchInput.value
            .trim()
            .toLowerCase();

        const numericKeyword = keyword.replace(/\D/g, "");

        const selectedStatus = statusFilter.value;

        const filteredProducts = products.filter(function (product) {
            const searchableText = [
                product.code,
                product.name,
                product.unit,
                product.price,
                formatRupiah(product.price),
                product.stock,
                product.minimumStock
            ].join(" ").toLowerCase();

            const matchesText =
                searchableText.includes(keyword);

            const matchesNumber =
                numericKeyword !== "" &&
                [
                    String(product.price),
                    String(product.stock),
                    String(product.minimumStock)
                ].some(function (value) {
                    return value.includes(numericKeyword);
                });

            const matchesStatus =
                selectedStatus === "all" ||
                product.status === selectedStatus;

            return (
                (matchesText || matchesNumber) &&
                matchesStatus
            );
        });

        renderProducts(filteredProducts);
    }

    // Memuat produk aktif dari database.
    async function loadProducts() {
        if (isLoading) return;

        isLoading = true;

        showTableMessage("Memuat data stok dari database...");

        try {
            if (
                !window.ARTHA_API ||
                typeof window.ARTHA_API.get !== "function"
            ) {
                throw new Error(
                    "ARTHA API belum tersedia. Periksa pemuatan api.js."
                );
            }

            const response = await window.ARTHA_API.get(
                "kasir/products"
            );

            if (!Array.isArray(response.data)) {
                throw new Error(
                    "Format data produk tidak sesuai."
                );
            }

            products = normalizeProducts(response.data);

            filterProducts();

            console.info(
                "[ARTHA] Data cek stok berhasil dimuat.",
                {
                    totalProduk: products.length,
                    stokAman: products.filter(
                        item => item.status === "safe"
                    ).length,
                    stokRendah: products.filter(
                        item => item.status === "low"
                    ).length,
                    stokHabis: products.filter(
                        item => item.status === "empty"
                    ).length
                }
            );

        } catch (error) {
            console.error(
                "[ARTHA] Gagal memuat data stok:",
                error
            );

            showTableMessage(
                "Gagal memuat data stok. Silakan muat ulang halaman."
            );

            await showPopup(
                "error",
                error.message,
                {
                    title: "Gagal Memuat Stok",
                    confirmText: "Mengerti"
                }
            );

        } finally {
            isLoading = false;
        }
    }

    // Mengatur pencarian.
    searchInput.addEventListener("input", filterProducts);

    // Mengatur filter status.
    statusFilter.addEventListener("change", filterProducts);

    // Mencegah form pencarian melakukan reload.
    if (searchForm) {
        searchForm.addEventListener("submit", function (event) {
            event.preventDefault();
            filterProducts();
        });
    }

    // Membaca kata kunci dari URL.
    const urlParams = new URLSearchParams(
        window.location.search
    );

    const initialKeyword = urlParams.get("q");

    if (initialKeyword) {
        searchInput.value = initialKeyword;
    }

    // Menginisialisasi halaman.
    await loadProducts();

    console.info(
        "[ARTHA] Modul Cek Stok berhasil diinisialisasi."
    );
});