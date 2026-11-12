document.addEventListener("DOMContentLoaded", function () {

    // 1. KONFIGURASI POPUP
    const popupConfig = {

        info: {
            title: "Informasi",
            confirmText: "Mengerti"
        },

        success: {
            title: "Berhasil!",
            confirmText: "Mengerti"
        },

        warning: {
            title: "Perhatian!",
            confirmText: "Mengerti"
        },

        error: {
            title: "Terjadi Kesalahan",
            confirmText: "Mengerti"
        },

        confirm: {
            title: "Konfirmasi",
            confirmText: "Ya, Lanjutkan",
            cancelText: "Batal"
        }

    };

    // 2. MEMBUAT ELEMEN POPUP
    const overlay = document.createElement("div");

    overlay.className = "notification-popup-overlay";

    overlay.innerHTML = `
        <section
            class="notification-popup"
            role="dialog"
            aria-modal="true"
            aria-labelledby="notificationPopupTitle"
            aria-describedby="notificationPopupMessage"
            tabindex="-1"
        >

            <div class="notification-popup-content">

                <h2 id="notificationPopupTitle">
                    Informasi
                </h2>

                <p id="notificationPopupMessage"></p>

            </div>

            <div class="notification-popup-actions">

                <button
                    type="button"
                    class="notification-popup-btn notification-popup-btn--cancel"
                    id="notificationPopupCancel"
                >
                    Batal
                </button>

                <button
                    type="button"
                    class="notification-popup-btn notification-popup-btn--confirm"
                    id="notificationPopupConfirm"
                >
                    Mengerti
                </button>

            </div>

        </section>
    `;

    document.body.appendChild(overlay);

    // 3. MENGAMBIL ELEMEN POPUP
    const popup = overlay.querySelector(".notification-popup");

    const popupTitle = document.getElementById(
        "notificationPopupTitle"
    );

    const popupMessage = document.getElementById(
        "notificationPopupMessage"
    );

    const confirmButton = document.getElementById(
        "notificationPopupConfirm"
    );

    const cancelButton = document.getElementById(
        "notificationPopupCancel"
    );

    // 4. STATUS POPUP
    let popupQueue = [];

    let isPopupActive = false;

    let currentPopup = null;

    let previousFocus = null;

    // 5. MENAMPILKAN POPUP BERIKUTNYA
    function processPopupQueue() {

        if (isPopupActive || popupQueue.length === 0) {
            return;
        }

        isPopupActive = true;

        currentPopup = popupQueue.shift();

        previousFocus = document.activeElement;

        const config = popupConfig[currentPopup.type];

        popup.className =
            "notification-popup notification-popup--" +
            currentPopup.type;

        popupTitle.textContent =
            currentPopup.title || config.title;

        popupMessage.textContent =
            currentPopup.message;

        confirmButton.textContent =
            currentPopup.confirmText || config.confirmText;

        if (currentPopup.type === "confirm") {

            cancelButton.textContent =
                currentPopup.cancelText || config.cancelText;

            cancelButton.hidden = false;

        } else {

            cancelButton.hidden = true;

        }

        overlay.classList.add("is-visible");

        popup.focus();

        confirmButton.focus();

    }

    // 6. MENYELESAIKAN POPUP
    function closePopup(result) {

        if (!isPopupActive || !currentPopup) {
            return;
        }

        const completedPopup = currentPopup;

        currentPopup = null;

        isPopupActive = false;

        overlay.classList.remove("is-visible");

        if (previousFocus && previousFocus.isConnected) {
            previousFocus.focus();
        }

        completedPopup.resolve(result);

        processPopupQueue();

    }

    // 7. MEMASUKKAN POPUP KE ANTREAN
    function enqueuePopup(options) {

        return new Promise(function (resolve) {

            popupQueue.push({

                ...options,

                resolve: resolve

            });

            processPopupQueue();

        });

    }

    // 8. FUNGSI UTAMA POPUP
    function showPopup(type, message, options = {}) {

        if (!popupConfig[type]) {

            console.error(
                "Jenis popup tidak dikenali:",
                type
            );

            return Promise.resolve(false);

        }

        return enqueuePopup({

            type: type,

            message: String(message ?? ""),

            title: options.title,

            confirmText: options.confirmText,

            cancelText: options.cancelText

        });

    }

    // 9. EVENT TOMBOL KONFIRMASI
    confirmButton.addEventListener("click", function () {

        closePopup(true);

    });

    // 10. EVENT TOMBOL BATAL
    cancelButton.addEventListener("click", function () {

        closePopup(false);

    });

    // 11. MENUTUP POPUP DENGAN ESCAPE
    document.addEventListener("keydown", function (event) {

        if (!isPopupActive) {
            return;
        }

        if (event.key === "Escape") {

            event.preventDefault();

            if (currentPopup.type === "confirm") {

                closePopup(false);

            } else {

                closePopup(true);

            }

            return;

        }

        if (event.key === "Tab") {

            event.preventDefault();

            if (currentPopup.type === "confirm") {

                if (document.activeElement === confirmButton) {

                    cancelButton.focus();

                } else {

                    confirmButton.focus();

                }

            } else {

                confirmButton.focus();

            }

        }

    });

    // 12. KLIK AREA LUAR POPUP
    overlay.addEventListener("click", function (event) {

        if (event.target === overlay) {

            event.stopPropagation();

        }

    });

    // 13. API PUBLIK ARTHA
    window.arthaPopup = Object.freeze({

        info: function (message, options = {}) {

            return showPopup("info", message, options);

        },

        success: function (message, options = {}) {

            return showPopup("success", message, options);

        },

        warning: function (message, options = {}) {

            return showPopup("warning", message, options);

        },

        error: function (message, options = {}) {

            return showPopup("error", message, options);

        },

        confirm: function (message, options = {}) {

            return showPopup("confirm", message, options);

        }

    });


    console.log("ARTHA Custom Popup berhasil dimuat.");

});