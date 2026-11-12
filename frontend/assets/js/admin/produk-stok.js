
document.addEventListener("DOMContentLoaded", function () {

    // MENGAMBIL ELEMEN HTML
    const productSearch = document.getElementById("productSearch");
    const productTable = document.querySelector(".product-table");
    const productForm = document.getElementById("productForm");
    const stockForm = document.getElementById("stockForm");

    const productName = document.getElementById("productName");
    const productCode = document.getElementById("productCode");
    const productUnit = document.getElementById("productUnit");
    const productPrice = document.getElementById("productPrice");
    const initialStock = document.getElementById("productInitialStock");
    const minimumStock = document.getElementById("productMinimumStock");

    const stockProduct = document.getElementById("stockProduct");
    const currentStock = document.getElementById("currentStock");
    const newStock = document.getElementById("newStock");
    const totalStock = document.getElementById("totalStock");
    const currentPrice = document.getElementById("currentPrice");
    const newPrice = document.getElementById("newPrice");

    const pagination = document.querySelector(".product-pagination");
    const paginationInfo = document.querySelector(".product-pagination-info");

    const modeProduct = document.getElementById("mode-product");
    const modeStock = document.getElementById("mode-stock");

    const addProductButton = document.querySelector(".add-product-trigger");
    const stockAdjustButton = document.querySelector(".stock-adjust-trigger");

    // MENGAMBIL CUSTOM POPUP ARTHA
    function getPopup() {
        if (!window.arthaPopup) {
            console.error("Custom Popup ARTHA belum tersedia. Periksa pemanggilan popup.js.");
            return null;
        }

        return window.arthaPopup;
    }

    // MEMERIKSA KETERSEDIAAN ELEMEN UTAMA
    if (
        !productTable ||
        !productForm ||
        !stockForm ||
        !productSearch ||
        !pagination ||
        !paginationInfo ||
        !productName ||
        !productCode ||
        !productUnit ||
        !productPrice ||
        !initialStock ||
        !minimumStock ||
        !stockProduct ||
        !currentStock ||
        !currentPrice ||
        !newPrice ||
        !newStock ||
        !totalStock
    ) {
        console.error("Elemen produk dan stok tidak ditemukan.");
        return;
    }

    // MENONAKTIFKAN VALIDASI BAWAAN BROWSER
    productForm.noValidate = true;
    stockForm.noValidate = true;

    // MENENTUKAN JUMLAH PRODUK DALAM SATU HALAMAN
    const rowsPerPage = 5;

    let currentPage = 1;
    let products = [];
    let filteredProducts = [];
    let pageBodies = [];

    // MENGAMBIL ELEMEN PAGINATION
    const paginationControls = pagination.querySelector(".product-pagination-controls");
    const pageNumbers = pagination.querySelector(".product-page-numbers");

    // MENGUBAH FORMAT ANGKA MENJADI RUPIAH
    function formatRupiah(value) {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }).format(value);
    }

    // MENENTUKAN STATUS STOK BERDASARKAN BATAS MINIMUM
    function getStockStatus(stock, minimum) {
        if (stock === 0) {
            return {
                label: "Stok Habis",
                className: "empty"
            };
        }

        if (stock <= minimum) {
            return {
                label: "Stok Rendah",
                className: "low"
            };
        }

        return {
            label: "Stok Aman",
            className: "safe"
        };
    }

    // MENGAMBIL SELURUH DATA PRODUK AWAL DARI HTML
    function loadInitialProducts() {
        const rows = productTable.querySelectorAll("tbody.product-page-rows tr");

        products = Array.from(rows)
            .filter(function (row) {
                return row.cells.length >= 4;
            })
            .map(function (row) {
                const cells = row.cells;

                return {
                    code: cells[0].textContent.trim(),
                    name: cells[1].textContent.trim(),
                    price: Number(cells[2].textContent.replace(/[^\d]/g, "")) || 0,
                    stock: Number(cells[3].textContent.trim()) || 0,
                    minimum: Number(row.dataset.minimum) || 40,
                    unit: row.dataset.unit || ""
                };
            });

        filteredProducts = [...products];
    }

    // MEMBUAT BARIS PRODUK PADA TABEL
    function createProductRow(product) {
        const row = document.createElement("tr");

        row.dataset.minimum = product.minimum;
        row.dataset.unit = product.unit;

        const codeCell = document.createElement("td");
        codeCell.textContent = product.code;

        const nameCell = document.createElement("td");
        nameCell.textContent = product.name;

        const priceCell = document.createElement("td");
        priceCell.textContent = formatRupiah(product.price);

        const stockCell = document.createElement("td");
        stockCell.textContent = product.stock;

        const statusCell = document.createElement("td");

        const status = getStockStatus(
            product.stock,
            product.minimum
        );

        const statusBadge = document.createElement("span");
        statusBadge.className = `stock-status ${status.className}`;
        statusBadge.textContent = status.label;

        statusCell.appendChild(statusBadge);

        // MEMBUAT TOMBOL HAPUS PRODUK
        const actionCell = document.createElement("td");
        actionCell.className = "product-action-cell";

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "btn-delete-product";
        deleteButton.title = "Hapus produk";
        deleteButton.setAttribute("aria-label", "Hapus produk");

        const deleteIcon = document.createElement("img");
        deleteIcon.src = "../assets/icons/actions/delete.svg";
        deleteIcon.alt = "";

        deleteButton.appendChild(deleteIcon);
        actionCell.appendChild(deleteButton);

        row.append(
            codeCell,
            nameCell,
            priceCell,
            stockCell,
            statusCell,
            actionCell
        );

        return row;
    }

    // MENYIAPKAN KELOMPOK TABEL SESUAI JUMLAH HALAMAN
    function preparePageBodies(totalPages) {
        const requiredPages = Math.max(totalPages, 1);

        pageBodies = Array.from(
            productTable.querySelectorAll("tbody.product-page-rows")
        ).sort(function (a, b) {
            const pageA = Number(
                a.className.match(/product-page-rows-(\d+)/)?.[1] || 0
            );

            const pageB = Number(
                b.className.match(/product-page-rows-(\d+)/)?.[1] || 0
            );

            return pageA - pageB;
        });

        // MEMBUAT KELOMPOK TABEL BARU JIKA HALAMAN BERTAMBAH
        while (pageBodies.length < requiredPages) {
            const tbody = document.createElement("tbody");
            tbody.className = "product-page-rows";
            productTable.appendChild(tbody);
            pageBodies.push(tbody);
        }

        // MENGHAPUS KELOMPOK TABEL YANG TIDAK DIPERLUKAN
        while (pageBodies.length > requiredPages) {
            const tbody = pageBodies.pop();
            tbody.remove();
        }

        // MEMBERIKAN IDENTITAS HALAMAN PADA SETIAP KELOMPOK TABEL
        pageBodies.forEach(function (tbody, index) {
            tbody.className = `product-page-rows product-page-rows-${index + 1}`;
        });
    }

    // MENAMPILKAN PRODUK SESUAI HALAMAN YANG DIPILIH
    function renderProducts() {
        const totalPages = Math.ceil(filteredProducts.length / rowsPerPage);

        currentPage = totalPages === 0
            ? 1
            : Math.min(currentPage, totalPages);

        preparePageBodies(totalPages);

        // MENGISI SETIAP KELOMPOK TABEL
        pageBodies.forEach(function (tbody, index) {
            const pageNumber = index + 1;
            const startIndex = index * rowsPerPage;

            const pageProducts = filteredProducts.slice(
                startIndex,
                startIndex + rowsPerPage
            );

            tbody.replaceChildren();

            // MENAMBAHKAN PRODUK KE KELOMPOK HALAMAN
            pageProducts.forEach(function (product) {
                tbody.appendChild(createProductRow(product));
            });

            // MENAMPILKAN PESAN JIKA PRODUK TIDAK DITEMUKAN
            if (pageNumber === 1 && filteredProducts.length === 0) {
                const row = document.createElement("tr");
                const cell = document.createElement("td");

                cell.colSpan = 6;
                cell.textContent = "Produk tidak ditemukan.";
                cell.style.textAlign = "center";

                row.appendChild(cell);
                tbody.appendChild(row);
            }

            // MENGATUR KELOMPOK TABEL YANG SEDANG DITAMPILKAN
            tbody.style.display = pageNumber === currentPage
                ? "table-row-group"
                : "none";
        });

        // MENYESUAIKAN RADIO BUTTON HTML BAWAAN
        document.querySelectorAll('input[name="product-page"]').forEach(function (radio) {
            const pageNumber = Number(
                radio.id.replace("product-page-", "")
            );

            radio.checked = pageNumber === currentPage;
        });

        renderPagination(totalPages);
    }

    // MEMBUAT PAGINATION SESUAI JUMLAH HALAMAN
    function renderPagination(totalPages) {
        if (!paginationControls || !pageNumbers) {
            console.error("Elemen pagination tidak ditemukan.");
            return;
        }

        paginationControls.replaceChildren();
        pageNumbers.replaceChildren();

        // MEMBUAT TOMBOL HALAMAN SEBELUMNYA
        const previousButton = document.createElement("button");
        previousButton.type = "button";
        previousButton.className = "product-prev";
        previousButton.textContent = "‹";
        previousButton.disabled = currentPage <= 1;

        previousButton.addEventListener("click", function () {
            if (currentPage > 1) {
                currentPage--;
                renderProducts();
            }
        });

        paginationControls.appendChild(previousButton);

        // MEMBUAT NOMOR HALAMAN SECARA DINAMIS
        for (let page = 1; page <= totalPages; page++) {
            const button = document.createElement("button");

            button.type = "button";
            button.className = "product-page-number";
            button.textContent = page;

            if (page === currentPage) {
                button.style.color = "#FFFFFF";
                button.style.backgroundColor = "var(--color-primary)";
                button.style.borderColor = "var(--color-primary)";
                button.setAttribute("aria-current", "page");
            }

            button.addEventListener("click", function () {
                currentPage = page;
                renderProducts();
            });

            pageNumbers.appendChild(button);
        }

        // MEMBUAT TOMBOL HALAMAN BERIKUTNYA
        const nextButton = document.createElement("button");
        nextButton.type = "button";
        nextButton.className = "product-next";
        nextButton.textContent = "›";
        nextButton.disabled = currentPage >= totalPages;

        nextButton.addEventListener("click", function () {
            if (currentPage < totalPages) {
                currentPage++;
                renderProducts();
            }
        });

        paginationControls.appendChild(nextButton);

        // MEMPERBARUI INFORMASI JUMLAH PRODUK
        const total = filteredProducts.length;

        const firstItem = total === 0
            ? 0
            : (currentPage - 1) * rowsPerPage + 1;

        const lastItem = Math.min(
            currentPage * rowsPerPage,
            total
        );

        paginationInfo.textContent =
            `Menampilkan ${firstItem}-${lastItem} dari ${total} produk`;
    }

    // MEMPERBARUI PILIHAN PRODUK PADA FORM STOK
    function updateStockOptions() {
        const previousValue = stockProduct.value;

        stockProduct.replaceChildren();

        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Pilih";
        defaultOption.disabled = true;
        defaultOption.selected = true;

        stockProduct.appendChild(defaultOption);

        products.forEach(function (product) {
            const option = document.createElement("option");

            option.value = product.code;
            option.textContent = product.name;

            stockProduct.appendChild(option);
        });

        if (products.some(function (product) {
            return product.code === previousValue;
        })) {
            stockProduct.value = previousValue;
        }
    }

    // MEMPERBARUI INFORMASI STOK DAN HARGA BERDASARKAN PRODUK YANG DIPILIH
    function updateCurrentStock() {
        const selectedProduct = products.find(function (product) {
            return product.code === stockProduct.value;
        });

        if (!selectedProduct) {
            currentStock.value = 0;
            currentPrice.value = 0;
            totalStock.value = 0;
            return;
        }

        currentStock.value = selectedProduct.stock;
        currentPrice.value = selectedProduct.price;

        const addedStock = Number(newStock.value) || 0;

        totalStock.value = selectedProduct.stock + addedStock;
    }

    // MEMPERBARUI HASIL PENCARIAN PRODUK
    function updateFilteredProducts() {
        const keyword = productSearch.value.trim().toLowerCase();

        filteredProducts = products.filter(function (product) {
            return (
                product.name.toLowerCase().includes(keyword) ||
                product.code.toLowerCase().includes(keyword)
            );
        });

        currentPage = Math.min(
            currentPage,
            Math.max(1, Math.ceil(filteredProducts.length / rowsPerPage))
        );

        renderProducts();
    }

    // MENANGANI KLIK TOMBOL HAPUS PRODUK
    productTable.addEventListener("click", async function (event) {
        const deleteButton = event.target.closest(".btn-delete-product");

        if (!deleteButton) return;

        const row = deleteButton.closest("tr");
        if (!row) return;

        const productCode = row.cells[0].textContent.trim();

        const selectedProduct = products.find(function (product) {
            return product.code === productCode;
        });

        if (!selectedProduct) return;

        const popup = getPopup();
        if (!popup) return;

        // MEMINTA KONFIRMASI SEBELUM MENGHAPUS PRODUK
        const confirmation = await popup.confirm(
            `Apakah Anda yakin ingin menghapus produk ${selectedProduct.name} (${selectedProduct.code})?`,
            {
                title: "Hapus Produk?",
                confirmText: "Ya, Hapus",
                cancelText: "Batal"
            }
        );

        if (!confirmation) return;

        // MENGHAPUS PRODUK DARI DAFTAR
        products = products.filter(function (product) {
            return product.code !== productCode;
        });

        // MENGATUR ULANG FORM JIKA PRODUK YANG DIHAPUS SEDANG DIPILIH
        if (stockProduct.value === productCode) {
            stockForm.reset();
            currentStock.value = 0;
            currentPrice.value = 0;
            totalStock.value = 0;
        }

        // MEMPERBARUI PILIHAN PRODUK, TABEL, DAN PAGINATION
        updateStockOptions();
        updateFilteredProducts();

        // MENAMPILKAN NOTIFIKASI BERHASIL
        await popup.success("Produk berhasil dihapus.", {
            title: "Produk Berhasil Dihapus"
        });
    });

    // MENCARI PRODUK DARI SELURUH HALAMAN
    productSearch.addEventListener("input", function () {
        currentPage = 1;
        updateFilteredProducts();
    });

    // MEMBUKA PANEL TAMBAH PRODUK
    addProductButton?.addEventListener("click", function () {
        if (modeProduct) {
            modeProduct.checked = true;
        }

        document.getElementById("productFormPanel")?.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    });

    // MEMBUKA PANEL PENYESUAIAN STOK
    stockAdjustButton?.addEventListener("click", function () {
        if (modeStock) {
            modeStock.checked = true;
        }

        document.getElementById("stockFormPanel")?.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    });

    // MEMVALIDASI DAN MENYIMPAN PRODUK BARU
    productForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const popup = getPopup();
        if (!popup) return;

        const newProduct = {
            name: productName.value.trim(),
            code: productCode.value.trim().toUpperCase(),
            unit: productUnit.value.trim(),
            price: Number(productPrice.value),
            stock: Number(initialStock.value),
            minimum: Number(minimumStock.value)
        };

        // MEMERIKSA KELENGKAPAN DATA
        if (!newProduct.name || !newProduct.code || !newProduct.unit) {
            await popup.warning("Semua data produk wajib diisi.");
            return;
        }

        // MEMERIKSA KODE PRODUK DUPLIKAT
        const duplicateCode = products.some(function (product) {
            return product.code.toLowerCase() === newProduct.code.toLowerCase();
        });

        if (duplicateCode) {
            await popup.warning("Kode produk sudah digunakan.", {
                title: "Kode Produk Duplikat"
            });

            productCode.focus();
            return;
        }

        // MEMERIKSA NILAI NUMERIK
        if (
            productPrice.value.trim() === "" ||
            initialStock.value.trim() === "" ||
            minimumStock.value.trim() === "" ||
            !Number.isFinite(newProduct.price) ||
            !Number.isFinite(newProduct.stock) ||
            !Number.isFinite(newProduct.minimum) ||
            newProduct.price < 0 ||
            newProduct.stock < 0 ||
            newProduct.minimum < 0
        ) {
            await popup.warning(
                "Harga, stok awal, dan batas minimum harus diisi dengan angka yang valid."
            );

            return;
        }

        // MEMERIKSA STOK DAN BATAS MINIMUM
        if (
            !Number.isInteger(newProduct.stock) ||
            !Number.isInteger(newProduct.minimum)
        ) {
            await popup.warning(
                "Stok awal dan batas minimum harus berupa bilangan bulat."
            );

            return;
        }

        // MENAMBAHKAN PRODUK KE DAFTAR
        products.push(newProduct);

        productSearch.value = "";
        filteredProducts = [...products];

        currentPage = Math.ceil(filteredProducts.length / rowsPerPage);

        updateStockOptions();
        renderProducts();

        productForm.reset();

        // MENAMPILKAN NOTIFIKASI BERHASIL
        await popup.success("Produk berhasil ditambahkan.", {
            title: "Produk Berhasil Ditambahkan"
        });
    });

    // MENANGANI PERPINDAHAN MELALUI RADIO BUTTON HTML
    document.querySelectorAll('input[name="product-page"]').forEach(function (radio) {
        radio.addEventListener("change", function () {
            if (!radio.checked) return;

            currentPage = Number(
                radio.id.replace("product-page-", "")
            );

            renderProducts();
        });
    });

    // MEMPERBARUI DATA STOK DAN HARGA KETIKA PRODUK DIPILIH
    stockProduct.addEventListener("change", function () {
        newStock.value = "";
        newPrice.value = "";

        newStock.setCustomValidity("");
        newPrice.setCustomValidity("");

        updateCurrentStock();
    });

    // MENGHITUNG TOTAL STOK KETIKA JUMLAH STOK BARU BERUBAH
    newStock.addEventListener("input", function () {
        const quantity = Number(newStock.value);

        if (
            newStock.value !== "" &&
            (!Number.isInteger(quantity) || quantity < 0)
        ) {
            newStock.setCustomValidity(
                "Stok baru harus berupa bilangan bulat minimal 0."
            );
        } else {
            newStock.setCustomValidity("");
        }

        updateCurrentStock();
    });

    // MEMVALIDASI HARGA BARU
    newPrice.addEventListener("input", function () {
        const price = Number(newPrice.value);

        if (
            newPrice.value !== "" &&
            (!Number.isFinite(price) || price < 0)
        ) {
            newPrice.setCustomValidity(
                "Harga baru tidak boleh negatif."
            );
        } else {
            newPrice.setCustomValidity("");
        }
    });

    // MEMPROSES PERUBAHAN STOK DAN HARGA PRODUK
    stockForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const popup = getPopup();
        if (!popup) return;

        const selectedProduct = products.find(function (product) {
            return product.code === stockProduct.value;
        });

        // MEMERIKSA PRODUK YANG DIPILIH
        if (!selectedProduct) {
            await popup.warning(
                "Silakan pilih produk terlebih dahulu."
            );

            stockProduct.focus();
            return;
        }

        const stockInput = newStock.value.trim();
        const priceInput = newPrice.value.trim();

        // MEMERIKSA INPUT PENYESUAIAN
        if (stockInput === "" && priceInput === "") {
            await popup.warning(
                "Masukkan stok baru atau harga baru yang ingin diubah."
            );

            newStock.focus();
            return;
        }

        let addedStock = 0;
        let updatedPrice = selectedProduct.price;

        // MEMVALIDASI JUMLAH STOK YANG DITAMBAHKAN
        if (stockInput !== "") {
            addedStock = Number(stockInput);

            if (!Number.isInteger(addedStock) || addedStock < 0) {
                await popup.warning(
                    "Stok baru harus berupa bilangan bulat minimal 0."
                );

                newStock.focus();
                return;
            }
        }

        // MEMVALIDASI HARGA BARU
        if (priceInput !== "") {
            updatedPrice = Number(priceInput);

            if (!Number.isFinite(updatedPrice) || updatedPrice < 0) {
                await popup.warning(
                    "Harga baru tidak boleh negatif."
                );

                newPrice.focus();
                return;
            }
        }

        // MEMPERBARUI STOK DAN HARGA PRODUK
        selectedProduct.stock += addedStock;
        selectedProduct.price = updatedPrice;

        // MEMPERBARUI TAMPILAN STOK DAN HARGA
        currentStock.value = selectedProduct.stock;
        currentPrice.value = selectedProduct.price;
        totalStock.value = selectedProduct.stock;

        // MEMPERBARUI TABEL DAN HASIL PENCARIAN
        updateFilteredProducts();

        // MENGATUR ULANG FORM SETELAH PENYIMPANAN
        stockForm.reset();

        // MENAMPILKAN NOTIFIKASI BERHASIL
        await popup.success(
            "Penyesuaian stok dan harga berhasil disimpan.",
            {
                title: "Penyesuaian Berhasil"
            }
        );
    });

    // MENGATUR ULANG FORM PRODUK
    productForm.addEventListener("reset", function () {
        setTimeout(function () {
            minimumStock.value = 40;
        }, 0);
    });

    // MENGATUR ULANG FORM PENYESUAIAN STOK DAN HARGA
    stockForm.addEventListener("reset", function () {
        setTimeout(function () {
            currentStock.value = 0;
            currentPrice.value = 0;
            totalStock.value = 0;

            newStock.value = "";
            newPrice.value = "";

            newStock.setCustomValidity("");
            newPrice.setCustomValidity("");
        }, 0);
    });

    // MEMUAT DATA AWAL DAN MENAMPILKAN PRODUK
    loadInitialProducts();
    updateStockOptions();
    renderProducts();

    console.log("Manajemen Produk dan Stok berhasil dijalankan.");

});
