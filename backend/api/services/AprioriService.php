<?php

class AprioriService
{
    private mysqli $conn;

    public function __construct(mysqli $conn)
    {
        $this->conn = $conn;
    }

    // Mengambil transaksi berdasarkan tahun.
    private function getTransactions(int $year): array
    {
        $startDate = sprintf('%04d-01-01 00:00:00', $year);
        $endDate = sprintf('%04d-01-01 00:00:00', $year + 1);

        $stmt = $this->conn->prepare(
            "SELECT t.id_transaksi, dt.id_produk
             FROM transaksi t
             INNER JOIN detail_transaksi dt
                ON dt.id_transaksi = t.id_transaksi
             WHERE t.tanggal_transaksi >= ?
               AND t.tanggal_transaksi < ?
             ORDER BY t.id_transaksi, dt.id_produk"
        );

        if (!$stmt) {
            throw new RuntimeException(
                'Gagal menyiapkan data transaksi.'
            );
        }

        $stmt->bind_param('ss', $startDate, $endDate);
        $stmt->execute();

        $result = $stmt->get_result();
        $transactions = [];

        while ($row = $result->fetch_assoc()) {
            $transactionId = (int) $row['id_transaksi'];
            $productId = (int) $row['id_produk'];

            $transactions[$transactionId][$productId] = true;
        }

        $stmt->close();

        $baskets = [];

        foreach ($transactions as $items) {
            $basket = array_map('intval', array_keys($items));
            sort($basket, SORT_NUMERIC);

            if (!empty($basket)) {
                $baskets[] = $basket;
            }
        }

        return $baskets;
    }

    // Menghitung kemunculan itemset dalam seluruh transaksi.
    private function countItemset(
        array $transactions,
        array $items
    ): int {
        $count = 0;

        foreach ($transactions as $transaction) {
            if (empty(array_diff($items, $transaction))) {
                $count++;
            }
        }

        return $count;
    }

    // Membentuk kombinasi produk.
    private function combinations(
        array $items,
        int $size
    ): array {
        $result = [];

        $this->combineRecursive(
            $items,
            $size,
            0,
            [],
            $result
        );

        return $result;
    }

    private function combineRecursive(
        array $items,
        int $size,
        int $start,
        array $current,
        array &$result
    ): void {
        if (count($current) === $size) {
            $result[] = $current;
            return;
        }

        for ($i = $start; $i < count($items); $i++) {
            $next = $current;
            $next[] = $items[$i];

            $this->combineRecursive(
                $items,
                $size,
                $i + 1,
                $next,
                $result
            );
        }
    }

    // Membentuk kandidat itemset menggunakan prinsip Apriori.
    private function generateCandidates(
        array $previousFrequent,
        int $nextSize
    ): array {
        $candidates = [];
        $previousKeys = [];

        foreach ($previousFrequent as $itemset) {
            $previousKeys[implode(',', $itemset)] = true;
        }

        $count = count($previousFrequent);

        for ($i = 0; $i < $count; $i++) {
            for ($j = $i + 1; $j < $count; $j++) {
                $first = $previousFrequent[$i];
                $second = $previousFrequent[$j];

                $prefixLength = $nextSize - 2;

                if (
                    array_slice($first, 0, $prefixLength) !==
                    array_slice($second, 0, $prefixLength)
                ) {
                    continue;
                }

                $candidate = array_values(
                    array_unique(array_merge($first, $second))
                );

                sort($candidate, SORT_NUMERIC);

                if (count($candidate) !== $nextSize) {
                    continue;
                }

                $allSubsetsFrequent = true;

                foreach (
                    $this->combinations($candidate, $nextSize - 1)
                    as $subset
                ) {
                    if (!isset($previousKeys[implode(',', $subset)])) {
                        $allSubsetsFrequent = false;
                        break;
                    }
                }

                if ($allSubsetsFrequent) {
                    $candidates[implode(',', $candidate)] = $candidate;
                }
            }
        }

        return array_values($candidates);
    }

    // Membentuk aturan asosiasi dari frequent itemset.
    private function generateRules(
        array $frequentItemsets,
        array $transactions,
        float $minimumConfidence
    ): array {
        $totalTransactions = count($transactions);
        $rules = [];

        foreach ($frequentItemsets as $itemset) {
            $items = $itemset['items'];
            $size = count($items);

            if ($size < 2) {
                continue;
            }

            for ($subsetSize = 1; $subsetSize < $size; $subsetSize++) {
                $subsets = $this->combinations(
                    $items,
                    $subsetSize
                );

                foreach ($subsets as $antecedent) {
                    $consequent = array_values(
                        array_diff($items, $antecedent)
                    );

                    $antecedentCount = $this->countItemset(
                        $transactions,
                        $antecedent
                    );

                    $consequentCount = $this->countItemset(
                        $transactions,
                        $consequent
                    );

                    if (
                        $antecedentCount === 0 ||
                        $consequentCount === 0
                    ) {
                        continue;
                    }

                    $confidence =
                        ($itemset['count'] / $antecedentCount) * 100;

                    if ($confidence < $minimumConfidence) {
                        continue;
                    }

                    $support =
                        ($itemset['count'] / $totalTransactions) * 100;

                    $consequentSupport =
                        $consequentCount / $totalTransactions;

                    $lift = ($confidence / 100) / $consequentSupport;

                    $rules[] = [
                        'antecedent' => $antecedent,
                        'consequent' => $consequent,
                        'itemset_size' => $size,
                        'support_count' => $itemset['count'],
                        'antecedent_count' => $antecedentCount,
                        'consequent_count' => $consequentCount,
                        'total_transactions' => $totalTransactions,
                        'support' => round($support, 4),
                        'confidence' => round($confidence, 4),
                        'lift' => round($lift, 4)
                    ];
                }
            }
        }

        usort(
            $rules,
            function ($a, $b) {
                return $b['lift'] <=> $a['lift']
                    ?: $b['support'] <=> $a['support'];
            }
        );

        return $rules;
    }

    // Menyimpan hasil analisis dan aturan asosiasi ke MySQL.
    private function saveAnalysis(
        int $userId,
        int $year,
        float $minimumSupport,
        float $minimumConfidence,
        int $totalTransactions,
        array $rules
    ): int {
        $this->conn->begin_transaction();

        try {
            $analysisStmt = $this->conn->prepare(
                "INSERT INTO analisis_apriori
                    (
                        id_pengguna,
                        tanggal_analisis,
                        tahun_data,
                        minimum_support,
                        minimum_confidence,
                        jumlah_transaksi
                    )
                 VALUES (?, NOW(), ?, ?, ?, ?)"
            );

            if (!$analysisStmt) {
                throw new RuntimeException(
                    'Gagal menyiapkan penyimpanan analisis.'
                );
            }

            $analysisStmt->bind_param(
                'iiddi',
                $userId,
                $year,
                $minimumSupport,
                $minimumConfidence,
                $totalTransactions
            );

            if (!$analysisStmt->execute()) {
                throw new RuntimeException(
                    'Gagal menyimpan analisis Apriori.'
                );
            }

            $analysisId = (int) $this->conn->insert_id;
            $analysisStmt->close();

            $ruleStmt = $this->conn->prepare(
                "INSERT INTO aturan_asosiasi
                    (
                        id_analisis_apriori,
                        nilai_support,
                        nilai_confidence,
                        nilai_lift
                    )
                 VALUES (?, ?, ?, ?)"
            );

            $detailStmt = $this->conn->prepare(
                "INSERT INTO detail_aturan_asosiasi
                    (
                        id_aturan_asosiasi,
                        id_produk,
                        peran_produk
                    )
                 VALUES (?, ?, ?)"
            );

            if (!$ruleStmt || !$detailStmt) {
                throw new RuntimeException(
                    'Gagal menyiapkan penyimpanan aturan asosiasi.'
                );
            }

            foreach ($rules as $rule) {
                $support = $rule['support'];
                $confidence = $rule['confidence'];
                $lift = $rule['lift'];

                $ruleStmt->bind_param(
                    'iddd',
                    $analysisId,
                    $support,
                    $confidence,
                    $lift
                );

                if (!$ruleStmt->execute()) {
                    throw new RuntimeException(
                        'Gagal menyimpan aturan asosiasi.'
                    );
                }

                $ruleId = (int) $this->conn->insert_id;

                foreach ($rule['antecedent'] as $productId) {
                    $role = 'antecedent';

                    $detailStmt->bind_param(
                        'iis',
                        $ruleId,
                        $productId,
                        $role
                    );

                    if (!$detailStmt->execute()) {
                        throw new RuntimeException(
                            'Gagal menyimpan produk antecedent.'
                        );
                    }
                }

                foreach ($rule['consequent'] as $productId) {
                    $role = 'consequent';

                    $detailStmt->bind_param(
                        'iis',
                        $ruleId,
                        $productId,
                        $role
                    );

                    if (!$detailStmt->execute()) {
                        throw new RuntimeException(
                            'Gagal menyimpan produk consequent.'
                        );
                    }
                }
            }

            $ruleStmt->close();
            $detailStmt->close();

            $this->conn->commit();

            return $analysisId;

        } catch (Throwable $error) {
            $this->conn->rollback();
            throw $error;
        }
    }

    // Mengambil nama produk dari ID produk.
    private function getProductNames(array $productIds): array
    {
        if (empty($productIds)) {
            return [];
        }

        $placeholders = implode(
            ',',
            array_fill(0, count($productIds), '?')
        );

        $types = str_repeat('i', count($productIds));

        $stmt = $this->conn->prepare(
            "SELECT id_produk, nama_produk
             FROM produk
             WHERE id_produk IN ($placeholders)"
        );

        if (!$stmt) {
            throw new RuntimeException(
                'Gagal mengambil nama produk.'
            );
        }

        $stmt->bind_param($types, ...$productIds);
        $stmt->execute();

        $result = $stmt->get_result();
        $names = [];

        while ($row = $result->fetch_assoc()) {
            $names[(int) $row['id_produk']] = $row['nama_produk'];
        }

        $stmt->close();

        return $names;
    }

    // Menjalankan analisis Apriori dan menyimpan hasilnya.
    public function analyze(
        int $userId,
        int $year,
        float $minimumSupport,
        float $minimumConfidence
    ): array {
        if ($userId <= 0) {
            throw new InvalidArgumentException(
                'Identitas pengguna tidak valid.',
                422
            );
        }

        if ($year < 2000 || $year > 2100) {
            throw new InvalidArgumentException(
                'Tahun analisis tidak valid.',
                422
            );
        }

        if (
            $minimumSupport <= 0 ||
            $minimumSupport > 100 ||
            $minimumConfidence <= 0 ||
            $minimumConfidence > 100
        ) {
            throw new InvalidArgumentException(
                'Nilai support dan confidence harus lebih dari 0 dan maksimal 100.',
                422
            );
        }

        $transactions = $this->getTransactions($year);
        $totalTransactions = count($transactions);

        if ($totalTransactions === 0) {
            throw new RuntimeException(
                'Tidak ada transaksi pada tahun yang dipilih.',
                422
            );
        }

        $minimumSupportCount = (int) ceil(
            ($minimumSupport / 100) * $totalTransactions
        );

        $productSet = [];

        foreach ($transactions as $transaction) {
            foreach ($transaction as $productId) {
                $productSet[$productId] = true;
            }
        }

        $productIds = array_map(
            'intval',
            array_keys($productSet)
        );

        sort($productIds, SORT_NUMERIC);

        $frequentItemsets = [];
        $previousFrequent = [];

        // Menghitung frequent 1-itemset.
        foreach ($productIds as $productId) {
            $items = [$productId];

            $count = $this->countItemset(
                $transactions,
                $items
            );

            if ($count >= $minimumSupportCount) {
                $previousFrequent[] = $items;

                $frequentItemsets[] = [
                    'items' => $items,
                    'count' => $count,
                    'support' => (
                        $count / $totalTransactions
                    ) * 100
                ];
            }
        }

        // Menghitung frequent itemset berikutnya.
        $itemsetSize = 2;

        while (!empty($previousFrequent)) {
            $candidates = $this->generateCandidates(
                $previousFrequent,
                $itemsetSize
            );

            if (empty($candidates)) {
                break;
            }

            $currentFrequent = [];

            foreach ($candidates as $candidate) {
                $count = $this->countItemset(
                    $transactions,
                    $candidate
                );

                if ($count >= $minimumSupportCount) {
                    $currentFrequent[] = $candidate;

                    $frequentItemsets[] = [
                        'items' => $candidate,
                        'count' => $count,
                        'support' => (
                            $count / $totalTransactions
                        ) * 100
                    ];
                }
            }

            $previousFrequent = $currentFrequent;
            $itemsetSize++;
        }

        $rules = $this->generateRules(
            $frequentItemsets,
            $transactions,
            $minimumConfidence
        );

        $analysisId = $this->saveAnalysis(
            $userId,
            $year,
            $minimumSupport,
            $minimumConfidence,
            $totalTransactions,
            $rules
        );

        $allProductIds = [];

        foreach ($rules as $rule) {
            $allProductIds = array_merge(
                $allProductIds,
                $rule['antecedent'],
                $rule['consequent']
            );
        }

        $allProductIds = array_values(
            array_unique($allProductIds)
        );

        $productNames = $this->getProductNames(
            $allProductIds
        );

        foreach ($rules as &$rule) {
            $rule['antecedent_names'] = array_map(
                function ($id) use ($productNames) {
                    return $productNames[$id] ?? 'Produk tidak ditemukan';
                },
                $rule['antecedent']
            );

            $rule['consequent_names'] = array_map(
                function ($id) use ($productNames) {
                    return $productNames[$id] ?? 'Produk tidak ditemukan';
                },
                $rule['consequent']
            );
        }

        unset($rule);

        return [
            'id_analisis_apriori' => $analysisId,
            'tahun' => $year,
            'jumlah_transaksi' => $totalTransactions,
            'minimum_support' => $minimumSupport,
            'minimum_support_count' => $minimumSupportCount,
            'minimum_confidence' => $minimumConfidence,
            'jumlah_frequent_itemset' => count($frequentItemsets),
            'jumlah_aturan' => count($rules),
            'aturan' => $rules
        ];
    }

// Mengambil hasil analisis Apriori terakhir dari database.
public function getLatestAnalysis(int $userId): ?array
{
    if ($userId <= 0) {
        throw new InvalidArgumentException(
            'Identitas pengguna tidak valid.',
            422
        );
    }

    // Mengambil analisis terakhir milik Pemilik yang login.
    $analysisStmt = $this->conn->prepare(
        "SELECT
            id_analisis_apriori,
            tanggal_analisis,
            tahun_data,
            minimum_support,
            minimum_confidence,
            jumlah_transaksi
         FROM analisis_apriori
         WHERE id_pengguna = ?
         ORDER BY tanggal_analisis DESC,
                  id_analisis_apriori DESC
         LIMIT 1"
    );

    if (!$analysisStmt) {
        throw new RuntimeException(
            'Gagal menyiapkan data analisis terakhir.'
        );
    }

    $analysisStmt->bind_param('i', $userId);
    $analysisStmt->execute();

    $analysis = $analysisStmt
        ->get_result()
        ->fetch_assoc();

    $analysisStmt->close();

    if (!$analysis) {
        return null;
    }

    $analysisId = (int) $analysis['id_analisis_apriori'];

    // Mengambil aturan asosiasi beserta nama produknya.
        $rulesStmt = $this->conn->prepare(
            "SELECT
                aa.id_aturan_asosiasi,
                aa.nilai_support,
                aa.nilai_confidence,
                aa.nilai_lift,
                da.id_produk,
                da.peran_produk,
                p.nama_produk
            FROM aturan_asosiasi aa
            LEFT JOIN detail_aturan_asosiasi da
                ON da.id_aturan_asosiasi = aa.id_aturan_asosiasi
            LEFT JOIN produk p
                ON p.id_produk = da.id_produk
            WHERE aa.id_analisis_apriori = ?
            ORDER BY
                aa.nilai_lift DESC,
                aa.nilai_support DESC,
                aa.id_aturan_asosiasi ASC"
        );

        if (!$rulesStmt) {
            throw new RuntimeException(
                'Gagal menyiapkan aturan asosiasi.'
            );
        }

        $rulesStmt->bind_param('i', $analysisId);
        $rulesStmt->execute();

        $rulesResult = $rulesStmt->get_result();

        $rules = [];

        while ($row = $rulesResult->fetch_assoc()) {
            $ruleId = (int) $row['id_aturan_asosiasi'];

            if (!isset($rules[$ruleId])) {
                $rules[$ruleId] = [
                    'id_aturan_asosiasi' => $ruleId,
                    'antecedent' => [],
                    'consequent' => [],
                    'support' => (float) $row['nilai_support'],
                    'confidence' => (float) $row['nilai_confidence'],
                    'lift' => (float) $row['nilai_lift']
                ];
            }

            if ($row['id_produk'] !== null) {
                $productName = $row['nama_produk']
                    ?? 'Produk tidak ditemukan';

                if ($row['peran_produk'] === 'antecedent') {
                    $rules[$ruleId]['antecedent'][] = $productName;
                } elseif ($row['peran_produk'] === 'consequent') {
                    $rules[$ruleId]['consequent'][] = $productName;
                }
            }
        }

        $rulesStmt->close();

        return [
            'id_analisis_apriori' => $analysisId,
            'tanggal_analisis' => $analysis['tanggal_analisis'],
            'tahun' => (int) $analysis['tahun_data'],
            'jumlah_transaksi' => (int) $analysis['jumlah_transaksi'],
            'minimum_support' => (float) $analysis['minimum_support'],
            'minimum_confidence' => (float) $analysis['minimum_confidence'],
            'jumlah_aturan' => count($rules),
            'aturan' => array_values($rules)
        ];
    }

}