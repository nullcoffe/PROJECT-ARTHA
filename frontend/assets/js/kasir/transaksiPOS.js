document.addEventListener("DOMContentLoaded", function () {

    // 1. DATA PRODUK DARI DATASET EXCEL

    const productData = [

        ["PRD001", "Beras", "Bahan Pokok", "kg", 15000, 5, 37, "Tersedia"],
        ["PRD002", "Minyak Goreng", "Bahan Pokok", "liter", 18000, 172, 39, "Tersedia"],
        ["PRD003", "Gula Pasir", "Bahan Pokok", "kg", 17000, 99, 29, "Tersedia"],
        ["PRD004", "Telur", "Bahan Pokok", "kg", 29000, 173, 47, "Tersedia"],
        ["PRD005", "Mi Instan", "Makanan Instan", "bungkus", 3500, 88, 39, "Tersedia"],
        ["PRD006", "Kopi Sachet", "Minuman", "sachet", 1500, 110, 23, "Tersedia"],
        ["PRD007", "Teh Celup", "Minuman", "kotak", 8000, 72, 27, "Tersedia"],
        ["PRD008", "Susu UHT", "Susu", "kotak", 7000, 31, 16, "Tersedia"],
        ["PRD009", "Susu Bubuk", "Susu", "kotak", 28000, 66, 18, "Tersedia"],
        ["PRD010", "Biskuit", "Makanan Ringan", "bungkus", 10000, 106, 15, "Tersedia"],

        ["PRD011", "Wafer", "Makanan Ringan", "bungkus", 8000, 28, 11, "Tersedia"],
        ["PRD012", "Keripik Singkong", "Makanan Ringan", "bungkus", 10000, 57, 8, "Tersedia"],
        ["PRD013", "Kacang Tanah", "Makanan Ringan", "bungkus", 12000, 18, 13, "Tersedia"],
        ["PRD014", "Air Mineral", "Minuman", "botol", 4000, 54, 29, "Tersedia"],
        ["PRD015", "Sirup", "Minuman", "botol", 22000, 33, 6, "Tersedia"],
        ["PRD016", "Minuman Serbuk", "Minuman", "sachet", 1500, 18, 19, "Stok Rendah"],
        ["PRD017", "Sereal", "Sarapan", "kotak", 18000, 41, 5, "Tersedia"],
        ["PRD018", "Oatmeal", "Sarapan", "bungkus", 22000, 50, 15, "Tersedia"],
        ["PRD019", "Roti Tawar", "Makanan", "bungkus", 16000, 37, 17, "Tersedia"],
        ["PRD020", "Selai Cokelat", "Olesan", "botol", 18000, 36, 17, "Tersedia"],

        ["PRD021", "Selai Stroberi", "Olesan", "botol", 16000, 39, 14, "Tersedia"],
        ["PRD022", "Cokelat Batang", "Makanan Ringan", "batang", 6000, 22, 6, "Tersedia"],
        ["PRD023", "Permen", "Makanan Ringan", "bungkus", 5000, 21, 14, "Tersedia"],
        ["PRD024", "Madu", "Bahan Pangan", "botol", 30000, 11, 7, "Tersedia"],
        ["PRD025", "Sarden Kaleng", "Makanan Kaleng", "kaleng", 16000, 20, 9, "Tersedia"],
        ["PRD026", "Kornet Sapi", "Makanan Kaleng", "kaleng", 18000, 64, 17, "Tersedia"],
        ["PRD027", "Tepung Terigu", "Bahan Kue", "kg", 12000, 59, 16, "Tersedia"],
        ["PRD028", "Tepung Maizena", "Bahan Kue", "bungkus", 8000, 60, 14, "Tersedia"],
        ["PRD029", "Baking Powder", "Bahan Kue", "sachet", 3000, 24, 16, "Tersedia"],
        ["PRD030", "Vanili", "Bahan Kue", "sachet", 1500, 35, 20, "Tersedia"],

        ["PRD031", "Cokelat Bubuk", "Bahan Kue", "sachet", 7000, 59, 10, "Tersedia"],
        ["PRD032", "Santan Instan", "Bahan Masakan", "sachet", 5000, 41, 10, "Tersedia"],
        ["PRD033", "Kaldu Bubuk", "Bumbu Kemasan", "sachet", 1000, 19, 16, "Tersedia"],
        ["PRD034", "Merica Bubuk", "Bumbu Kemasan", "sachet", 2000, 57, 8, "Tersedia"],
        ["PRD035", "Ketumbar Bubuk", "Bumbu Kemasan", "sachet", 2000, 37, 8, "Tersedia"],
        ["PRD036", "Kunyit Bubuk", "Bumbu Kemasan", "sachet", 2000, 30, 16, "Tersedia"],
        ["PRD037", "Kecap Manis", "Bumbu Kemasan", "botol", 14000, 52, 16, "Tersedia"],
        ["PRD038", "Saus Sambal", "Bumbu Kemasan", "botol", 9000, 26, 5, "Tersedia"],
        ["PRD039", "Kecap Asin", "Bumbu Kemasan", "botol", 13000, 55, 13, "Tersedia"],
        ["PRD040", "Garam", "Bumbu Kemasan", "bungkus", 4000, 120, 25, "Tersedia"],

        ["PRD041", "Margarin", "Bahan Kue", "kemasan", 7000, 17, 18, "Stok Rendah"],
        ["PRD042", "Pasta Gigi", "Kebutuhan Rumah Tangga", "tube", 12000, 27, 16, "Tersedia"],
        ["PRD043", "Sikat Gigi", "Kebutuhan Rumah Tangga", "buah", 8000, 31, 15, "Tersedia"],
        ["PRD044", "Sabun Mandi", "Kebutuhan Rumah Tangga", "batang", 5000, 68, 27, "Tersedia"],
        ["PRD045", "Sampo Sachet", "Kebutuhan Rumah Tangga", "sachet", 1000, 39, 20, "Tersedia"],
        ["PRD046", "Deterjen", "Kebutuhan Rumah Tangga", "bungkus", 18000, 40, 18, "Tersedia"],
        ["PRD047", "Pelembut Pakaian", "Kebutuhan Rumah Tangga", "bungkus", 12000, 21, 9, "Tersedia"],
        ["PRD048", "Sabun Cuci Piring", "Kebutuhan Rumah Tangga", "botol", 10000, 50, 7, "Tersedia"],
        ["PRD049", "Pembersih Lantai", "Kebutuhan Rumah Tangga", "botol", 15000, 43, 13, "Tersedia"],
        ["PRD050", "Tisu", "Kebutuhan Rumah Tangga", "pak", 10000, 44, 20, "Tersedia"],

        ["PRD051", "Pembalut", "Kebutuhan Rumah Tangga", "pak", 12000, 39, 10, "Tersedia"],
        ["PRD052", "Popok Bayi", "Kebutuhan Rumah Tangga", "pak", 35000, 57, 9, "Tersedia"],
        ["PRD053", "Kantong Sampah", "Kebutuhan Rumah Tangga", "pak", 10000, 14, 11, "Tersedia"],
        ["PRD054", "Baterai AA", "Perlengkapan", "pak", 12000, 39, 12, "Tersedia"],
        ["PRD055", "Lilin", "Perlengkapan", "batang", 3000, 34, 6, "Tersedia"],
        ["PRD056", "Korek Api", "Perlengkapan", "buah", 2000, 65, 16, "Tersedia"],
        ["PRD057", "Plastik Kemasan", "Perlengkapan Toko", "pak", 8000, 39, 7, "Tersedia"],
        ["PRD058", "Aluminium Foil", "Perlengkapan Dapur", "roll", 15000, 20, 15, "Tersedia"],
        ["PRD059", "Kertas Minyak", "Perlengkapan Dapur", "pak", 5000, 16, 11, "Tersedia"],
        ["PRD060", "Tepung Panir", "Bahan Kue", "bungkus", 9000, 30, 13, "Tersedia"]

    ];

    // Mengubah data array menjadi objek produk

    const products = productData.map(function (item) {

        return {
            id: item[0],
            name: item[1],
            category: item[2],
            unit: item[3],
            price: item[4],
            stock: item[5],
            minimumStock: item[6],
            stockStatus: item[7]
        };

    });

    // Memastikan dataset berisi tepat 60 produk

    if (products.length !== 60) {
        console.error("Jumlah produk tidak sesuai:", products.length);
        return;
    }


    // 2. MENGAMBIL ELEMEN HTML

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
        console.error("Elemen transaksi POS tidak ditemukan.");
        return;
    }


    // 3. FORMAT RUPIAH

    function formatPOSRupiah(amount) {

        return "Rp " + Number(amount).toLocaleString("id-ID");

    }


    // 4. MENAMPILKAN 60 PRODUK KE TABEL

    function renderProducts(data) {

        productTableBody.replaceChildren();

        if (data.length === 0) {

            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 5;
            cell.textContent = "Produk tidak ditemukan.";

            row.appendChild(cell);
            productTableBody.appendChild(row);

            return;

        }

        data.forEach(function (product) {

            const row = document.createElement("tr");

            row.dataset.productId = product.id;
            row.dataset.productName = product.name;
            row.dataset.category = product.category;
            row.dataset.unit = product.unit;
            row.dataset.price = product.price;
            row.dataset.stock = product.stock;
            row.dataset.minimumStock = product.minimumStock;
            row.dataset.stockStatus = product.stockStatus;

            const idCell = document.createElement("td");

            const idText = document.createElement("strong");
            idText.textContent = product.id;

            idCell.appendChild(idText);

            const nameCell = document.createElement("td");

            nameCell.className = "product-name";
            nameCell.textContent = product.name + " (" + product.unit + ")";

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

    // Memuat seluruh produk saat halaman dibuka

    renderProducts(products);


    // 5. PENCARIAN PRODUK

    searchInput.addEventListener("input", function () {

        const keyword = this.value.trim().toLowerCase();

        const filteredProducts = products.filter(function (product) {

            return (
                product.id.toLowerCase().includes(keyword) ||
                product.name.toLowerCase().includes(keyword) ||
                product.category.toLowerCase().includes(keyword) ||
                product.unit.toLowerCase().includes(keyword)
            );

        });

        renderProducts(filteredProducts);

    });


    // 6. MENGHITUNG TOTAL KERANJANG

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

    }


    // 7. MEMBUAT BARIS KERANJANG

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

        const quantity = document.createElement("span");

        quantity.className = "qty-value";
        quantity.textContent = "1";

        const plusButton = document.createElement("button");

        plusButton.type = "button";
        plusButton.className = "qty-btn plus";
        plusButton.textContent = "+";

        qtyControl.append(
            minusButton,
            quantity,
            plusButton
        );

        const subtotal = document.createElement("b");

        subtotal.className = "cart-subtotal";

        subtotal.textContent =
            formatPOSRupiah(product.price);

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


    // 8. MENAMBAHKAN PRODUK KE KERANJANG

    productTableBody.addEventListener("click", function (event) {

        const addButton = event.target.closest(".add-item");

        if (!addButton) return;

        const productRow = addButton.closest("tr");

        if (!productRow) return;

        const productId = productRow.dataset.productId;

        const product = products.find(function (item) {
            return item.id === productId;
        });

        if (!product) {

            alert("Produk tidak ditemukan.");
            return;

        }

        if (product.stock <= 0) {

            alert("Stok produk habis.");
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

                window.arthaPopup.warning(
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

            cartItems.appendChild(createCartRow(product));

        }

        updateCartTotal();

    });


    // 9. MENGUBAH KUANTITAS DAN MENGHAPUS PRODUK

    cartItems.addEventListener("click", function (event) {

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

                window.arthaPopup.warning(
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

    // 10. MENGHAPUS SELURUH KERANJANG
    if (clearCartButton) {

        clearCartButton.addEventListener("click", async function () {

            const rows = cartItems.querySelectorAll(".cart-row");

            if (rows.length === 0) {

                window.ArthaPopup.info(
                    "Keranjang belanja masih kosong.",
                    {
                        title: "Informasi"
                    }
                );

                return;
            }

            const confirmation = await window.arthaPopup.confirm(
                "Apakah Anda yakin ingin menghapus seluruh produk dari keranjang belanja?",
                {
                    title: "Kosongkan Keranjang",
                    confirmText: "Ya, Hapus Semua",
                    cancelText: "Batal",
                    type: "warning"
                }
            );

            if (!confirmation) return;

            // Menghapus seluruh produk
            cartItems.replaceChildren();

            // Memperbarui total dan kondisi keranjang
            updateCartTotal();
        });

    }

    // 11. PROSES CHECKOUT

    if (checkoutButton) {

        checkoutButton.addEventListener("click", function (event) {

            const rows = cartItems.querySelectorAll(".cart-row");

            if (rows.length === 0) {

                event.preventDefault();

                alert(
                    "Keranjang masih kosong. Tambahkan produk terlebih dahulu."
                );

                return;

            }

            const items = [];

            let total = 0;

            let invalidData = false;

            rows.forEach(function (row) {

                const quantity = Number(
                    row.querySelector(".qty-value").textContent
                );

                const price = Number(row.dataset.unitPrice);

                const stock = Number(row.dataset.stock);

                const product = products.find(function (item) {

                    return item.id === row.dataset.productId;

                });

                if (
                    !product ||
                    !Number.isInteger(quantity) ||
                    quantity <= 0 ||
                    quantity > stock ||
                    !Number.isFinite(price) ||
                    price < 0
                ) {

                    invalidData = true;
                    return;

                }

                const subtotal = quantity * price;

                items.push({

                    id: product.id,

                    name: product.name,

                    category: product.category,

                    unit: product.unit,

                    price: price,

                    quantity: quantity,

                    subtotal: subtotal

                });

                total += subtotal;

            });

            if (invalidData || items.length !== rows.length) {

                event.preventDefault();

                alert(
                    "Data keranjang tidak valid. Periksa kembali produk."
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

            } catch (error) {

                event.preventDefault();

                alert("Data transaksi gagal disimpan.");

                console.error(error);

                return;

            }

        });

    }


    // 12. KONDISI AWAL

    cartItems.replaceChildren();

    updateCartTotal();

    console.log("Transaksi POS ARTHA berhasil dimuat.");
    console.log("Jumlah produk:", products.length);
    console.log("Keranjang awal: kosong");

});