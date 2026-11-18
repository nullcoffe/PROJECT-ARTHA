document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    // Mengambil elemen halaman POS.
    const searchInput = document.getElementById("productSearch");
    const productTableBody = document.getElementById("productTableBody");

    const cartItems = document.getElementById("cartItems");
    const cartTotal = document.getElementById("cartTotal");
    const emptyCart = document.getElementById("emptyCart");

    const clearCartButton = document.getElementById("clearCart");
    const checkoutButton = document.getElementById("checkoutButton");

    if (
        !searchInput ||
        !productTableBody ||
        !cartItems ||
        !cartTotal ||
        !emptyCart
    ) {
        console.error(
            "[ARTHA] Elemen transaksi POS tidak ditemukan."
        );
        return;
    }

    // Menyimpan data produk dari database.
    let products = [];

    // Menandai proses pemuatan produk.
    let isLoadingProducts = false;

    // Menandai apakah terjadi kegagalan pemuatan produk.
    let productLoadFailed = false;

    // Mengatur API yang digunakan.
    const PRODUCT_ENDPOINT = "kasir/products";

    // Format mata uang Rupiah.
    function formatPOSRupiah(amount) {
        return "Rp " + Number(amount || 0).toLocaleString("id-ID");
    }

    // Menampilkan notifikasi melalui popup ARTHA.
    async function showPOSPopup(type, message, options = {}) {
        if (
            window.arthaPopup &&
            typeof window.arthaPopup[type] === "function"
        ) {
            return window.arthaPopup[type](
                message,
                options
            );
        }

        window.alert(message);
        return false;
    }

    // Mengambil data respons API.
    function getResponseData(response) {
        if (
            !response ||
            typeof response !== "object"
        ) {
            throw new Error(
                "Respons server tidak valid."
            );
        }

        const data = response.data ?? response.payload;

        if (!Array.isArray(data)) {
            throw new Error(
                "Format katalog produk dari server tidak sesuai."
            );
        }

        return data;
    }

    // Mengubah data database menjadi format produk POS.
    function normalizeProducts(data) {
        return data.map(function (item) {
            const id = Number(item.id_produk);
            const price = Number(item.harga);
            const stock = Number(item.stok);
            const minimumStock = Number(item.stok_minimum);

            if (
                !Number.isInteger(id) ||
                id <= 0 ||
                !Number.isFinite(price) ||
                price < 0 ||
                !Number.isFinite(stock) ||
                stock < 0
            ) {
                return null;
            }

            return {
                id: String(id),
                id_produk: id,
                code: String(item.kode_produk ?? ""),
                name: String(item.nama_produk ?? ""),
                category: String(
                    item.kategori ??
                    item.kategori_produk ??
                    "Umum"
                ),
                unit: String(item.satuan ?? "pcs"),
                price: price,
                stock: stock,
                minimumStock: Number.isFinite(minimumStock)
                    ? minimumStock
                    : 0,
                stockStatus:
                    stock <= 0
                        ? "Stok Habis"
                        : stock <= minimumStock
                            ? "Stok Rendah"
                            : "Tersedia"
            };
        }).filter(Boolean);
    }

    // Memuat katalog produk dari database MySQL.
    async function loadProducts() {
        if (isLoadingProducts) return;

        isLoadingProducts = true;
        productLoadFailed = false;

        productTableBody.replaceChildren();

        const loadingRow = document.createElement("tr");
        const loadingCell = document.createElement("td");

        loadingCell.colSpan = 5;
        loadingCell.textContent = "Memuat produk dari database...";
        loadingCell.style.textAlign = "center";

        loadingRow.appendChild(loadingCell);
        productTableBody.appendChild(loadingRow);

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
                PRODUCT_ENDPOINT
            );

            const data = getResponseData(response);

            products = normalizeProducts(data);

            productLoadFailed = false;

            renderProducts(products);

            console.info(
                `[ARTHA] ${products.length} produk berhasil dimuat dari MySQL.`,
                products
            );

            if (products.length === 0) {
                console.warn(
                    "[ARTHA] Belum terdapat produk aktif dalam database."
                );
            }

        } catch (error) {
            productLoadFailed = true;
            products = [];

            console.error(
                "[ARTHA] Gagal memuat katalog produk:",
                error
            );

            productTableBody.replaceChildren();

            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 5;
            cell.textContent = "Gagal memuat produk. Silakan coba kembali.";
            cell.style.textAlign = "center";

            row.appendChild(cell);
            productTableBody.appendChild(row);

            await showPOSPopup(
                "error",
                error.message,
                {
                    title: "Gagal Memuat Produk",
                    confirmText: "Mengerti"
                }
            );

        } finally {
            isLoadingProducts = false;
        }
    }

    // Menampilkan katalog produk pada tabel POS.
    function renderProducts(data) {
        productTableBody.replaceChildren();

        if (data.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 5;
            cell.textContent = productLoadFailed
                ? "Produk gagal dimuat."
                : "Produk tidak ditemukan.";

            cell.style.textAlign = "center";

            row.appendChild(cell);
            productTableBody.appendChild(row);

            return;
        }

        data.forEach(function (product) {
            const row = document.createElement("tr");

            row.dataset.productId = product.id;
            row.dataset.productName = product.name;
            row.dataset.productCode = product.code;
            row.dataset.category = product.category;
            row.dataset.unit = product.unit;
            row.dataset.price = product.price;
            row.dataset.stock = product.stock;
            row.dataset.minimumStock = product.minimumStock;
            row.dataset.stockStatus = product.stockStatus;

            const idCell = document.createElement("td");

            const idText = document.createElement("strong");
            idText.textContent = product.code || product.id;

            idCell.appendChild(idText);

            const nameCell = document.createElement("td");

            nameCell.className = "product-name";
            nameCell.textContent =
                product.name + " (" + product.unit + ")";

            const priceCell = document.createElement("td");

            priceCell.className = "product-price";
            priceCell.textContent = formatPOSRupiah(product.price);

            const stockCell = document.createElement("td");

            stockCell.textContent = product.stock;
            stockCell.title =
                "Status: " + product.stockStatus +
                " | Stok minimum: " + product.minimumStock;

            const actionCell = document.createElement("td");

            const addButton = document.createElement("button");

            addButton.type = "button";
            addButton.className = "add-item";

            addButton.setAttribute(
                "aria-label",
                "Tambah " + product.name
            );

            addButton.disabled = product.stock <= 0;

            if (product.stock <= 0) {
                addButton.title = "Stok produk habis";
            }

            const addIcon = document.createElement("img");

            addIcon.src = "../assets/icons/actions/tambah.svg";
            addIcon.alt = "";

            addButton.appendChild(addIcon);
            actionCell.appendChild(addButton);

            row.append(
                idCell,
                nameCell,
                priceCell,
                stockCell,
                actionCell
            );

            productTableBody.appendChild(row);
        });
    }

    // Melakukan pencarian produk berdasarkan kode, nama, kategori, atau satuan.
    searchInput.addEventListener("input", function () {
        const keyword = this.value.trim().toLowerCase();

        const filteredProducts = products.filter(function (product) {
            return (
                product.id.toLowerCase().includes(keyword) ||
                product.code.toLowerCase().includes(keyword) ||
                product.name.toLowerCase().includes(keyword) ||
                product.category.toLowerCase().includes(keyword) ||
                product.unit.toLowerCase().includes(keyword)
            );
        });

        renderProducts(filteredProducts);
    });

    // Menghitung subtotal dan total seluruh produk dalam keranjang.
    function updateCartTotal() {
        let total = 0;

        const cartRows = cartItems.querySelectorAll(".cart-row");

        cartRows.forEach(function (row) {
            const quantity = Number(
                row.querySelector(".qty-value").textContent
            );

            const price = Number(row.dataset.unitPrice);

            const subtotal = quantity * price;

            row.querySelector(".cart-subtotal").textContent =
                formatPOSRupiah(subtotal);

            total += subtotal;
        });

        cartTotal.textContent = formatPOSRupiah(total);

        emptyCart.style.display =
            cartRows.length === 0 ? "block" : "none";

        if (checkoutButton) {
            checkoutButton.classList.toggle(
                "cart-empty",
                cartRows.length === 0
            );
        }
    }

    // Membuat tampilan satu baris produk dalam keranjang.
    function createCartRow(product) {
        const row = document.createElement("div");

        row.className = "cart-row";

        row.dataset.productId = product.id;
        row.dataset.unitPrice = product.price;
        row.dataset.stock = product.stock;
        row.dataset.unit = product.unit;

        const name = document.createElement("strong");

        name.className = "cart-product-name";

        name.textContent =
            product.name + " (" + product.unit + ")";

        const qtyControl = document.createElement("div");

        qtyControl.className = "qty-control";

        const minusButton = document.createElement("button");

        minusButton.type = "button";
        minusButton.className = "qty-btn minus";
        minusButton.textContent = "−";

        minusButton.setAttribute(
            "aria-label",
            "Kurangi jumlah " + product.name
        );

        const quantity = document.createElement("span");

        quantity.className = "qty-value";
        quantity.textContent = "1";

        const plusButton = document.createElement("button");

        plusButton.type = "button";
        plusButton.className = "qty-btn plus";
        plusButton.textContent = "+";

        plusButton.setAttribute(
            "aria-label",
            "Tambah jumlah " + product.name
        );

        qtyControl.append(
            minusButton,
            quantity,
            plusButton
        );

        const subtotal = document.createElement("b");

        subtotal.className = "cart-subtotal";
        subtotal.textContent = formatPOSRupiah(product.price);

        const removeButton = document.createElement("button");

        removeButton.type = "button";
        removeButton.className = "remove-item";

        removeButton.setAttribute(
            "aria-label",
            "Hapus " + product.name
        );

        const deleteIcon = document.createElement("img");

        deleteIcon.src = "../assets/icons/actions/delete.svg";
        deleteIcon.alt = "";

        removeButton.appendChild(deleteIcon);

        row.append(
            name,
            qtyControl,
            subtotal,
            removeButton
        );

        return row;
    }

    // Menambahkan produk yang dipilih ke keranjang.
    productTableBody.addEventListener("click", async function (event) {
        const addButton = event.target.closest(".add-item");

        if (!addButton) return;

        if (productLoadFailed || isLoadingProducts) {
            await showPOSPopup(
                "warning",
                "Katalog produk belum berhasil dimuat.",
                {
                    title: "Produk Belum Tersedia"
                }
            );

            return;
        }

        const productRow = addButton.closest("tr");

        if (!productRow) return;

        const productId = productRow.dataset.productId;

        const product = products.find(function (item) {
            return item.id === productId;
        });

        if (!product) {
            await showPOSPopup(
                "error",
                "Produk tidak ditemukan. Silakan muat ulang katalog.",
                {
                    title: "Produk Tidak Ditemukan"
                }
            );

            return;
        }

        if (product.stock <= 0) {
            await showPOSPopup(
                "warning",
                "Stok produk habis.",
                {
                    title: "Stok Habis"
                }
            );

            return;
        }

        const existingRow = Array.from(
            cartItems.querySelectorAll(".cart-row")
        ).find(function (row) {
            return row.dataset.productId === product.id;
        });

        if (existingRow) {
            const quantityElement =
                existingRow.querySelector(".qty-value");

            const currentQuantity =
                Number(quantityElement.textContent);

            if (currentQuantity >= product.stock) {
                await showPOSPopup(
                    "warning",
                    "Jumlah " + product.name +
                    " sudah mencapai batas stok yang tersedia (" +
                    product.stock + " " + product.unit + ").",
                    {
                        title: "Batas Stok Tercapai"
                    }
                );

                return;
            }

            quantityElement.textContent = currentQuantity + 1;

        } else {
            cartItems.appendChild(
                createCartRow(product)
            );
        }

        updateCartTotal();
    });

    // Mengubah kuantitas atau menghapus produk dari keranjang.
    cartItems.addEventListener("click", async function (event) {
        const row = event.target.closest(".cart-row");

        if (!row) return;

        const quantityElement =
            row.querySelector(".qty-value");

        let quantity = Number(quantityElement.textContent);

        const stock = Number(row.dataset.stock);

        const plusButton = event.target.closest(".qty-btn.plus");
        const minusButton = event.target.closest(".qty-btn.minus");
        const removeButton = event.target.closest(".remove-item");

        if (plusButton) {
            if (quantity >= stock) {
                await showPOSPopup(
                    "warning",
                    "Jumlah produk sudah mencapai batas stok yang tersedia (" +
                    stock + " " + row.dataset.unit + ").",
                    {
                        title: "Batas Stok Tercapai"
                    }
                );

                return;
            }

            quantity++;
            quantityElement.textContent = quantity;

        } else if (minusButton) {
            if (quantity > 1) {
                quantity--;
                quantityElement.textContent = quantity;
            }

        } else if (removeButton) {
            row.remove();
        }

        updateCartTotal();
    });

    // Menghapus seluruh produk dari keranjang.
    if (clearCartButton) {
        clearCartButton.addEventListener("click", async function () {
            const rows = cartItems.querySelectorAll(".cart-row");

            if (rows.length === 0) {
                await showPOSPopup(
                    "info",
                    "Keranjang belanja masih kosong.",
                    {
                        title: "Informasi"
                    }
                );

                return;
            }

            let confirmation = false;

            if (
                window.arthaPopup &&
                typeof window.arthaPopup.confirm === "function"
            ) {
                confirmation = await window.arthaPopup.confirm(
                    "Apakah Anda yakin ingin menghapus seluruh produk dari keranjang belanja?",
                    {
                        title: "Kosongkan Keranjang",
                        confirmText: "Ya, Hapus Semua",
                        cancelText: "Batal",
                        type: "warning"
                    }
                );
            } else {
                confirmation = window.confirm(
                    "Apakah Anda yakin ingin menghapus seluruh produk dari keranjang belanja?"
                );
            }

            if (!confirmation) return;

            cartItems.replaceChildren();

            updateCartTotal();
        });
    }

    // Memvalidasi keranjang dan mengirim data ke halaman pembayaran.
    if (checkoutButton) {
        checkoutButton.addEventListener("click", async function (event) {
            const rows = cartItems.querySelectorAll(".cart-row");

            if (rows.length === 0) {
                event.preventDefault();

                await showPOSPopup(
                    "warning",
                    "Keranjang masih kosong. Tambahkan produk terlebih dahulu.",
                    {
                        title: "Keranjang Kosong"
                    }
                );

                return;
            }

            if (productLoadFailed || isLoadingProducts) {
                event.preventDefault();

                await showPOSPopup(
                    "error",
                    "Katalog produk belum berhasil dimuat. Silakan muat ulang halaman.",
                    {
                        title: "Katalog Tidak Tersedia"
                    }
                );

                return;
            }

            const items = [];

            let total = 0;
            let invalidData = false;

            rows.forEach(function (row) {
                const productId = Number(row.dataset.productId);

                const quantity = Number(
                    row.querySelector(".qty-value").textContent
                );

                const price = Number(row.dataset.unitPrice);
                const stock = Number(row.dataset.stock);

                const product = products.find(function (item) {
                    return item.id_produk === productId;
                });

                if (
                    !product ||
                    !Number.isInteger(quantity) ||
                    quantity <= 0 ||
                    quantity > stock ||
                    !Number.isFinite(price) ||
                    price < 0 ||
                    product.price !== price ||
                    product.stock !== stock
                ) {
                    invalidData = true;
                    return;
                }

                const subtotal = price * quantity;

                items.push({
                    id: product.id,
                    id_produk: product.id_produk,
                    code: product.code,
                    name: product.name,
                    category: product.category,
                    unit: product.unit,
                    price: product.price,
                    quantity: quantity,
                    subtotal: subtotal
                });

                total += subtotal;
            });

            if (
                invalidData ||
                items.length !== rows.length ||
                items.length === 0
            ) {
                event.preventDefault();

                await showPOSPopup(
                    "warning",
                    "Data keranjang tidak valid. Periksa kembali produk dan stok.",
                    {
                        title: "Data Transaksi Tidak Valid"
                    }
                );

                return;
            }

            const transactionData = {
                items: items,
                total: total,
                createdAt: new Date().toISOString()
            };

            try {
                sessionStorage.setItem(
                    "artha_pos_cart",
                    JSON.stringify(transactionData)
                );

                console.info(
                    "[ARTHA] Data keranjang berhasil diteruskan ke halaman pembayaran.",
                    transactionData
                );

            } catch (error) {
                event.preventDefault();

                console.error(
                    "[ARTHA] Gagal menyimpan keranjang:",
                    error
                );

                await showPOSPopup(
                    "error",
                    "Data transaksi gagal disimpan di browser.",
                    {
                        title: "Gagal Menyimpan Keranjang"
                    }
                );
            }
        });
    }

    // Menginisialisasi tampilan keranjang.
    cartItems.replaceChildren();

    updateCartTotal();

    // Memuat produk dari database setelah seluruh event siap.
    loadProducts();

    console.info(
        "[ARTHA] Modul Transaksi POS berhasil diinisialisasi."
    );
});