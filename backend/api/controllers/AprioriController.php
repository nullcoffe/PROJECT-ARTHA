<?php

require_once __DIR__ . '/../services/AprioriService.php';

class AprioriController
{
    private AprioriService $aprioriService;

    public function __construct(AprioriService $aprioriService)
    {
        $this->aprioriService = $aprioriService;
    }

    // Menjalankan analisis Apriori berdasarkan parameter dari Pemilik.
    public function analyze(
        array $input,
        array $currentUser
    ): void {
        $userId = (int) ($currentUser['id_pengguna'] ?? 0);

        if ($userId <= 0) {
            errorResponse(
                'Identitas pengguna tidak valid.',
                401
            );
        }

        $year = filter_var(
            $input['tahun'] ?? null,
            FILTER_VALIDATE_INT
        );

        $minimumSupport = filter_var(
            $input['minimum_support'] ?? null,
            FILTER_VALIDATE_FLOAT
        );

        $minimumConfidence = filter_var(
            $input['minimum_confidence'] ?? null,
            FILTER_VALIDATE_FLOAT
        );

        if (
            $year === false ||
            $minimumSupport === false ||
            $minimumConfidence === false
        ) {
            errorResponse(
                'Parameter analisis belum lengkap atau tidak valid.',
                422
            );
        }

        if ($year < 2000 || $year > 2100) {
            errorResponse(
                'Tahun analisis harus berada antara 2000 dan 2100.',
                422
            );
        }

        if (
            $minimumSupport <= 0 ||
            $minimumSupport > 100
        ) {
            errorResponse(
                'Minimum Support harus lebih dari 0 dan maksimal 100.',
                422
            );
        }

        if (
            $minimumConfidence <= 0 ||
            $minimumConfidence > 100
        ) {
            errorResponse(
                'Minimum Confidence harus lebih dari 0 dan maksimal 100.',
                422
            );
        }

        $result = $this->aprioriService->analyze(
            $userId,
            $year,
            (float) $minimumSupport,
            (float) $minimumConfidence
        );

        successResponse(
            'Analisis Apriori berhasil dijalankan dan disimpan.',
            $result
        );
    }

    // Mengambil hasil analisis Apriori terakhir untuk Pemilik.
    public function latest(array $currentUser): void
    {
        $userId = (int) ($currentUser['id_pengguna'] ?? 0);

        if ($userId <= 0) {
            errorResponse(
                'Identitas pengguna tidak valid.',
                401
            );
        }

        $result = $this->aprioriService->getLatestAnalysis(
            $userId
        );

        if ($result === null) {
            successResponse(
                'Belum ada hasil analisis Apriori.',
                [
                    'analysis' => null
                ]
            );
        }

        successResponse(
            'Hasil analisis Apriori berhasil dimuat.',
            $result
        );
    }

}