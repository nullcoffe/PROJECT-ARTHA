document.addEventListener("DOMContentLoaded", function () {

    // 1. DATA PRODUK ARTHA (60 PRODUK)

    const productData = [

        ["PRD001", "Beras", 15000, 0],
        ["PRD002", "Minyak Goreng", 18000, 172],
        ["PRD003", "Gula Pasir", 17000, 99],
        ["PRD004", "Telur", 29000, 173],
        ["PRD005", "Mi Instan", 3500, 88],
        ["PRD006", "Kopi Sachet", 1500, 110],
        ["PRD007", "Teh Celup", 8000, 72],
        ["PRD008", "Susu UHT", 7000, 31],
        ["PRD009", "Susu Bubuk", 28000, 66],
        ["PRD010", "Biskuit", 10000, 106],

        ["PRD011", "Wafer", 8000, 28],
        ["PRD012", "Keripik Singkong", 10000, 57],
        ["PRD013", "Kacang Tanah", 12000, 18],
        ["PRD014", "Air Mineral", 4000, 54],
        ["PRD015", "Sirup", 22000, 33],
        ["PRD016", "Minuman Serbuk", 1500, 18],
        ["PRD017", "Sereal", 18000, 41],
        ["PRD018", "Oatmeal", 22000, 50],
        ["PRD019", "Roti Tawar", 16000, 37],
        ["PRD020", "Selai Cokelat", 18000, 36],

        ["PRD021", "Selai Stroberi", 16000, 39],
        ["PRD022", "Cokelat Batang", 6000, 22],
        ["PRD023", "Permen", 5000, 21],
        ["PRD024", "Madu", 30000, 11],
        ["PRD025", "Sarden Kaleng", 16000, 20],
        ["PRD026", "Kornet Sapi", 18000, 64],
        ["PRD027", "Tepung Terigu", 12000, 59],
        ["PRD028", "Tepung Maizena", 8000, 60],
        ["PRD029", "Baking Powder", 3000, 24],
        ["PRD030", "Vanili", 1500, 35],

        ["PRD031", "Cokelat Bubuk", 7000, 59],
        ["PRD032", "Santan Instan", 5000, 41],
        ["PRD033", "Kaldu Bubuk", 1000, 19],
        ["PRD034", "Merica Bubuk", 2000, 57],
        ["PRD035", "Ketumbar Bubuk", 2000, 37],
        ["PRD036", "Kunyit Bubuk", 2000, 30],
        ["PRD037", "Kecap Manis", 14000, 52],
        ["PRD038", "Saus Sambal", 9000, 26],
        ["PRD039", "Kecap Asin", 13000, 55],
        ["PRD040", "Garam", 4000, 120],

        ["PRD041", "Margarin", 7000, 17],
        ["PRD042", "Pasta Gigi", 12000, 27],
        ["PRD043", "Sikat Gigi", 8000, 31],
        ["PRD044", "Sabun Mandi", 5000, 68],
        ["PRD045", "Sampo Sachet", 1000, 39],
        ["PRD046", "Deterjen", 18000, 40],
        ["PRD047", "Pelembut Pakaian", 12000, 21],
        ["PRD048", "Sabun Cuci Piring", 10000, 50],
        ["PRD049", "Pembersih Lantai", 15000, 43],
        ["PRD050", "Tisu", 10000, 44],

        ["PRD051", "Pembalut", 12000, 39],
        ["PRD052", "Popok Bayi", 35000, 57],
        ["PRD053", "Kantong Sampah", 10000, 14],
        ["PRD054", "Baterai AA", 12000, 39],
        ["PRD055", "Lilin", 3000, 34],
        ["PRD056", "Korek Api", 2000, 65],
        ["PRD057", "Plastik Kemasan", 8000, 39],
        ["PRD058", "Aluminium Foil", 15000, 20],
        ["PRD059", "Kertas Minyak", 5000, 16],
        ["PRD060", "Tepung Panir", 9000, 30]

    ];


    // 2. MENENTUKAN STATUS STOK

    function getStockStatus(stock) {

        if (stock === 0) {

            return "empty";

        }

        if (stock <= 40) {

            return "low";

        }

        return "safe";

    }


    // 3. MEMBENTUK OBJEK PRODUK

    const products = productData.map(function (item) {

        return {

            id: item[0],

            name: item[1],

            price: item[2],

            stock: item[3],

            status: getStockStatus(item[3])

        };

    });


    // 4. VALIDASI DATA PRODUK

    if (products.length !== 60) {

        console.error(
            "Jumlah produk tidak sesuai:",
            products.length
        );

        return;

    }


    // 5. MENGAMBIL ELEMEN HTML

    const searchForm = document.querySelector(".stock-search");

    const searchInput = document.getElementById("stockSearch");

    const statusFilter = document.getElementById("stockStatusFilter");

    const tableBody = document.getElementById("stockTableBody");


    // 6. VALIDASI ELEMEN HTML

    if (!searchInput || !statusFilter || !tableBody) {

        console.error(
            "Elemen halaman Cek Stok tidak ditemukan."
        );

        return;

    }


    // 7. FORMAT RUPIAH

    function formatRupiah(value) {

        return "Rp " + Number(value).toLocaleString("id-ID");

    }


    // 8. MENENTUKAN LABEL STATUS

    function getStatusLabel(status) {

        const labels = {

            safe: "Aman",

            low: "Stok rendah",

            empty: "Habis"

        };

        return labels[status];

    }


    // 9. MENENTUKAN CLASS STATUS

    function getStatusClass(status) {

        const classes = {

            safe: "stock-safe",

            low: "stock-low",

            empty: "stock-empty"

        };

        return classes[status];

    }


    // 10. MEMBUAT BARIS PRODUK

    function createProductRow(product) {

        const row = document.createElement("tr");


        // ID PRODUK

        const idCell = document.createElement("td");

        idCell.textContent = product.id;


        // NAMA PRODUK

        const nameCell = document.createElement("td");

        nameCell.textContent = product.name;


        // HARGA PRODUK

        const priceCell = document.createElement("td");

        priceCell.textContent = formatRupiah(product.price);


        // JUMLAH STOK

        const stockCell = document.createElement("td");

        const stockValue = document.createElement("strong");

        stockValue.textContent = product.stock;

        stockCell.appendChild(stockValue);


        // STATUS PRODUK

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


    // 11. MENAMPILKAN DATA PRODUK

    function renderProducts(data) {

        tableBody.replaceChildren();


        // KONDISI JIKA PRODUK TIDAK DITEMUKAN

        if (data.length === 0) {

            const emptyRow = document.createElement("tr");

            const emptyCell = document.createElement("td");

            emptyCell.colSpan = 5;

            emptyCell.textContent = "Produk tidak ditemukan.";

            emptyCell.style.textAlign = "center";

            emptyCell.style.padding = "24px";

            emptyRow.appendChild(emptyCell);

            tableBody.appendChild(emptyRow);

            return;

        }


        // MEMBUAT FRAGMENT TABEL

        const fragment = document.createDocumentFragment();

        data.forEach(function (product) {

            fragment.appendChild(
                createProductRow(product)
            );

        });

        tableBody.appendChild(fragment);

    }


    // 12. FUNGSI PENCARIAN DAN FILTER

    function filterProducts() {

        const keyword = searchInput.value

            .trim()

            .toLowerCase();


        const selectedStatus = statusFilter.value;


        // NORMALISASI PENCARIAN ANGKA

        const numericKeyword = keyword.replace(/\D/g, "");


        // MENYARING DATA PRODUK

        const filteredProducts = products.filter(function (product) {


            // DATA YANG DAPAT DICARI

            const searchableText = [

                product.id,

                product.name,

                formatRupiah(product.price),

                String(product.price),

                String(product.stock)

            ].join(" ").toLowerCase();


            // PENCARIAN TEKS

            const matchesText =

                searchableText.includes(keyword);


            // PENCARIAN ANGKA

            const matchesNumber = numericKeyword !== "" && [

                String(product.price),

                String(product.stock)

            ].some(function (value) {

                return value.includes(numericKeyword);

            });


            // FILTER STATUS

            const matchesStatus =

                selectedStatus === "all" ||

                product.status === selectedStatus;


            return (

                (matchesText || matchesNumber) &&

                matchesStatus

            );

        });


        // MENAMPILKAN HASIL FILTER

        renderProducts(filteredProducts);


        // INFORMASI CONSOLE

        console.log("Pencarian diperbarui.");

        console.log("Kata kunci:", keyword || "-");

        console.log("Filter status:", selectedStatus);

        console.log(
            "Produk ditemukan:",
            filteredProducts.length
        );

    }


    // 13. EVENT PENCARIAN

    searchInput.addEventListener("input", function () {

        filterProducts();

    });


    // 14. EVENT FILTER STATUS

    statusFilter.addEventListener("change", function () {

        filterProducts();

    });


    // 15. MENCEGAH RELOAD FORM

    if (searchForm) {

        searchForm.addEventListener("submit", function (event) {

            event.preventDefault();

            filterProducts();

        });

    }


    // 16. MEMBACA QUERY URL

    const urlParams = new URLSearchParams(
        window.location.search
    );

    const initialKeyword = urlParams.get("q");

    if (initialKeyword) {

        searchInput.value = initialKeyword;

    }


    // 17. INISIALISASI HALAMAN

    filterProducts();


    // 18. INFORMASI DATA PADA CONSOLE

    console.log("Cek Stok ARTHA berhasil dimuat.");

    console.log("Total produk:", products.length);

    console.log(

        "Produk Aman:",

        products.filter(function (product) {

            return product.status === "safe";

        }).length

    );

    console.log(

        "Produk Stok Rendah:",

        products.filter(function (product) {

            return product.status === "low";

        }).length

    );

    console.log(
        "Produk Habis:",
        products.filter(function (product) {
            return product.status === "empty";
        }).length
    );
});