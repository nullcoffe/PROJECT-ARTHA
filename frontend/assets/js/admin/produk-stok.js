document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    // =====================================================
    // ARTHA - PRODUCT & STOCK MANAGEMENT
    // =====================================================

    const API_BASE = new URL(
        "../../backend/api/",
        window.location.href
    );

    const ROWS_PER_PAGE = 5;

    // =====================================================
    // 1. DOM ELEMENTS
    // =====================================================

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

    const paginationInfo =
        document.getElementById("productPaginationInfo") ||
        document.querySelector(".product-pagination-info");

    const modeProduct = document.getElementById("mode-product");
    const modeStock = document.getElementById("mode-stock");

    const addProductButton =
        document.querySelector(".add-product-trigger");

    const stockAdjustButton =
        document.querySelector(".stock-adjust-trigger");

    const productTabs = document.querySelectorAll("[data-product-tab]");

    const activeProductCount =
        document.getElementById("activeProductCount");

    const inactiveProductCount =
        document.getElementById("inactiveProductCount");

    // =====================================================
    // 2. VALIDASI HTML
    // =====================================================

    const requiredElements = {
        productSearch,
        productTable,
        productForm,
        stockForm,
        productName,
        productCode,
        productUnit,
        productPrice,
        initialStock,
        minimumStock,
        stockProduct,
        currentStock,
        newStock,
        totalStock,
        currentPrice,
        newPrice,
        pagination,
        paginationInfo
    };

    const missingElements = Object.entries(requiredElements)
        .filter(([, element]) => !element)
        .map(([name]) => name);

    if (missingElements.length > 0) {
        console.error(
            "[ARTHA] Elemen HTML tidak ditemukan:",
            missingElements
        );
        return;
    }

    const tableBody =
        document.getElementById("productTableBody") ||
        productTable.querySelector("tbody.product-page-rows");

    const paginationControls = pagination.querySelector(
        ".product-pagination-controls"
    );

    const pageNumbers = pagination.querySelector(
        ".product-page-numbers"
    );

    if (!tableBody || !paginationControls || !pageNumbers) {
        console.error(
            "[ARTHA] Struktur tabel atau pagination tidak lengkap."
        );
        return;
    }

    productForm.noValidate = true;
    stockForm.noValidate = true;

    // =====================================================
    // 3. STATE
    // =====================================================

    let products = [];
    let inactiveProducts = [];
    let filteredProducts = [];

    let currentPage = 1;
    let currentTab = "active";

    let isLoading = false;
    let isSubmittingProduct = false;
    let isSubmittingStock = false;
    let isDeletingProduct = false;
    let isActivatingProduct = false;

    // =====================================================
    // 4. POPUP HELPER
    // =====================================================

    function getPopup() {
        return window.arthaPopup || null;
    }

    async function showMessage(type, message, title) {
        const popup = getPopup();

        if (popup && typeof popup[type] === "function") {
            return popup[type](message, {
                title: title || "ARTHA"
            });
        }

        window.alert(message);
    }

    async function askConfirmation(message, options = {}) {
        const popup = getPopup();

        if (popup && typeof popup.confirm === "function") {
            return popup.confirm(message, options);
        }

        return window.confirm(message);
    }

    // =====================================================
    // 5. API REQUEST
    // =====================================================

    async function apiRequest(endpoint, options = {}) {
        const url = new URL(
            String(endpoint).replace(/^\/+/, ""),
            API_BASE
        );

        const requestOptions = {
            method: options.method || "GET",
            credentials: "same-origin",
            headers: {
                Accept: "application/json"
            }
        };

        if (options.body !== undefined) {
            requestOptions.headers["Content-Type"] =
                "application/json";

            requestOptions.body = options.body;
        }

        const response = await fetch(url, requestOptions);

        let result;

        try {
            result = await response.json();
        } catch (error) {
            throw new Error(
                `Respons server tidak valid. HTTP ${response.status}`
            );
        }

        if (!response.ok || result.success === false) {
            throw new Error(
                result.message ||
                `Permintaan gagal. HTTP ${response.status}`
            );
        }

        return result;
    }

    function getResponseData(result) {
        if (!result || typeof result !== "object") {
            return null;
        }

        return result.data ?? result.payload ?? null;
    }

    // =====================================================
    // 6. FORMAT DATA
    // =====================================================

    function formatRupiah(value) {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }).format(Number(value) || 0);
    }

    function normalizeProduct(data) {
        return {
            id: Number(data.id_produk),
            code: String(data.kode_produk ?? ""),
            name: String(data.nama_produk ?? ""),
            unit: String(data.satuan ?? ""),
            price: Number(data.harga) || 0,
            stock: Number(data.stok) || 0,
            minimum: Number(data.stok_minimum) || 0
        };
    }

    function getStockStatus(stock, minimum) {
        if (stock <= 0) {
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

    // =====================================================
    // 7. LOAD PRODUK DARI DATABASE
    // =====================================================

    async function loadProducts() {
        if (isLoading) return false;

        isLoading = true;

        tableBody.replaceChildren();

        const loadingRow = document.createElement("tr");
        const loadingCell = document.createElement("td");

        loadingCell.colSpan = 6;
        loadingCell.textContent = "Memuat data produk...";
        loadingCell.style.textAlign = "center";

        loadingRow.appendChild(loadingCell);
        tableBody.appendChild(loadingRow);

        try {
            const [activeResult, inactiveResult] = await Promise.all([
                apiRequest("admin/products"),
                apiRequest("admin/products/inactive")
            ]);

            const activeData = getResponseData(activeResult);
            const inactiveData = getResponseData(inactiveResult);

            if (
                !Array.isArray(activeData) ||
                !Array.isArray(inactiveData)
            ) {
                throw new Error(
                    "Format data produk dari API tidak sesuai."
                );
            }

            products = activeData.map(normalizeProduct);
            inactiveProducts = inactiveData.map(normalizeProduct);

            updateProductCounts();
            updateFilteredProducts(false);
            updateStockOptions();

            console.info(
                `[ARTHA] ${products.length} produk aktif dan ${inactiveProducts.length} produk nonaktif berhasil dimuat.`
            );

            return true;

        } catch (error) {
            console.error(
                "[ARTHA] Gagal memuat produk:",
                error
            );

            tableBody.replaceChildren();

            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 6;
            cell.textContent = "Gagal memuat data produk.";
            cell.style.textAlign = "center";

            row.appendChild(cell);
            tableBody.appendChild(row);

            await showMessage(
                "error",
                error.message,
                "Gagal Memuat Produk"
            );

            return false;

        } finally {
            isLoading = false;
        }
    }

    // =====================================================
    // 8. TAB DAN JUMLAH PRODUK
    // =====================================================

    function updateProductCounts() {
        if (activeProductCount) {
            activeProductCount.textContent = products.length;
        }

        if (inactiveProductCount) {
            inactiveProductCount.textContent = inactiveProducts.length;
        }
    }

    function switchProductTab(tab) {
        if (!["active", "inactive"].includes(tab)) return;

        currentTab = tab;
        currentPage = 1;

        productTabs.forEach(button => {
            const selected =
                button.dataset.productTab === tab;

            button.classList.toggle("active", selected);
            button.setAttribute(
                "aria-selected",
                String(selected)
            );
        });

        productSearch.value = "";

        updateFilteredProducts();
    }

    productTabs.forEach(button => {
        button.addEventListener("click", function () {
            switchProductTab(button.dataset.productTab);
        });
    });

    // =====================================================
    // 9. MEMBUAT BARIS PRODUK
    // =====================================================

    function createProductRow(product) {
        const row = document.createElement("tr");
        row.dataset.id = product.id;

        const codeCell = document.createElement("td");
        codeCell.textContent = product.code;

        const nameCell = document.createElement("td");
        nameCell.textContent = product.name;

        const priceCell = document.createElement("td");
        priceCell.textContent = formatRupiah(product.price);

        const stockCell = document.createElement("td");
        stockCell.textContent =
            `${product.stock} ${product.unit}`;

        const statusCell = document.createElement("td");

        const status = getStockStatus(
            product.stock,
            product.minimum
        );

        const badge = document.createElement("span");
        badge.className = `stock-status ${status.className}`;
        badge.textContent = status.label;

        statusCell.appendChild(badge);

        const actionCell = document.createElement("td");
        actionCell.className = "product-action-cell";

        const button = document.createElement("button");
        button.type = "button";

        if (currentTab === "active") {
            button.className = "btn-delete-product";
            button.title = "Hapus produk";
            button.setAttribute(
                "aria-label",
                `Hapus ${product.name}`
            );

            const icon = document.createElement("img");
            icon.src = "../assets/icons/actions/delete.svg";
            icon.alt = "";

            icon.onerror = function () {
                icon.remove();
                button.textContent = "Hapus";
            };

            button.appendChild(icon);

        } else {
            button.className = "btn-activate-product";
            button.textContent = "Aktifkan Kembali";
            button.title = "Aktifkan kembali produk";
        }

        actionCell.appendChild(button);

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

    // =====================================================
    // 10. RENDER TABEL PRODUK
    // =====================================================

    function renderProducts() {
        const totalPages = Math.ceil(
            filteredProducts.length / ROWS_PER_PAGE
        );

        currentPage = Math.max(
            1,
            Math.min(currentPage, totalPages || 1)
        );

        tableBody.replaceChildren();
        tableBody.style.display = "table-row-group";

        const startIndex =
            (currentPage - 1) * ROWS_PER_PAGE;

        const visibleProducts = filteredProducts.slice(
            startIndex,
            startIndex + ROWS_PER_PAGE
        );

        if (visibleProducts.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 6;
            cell.textContent = currentTab === "inactive"
                ? "Belum ada produk nonaktif."
                : "Produk tidak ditemukan.";

            cell.style.textAlign = "center";

            row.appendChild(cell);
            tableBody.appendChild(row);

        } else {
            visibleProducts.forEach(product => {
                tableBody.appendChild(
                    createProductRow(product)
                );
            });
        }

        renderPagination(totalPages);
    }

    // =====================================================
    // 11. PAGINATION
    // =====================================================

    function renderPagination(totalPages) {
        paginationControls.replaceChildren();
        pageNumbers.replaceChildren();

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

        for (let page = 1; page <= totalPages; page++) {
            const button = document.createElement("button");

            button.type = "button";
            button.className = "product-page-number";
            button.textContent = page;

            if (page === currentPage) {
                button.classList.add("active");
                button.setAttribute("aria-current", "page");
            }

            button.addEventListener("click", function () {
                currentPage = page;
                renderProducts();
            });

            pageNumbers.appendChild(button);
        }

        const nextButton = document.createElement("button");

        nextButton.type = "button";
        nextButton.className = "product-next";
        nextButton.textContent = "›";

        nextButton.disabled =
            totalPages === 0 || currentPage >= totalPages;

        nextButton.addEventListener("click", function () {
            if (currentPage < totalPages) {
                currentPage++;
                renderProducts();
            }
        });

        paginationControls.appendChild(nextButton);

        const total = filteredProducts.length;

        const first = total === 0
            ? 0
            : (currentPage - 1) * ROWS_PER_PAGE + 1;

        const last = Math.min(
            currentPage * ROWS_PER_PAGE,
            total
        );

        paginationInfo.textContent =
            `Menampilkan ${first}-${last} dari ${total} produk`;
    }

    // =====================================================
    // 12. PENCARIAN PRODUK
    // =====================================================

    function updateFilteredProducts(resetPage = true) {
        const keyword = productSearch.value.trim().toLowerCase();

        const sourceProducts = currentTab === "active"
            ? products
            : inactiveProducts;

        filteredProducts = sourceProducts.filter(product => {
            return (
                product.name.toLowerCase().includes(keyword) ||
                product.code.toLowerCase().includes(keyword)
            );
        });

        if (resetPage) {
            currentPage = 1;
        }

        renderProducts();
    }

    productSearch.addEventListener("input", function () {
        updateFilteredProducts();
    });

    // =====================================================
    // 13. DROPDOWN PRODUK STOK
    // =====================================================

    function updateStockOptions() {
        const previousValue = stockProduct.value;

        stockProduct.replaceChildren();

        const defaultOption = document.createElement("option");

        defaultOption.value = "";
        defaultOption.textContent = "Pilih produk";
        defaultOption.disabled = true;
        defaultOption.selected = true;

        stockProduct.appendChild(defaultOption);

        products.forEach(product => {
            const option = document.createElement("option");

            option.value = product.id;
            option.textContent =
                `${product.code} - ${product.name}`;

            stockProduct.appendChild(option);
        });

        const exists = products.some(product =>
            String(product.id) === previousValue
        );

        stockProduct.value = exists ? previousValue : "";

        updateCurrentStock();
    }

    function getSelectedProduct() {
        return products.find(product =>
            product.id === Number(stockProduct.value)
        ) || null;
    }

    function updateCurrentStock() {
        const product = getSelectedProduct();

        if (!product) {
            currentStock.value = 0;
            currentPrice.value = 0;
            totalStock.value = 0;
            return;
        }

        currentStock.value = product.stock;
        currentPrice.value = product.price;

        totalStock.value =
            product.stock + (Number(newStock.value) || 0);
    }

    stockProduct.addEventListener("change", function () {
        newStock.value = "";
        newPrice.value = "";

        updateCurrentStock();
    });

    newStock.addEventListener("input", function () {
        const value = newStock.value;

        const valid =
            value === "" ||
            (
                Number.isInteger(Number(value)) &&
                Number(value) >= 0
            );

        newStock.setCustomValidity(
            valid
                ? ""
                : "Stok harus berupa bilangan bulat minimal 0."
        );

        updateCurrentStock();
    });

    newPrice.addEventListener("input", function () {
        const value = Number(newPrice.value);

        const valid =
            newPrice.value === "" ||
            (
                Number.isFinite(value) &&
                value >= 0
            );

        newPrice.setCustomValidity(
            valid ? "" : "Harga tidak boleh negatif."
        );
    });

    // =====================================================
    // 14. TAMBAH PRODUK
    // =====================================================

    productForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        if (isSubmittingProduct) return;

        const payload = {
            nama_produk: productName.value.trim(),
            kode_produk: productCode.value.trim().toUpperCase(),
            satuan: productUnit.value.trim(),
            harga: Number(productPrice.value),
            stok: Number(initialStock.value),
            stok_minimum: Number(minimumStock.value)
        };

        if (
            !payload.nama_produk ||
            !payload.kode_produk ||
            !payload.satuan
        ) {
            await showMessage(
                "warning",
                "Nama, kode, dan satuan produk wajib diisi.",
                "Data Belum Lengkap"
            );
            return;
        }

        if (
            productPrice.value === "" ||
            initialStock.value === "" ||
            minimumStock.value === "" ||
            !Number.isFinite(payload.harga) ||
            !Number.isFinite(payload.stok) ||
            !Number.isFinite(payload.stok_minimum) ||
            payload.harga < 0 ||
            payload.stok < 0 ||
            payload.stok_minimum < 0
        ) {
            await showMessage(
                "warning",
                "Harga dan stok harus diisi dengan angka valid dan tidak negatif.",
                "Input Tidak Valid"
            );
            return;
        }

        if (
            !Number.isInteger(payload.stok) ||
            !Number.isInteger(payload.stok_minimum)
        ) {
            await showMessage(
                "warning",
                "Stok dan stok minimum harus berupa bilangan bulat.",
                "Input Tidak Valid"
            );
            return;
        }

        // Kode produk harus unik, termasuk produk nonaktif.
        const duplicate = [...products, ...inactiveProducts].some(
            product =>
                product.code.toLowerCase() ===
                payload.kode_produk.toLowerCase()
        );

        if (duplicate) {
            await showMessage(
                "warning",
                "Kode produk sudah digunakan, termasuk oleh produk yang dinonaktifkan.",
                "Kode Produk Duplikat"
            );

            productCode.focus();
            return;
        }

        const submitButton = productForm.querySelector(
            'button[type="submit"]'
        );

        isSubmittingProduct = true;

        if (submitButton) {
            submitButton.disabled = true;
        }

        try {
            await apiRequest("admin/products", {
                method: "POST",
                body: JSON.stringify(payload)
            });

            productForm.reset();
            productSearch.value = "";

            switchProductTab("active");

            const loaded = await loadProducts();

            if (loaded) {
                currentPage = Math.max(
                    1,
                    Math.ceil(products.length / ROWS_PER_PAGE)
                );

                updateFilteredProducts(false);
            }

            await showMessage(
                "success",
                "Produk berhasil ditambahkan ke database.",
                "Produk Berhasil Ditambahkan"
            );

        } catch (error) {
            console.error(
                "[ARTHA] Tambah produk gagal:",
                error
            );

            await showMessage(
                "error",
                error.message,
                "Gagal Menambahkan Produk"
            );

        } finally {
            isSubmittingProduct = false;

            if (submitButton) {
                submitButton.disabled = false;
            }
        }
    });

    // =====================================================
    // 15. HYBRID DELETE PRODUK
    // =====================================================

    productTable.addEventListener("click", async function (event) {
        const button = event.target.closest(".btn-delete-product");

        if (!button || isDeletingProduct) return;

        const row = button.closest("tr");
        const productId = Number(row?.dataset.id);

        const product = products.find(item =>
            item.id === productId
        );

        if (!product) return;

        const confirmed = await askConfirmation(
            `Apakah Anda yakin ingin menghapus ${product.name} (${product.code})? Jika produk memiliki riwayat transaksi atau relasi database, produk akan dinonaktifkan agar riwayat tetap aman.`,
            {
                title: "Hapus Produk?",
                confirmText: "Ya, Hapus",
                cancelText: "Batal"
            }
        );

        if (!confirmed) return;

        isDeletingProduct = true;
        button.disabled = true;

        try {
            const result = await apiRequest(
                `admin/products/${product.id}`,
                {
                    method: "DELETE"
                }
            );

            const responseData = getResponseData(result);
            const action = responseData?.action;

            if (Number(stockProduct.value) === product.id) {
                stockForm.reset();
            }

            const loaded = await loadProducts();

            if (!loaded) {
                throw new Error(
                    "Penghapusan diproses, tetapi daftar produk gagal dimuat ulang."
                );
            }

            if (action === "deleted") {
                await showMessage(
                    "success",
                    "Produk berhasil dihapus permanen dari database.",
                    "Produk Berhasil Dihapus"
                );

            } else if (action === "deactivated") {
                await showMessage(
                    "success",
                    "Produk memiliki riwayat atau relasi. Produk berhasil dinonaktifkan dan riwayat tetap tersimpan.",
                    "Produk Berhasil Dinonaktifkan"
                );

            } else {
                await showMessage(
                    "success",
                    result.message ||
                    "Permintaan penghapusan berhasil diproses.",
                    "Penghapusan Produk"
                );
            }

        } catch (error) {
            console.error(
                "[ARTHA] Hapus produk gagal:",
                error
            );

            await showMessage(
                "error",
                error.message,
                "Gagal Menghapus Produk"
            );

        } finally {
            isDeletingProduct = false;
            button.disabled = false;
        }
    });

    // =====================================================
    // 16. AKTIVASI PRODUK NONAKTIF
    // =====================================================

    async function activateProduct(productId, button) {
        if (isActivatingProduct) return;

        const product = inactiveProducts.find(
            item => item.id === productId
        );

        if (!product) return;

        const confirmed = await askConfirmation(
            `Aktifkan kembali produk ${product.name} (${product.code})? Produk akan tersedia kembali untuk operasional.`,
            {
                title: "Aktifkan Produk?",
                confirmText: "Ya, Aktifkan",
                cancelText: "Batal"
            }
        );

        if (!confirmed) return;

        isActivatingProduct = true;

        if (button) {
            button.disabled = true;
        }

        try {
            await apiRequest(
                `admin/products/${productId}/activate`,
                {
                    method: "POST"
                }
            );

            const loaded = await loadProducts();

            if (!loaded) {
                throw new Error(
                    "Produk berhasil diaktifkan, tetapi daftar produk gagal diperbarui. Silakan muat ulang halaman."
                );
            }

            switchProductTab("active");

            await showMessage(
                "success",
                `${product.name} berhasil diaktifkan kembali.`,
                "Produk Berhasil Diaktifkan"
            );

        } catch (error) {
            console.error(
                "[ARTHA] Aktivasi produk gagal:",
                error
            );

            await showMessage(
                "error",
                error.message,
                "Gagal Mengaktifkan Produk"
            );

        } finally {
            isActivatingProduct = false;

            if (button) {
                button.disabled = false;
            }
        }
    }

    productTable.addEventListener("click", function (event) {
        const button = event.target.closest(
            ".btn-activate-product"
        );

        if (!button) return;

        const row = button.closest("tr");
        const productId = Number(row?.dataset.id);

        if (!productId) return;

        activateProduct(productId, button);
    });

    // =====================================================
    // 17. PENYESUAIAN STOK DAN HARGA
    // =====================================================

    stockForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        if (isSubmittingStock) return;

        const product = getSelectedProduct();

        if (!product) {
            await showMessage(
                "warning",
                "Silakan pilih produk terlebih dahulu.",
                "Produk Belum Dipilih"
            );
            return;
        }

        const stockInput = newStock.value.trim();
        const priceInput = newPrice.value.trim();

        if (stockInput === "" && priceInput === "") {
            await showMessage(
                "warning",
                "Masukkan jumlah stok tambahan atau harga baru.",
                "Tidak Ada Perubahan"
            );
            return;
        }

        let quantity = 0;
        let price = null;

        if (stockInput !== "") {
            quantity = Number(stockInput);

            if (
                !Number.isInteger(quantity) ||
                quantity < 0
            ) {
                await showMessage(
                    "warning",
                    "Jumlah stok harus berupa bilangan bulat minimal 0.",
                    "Jumlah Stok Tidak Valid"
                );
                return;
            }
        }

        if (priceInput !== "") {
            price = Number(priceInput);

            if (
                !Number.isFinite(price) ||
                price < 0
            ) {
                await showMessage(
                    "warning",
                    "Harga baru tidak valid.",
                    "Harga Tidak Valid"
                );
                return;
            }
        }

        const submitButton = stockForm.querySelector(
            'button[type="submit"]'
        );

        isSubmittingStock = true;

        if (submitButton) {
            submitButton.disabled = true;
        }

        try {
            const payload = {
                id_produk: product.id,
                jumlah_tambah: quantity,
                harga_baru: price
            };

            await apiRequest("admin/stock/adjust", {
                method: "POST",
                body: JSON.stringify(payload)
            });

            const loaded = await loadProducts();

            stockForm.reset();

            if (loaded) {
                updateStockOptions();
            }

            await showMessage(
                "success",
                "Penyesuaian stok dan/atau harga berhasil disimpan ke database.",
                "Penyesuaian Berhasil"
            );

        } catch (error) {
            console.error(
                "[ARTHA] Penyesuaian stok gagal:",
                error
            );

            await showMessage(
                "error",
                error.message,
                "Gagal Menyesuaikan Stok"
            );

        } finally {
            isSubmittingStock = false;

            if (submitButton) {
                submitButton.disabled = false;
            }
        }
    });

    // =====================================================
    // 18. NAVIGASI FORM
    // =====================================================

    if (addProductButton) {
        addProductButton.addEventListener("click", function () {
            if (modeProduct) {
                modeProduct.checked = true;
            }

            document.getElementById(
                "productFormPanel"
            )?.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        });
    }

    if (stockAdjustButton) {
        stockAdjustButton.addEventListener("click", function () {
            if (modeStock) {
                modeStock.checked = true;
            }

            document.getElementById(
                "stockFormPanel"
            )?.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        });
    }

    // =====================================================
    // 19. RESET FORM
    // =====================================================

    productForm.addEventListener("reset", function () {
        window.setTimeout(function () {
            minimumStock.value = 40;
        }, 0);
    });

    stockForm.addEventListener("reset", function () {
        window.setTimeout(function () {
            currentStock.value = 0;
            currentPrice.value = 0;
            totalStock.value = 0;

            newStock.value = "";
            newPrice.value = "";

            newStock.setCustomValidity("");
            newPrice.setCustomValidity("");
        }, 0);
    });

    // =====================================================
    // 20. INITIALIZATION
    // =====================================================

    loadProducts();

    console.info(
        "[ARTHA Produk & Stok] Database integration initialized."
    );

});