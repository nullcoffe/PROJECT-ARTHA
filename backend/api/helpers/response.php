<?php

// Mengirim respons JSON
function jsonResponse(
    int $statusCode,
    array $response
): void {

    http_response_code($statusCode);

    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');

    echo json_encode(
        $response,
        JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE
    );

    exit;
}


// Respons berhasil
function successResponse(
    string $message,
    $data = null,
    int $statusCode = 200
): void {

    jsonResponse($statusCode, [
        'success' => true,
        'message' => $message,
        'data' => $data
    ]);
}


// Respons gagal
function errorResponse(
    string $message,
    int $statusCode = 400,
    $errors = null
): void {

    $response = [
        'success' => false,
        'message' => $message
    ];

    if ($errors !== null) {
        $response['errors'] = $errors;
    }

    jsonResponse($statusCode, $response);
}
