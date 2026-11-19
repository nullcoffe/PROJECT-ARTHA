<?php
/**
 * ARTHA Asset Cache Busting
 * Membuat URL aset berubah otomatis ketika file fisiknya diperbarui.
 */
if (!function_exists('artha_asset')) {
    function artha_asset(string $relativePath): string
    {
        $relativePath = str_replace('\\', '/', trim($relativePath));

        // Path fisik dihitung relatif terhadap direktori halaman yang sedang dibuka.
        $scriptFile = $_SERVER['SCRIPT_FILENAME'] ?? '';
        $scriptName = $_SERVER['SCRIPT_NAME'] ?? '';
        $scriptDirectory = dirname($scriptFile);
        $assetFile = realpath($scriptDirectory . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $relativePath));
        $assetRoot = realpath(__DIR__);

        // Hanya izinkan file yang benar-benar berada di dalam frontend/assets.
        if (
            $assetFile === false ||
            $assetRoot === false ||
            !is_file($assetFile) ||
            strpos($assetFile, $assetRoot . DIRECTORY_SEPARATOR) !== 0
        ) {
            // Tetap kembalikan URL asal agar aset yang belum ditemukan tidak merusak halaman.
            return htmlspecialchars($relativePath, ENT_QUOTES, 'UTF-8');
        }

        // Bentuk URL relatif sesuai lokasi halaman, lalu normalkan segmen ../.
        $urlParts = [];
        $combinedPath = dirname($scriptName) . '/' . $relativePath;
        foreach (explode('/', str_replace('\\', '/', $combinedPath)) as $part) {
            if ($part === '' || $part === '.') {
                continue;
            }
            if ($part === '..') {
                array_pop($urlParts);
                continue;
            }
            $urlParts[] = $part;
        }

        $url = '/' . implode('/', $urlParts);
        $version = (string) filemtime($assetFile);

        return htmlspecialchars($url . '?v=' . rawurlencode($version), ENT_QUOTES, 'UTF-8');
    }
}