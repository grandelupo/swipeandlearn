<?php
/**
 * Test API Endpoint
 * 
 * Simple endpoint to test API functionality and Supabase connection
 */

require_once __DIR__ . '/../config.php';

// Set CORS headers
setCorsHeaders();

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Test configuration
$configValid = validateConfig();

// Get current timestamp
$timestamp = date('Y-m-d H:i:s');

// Prepare response
$response = [
    'status' => 'success',
    'message' => 'API is working',
    'timestamp' => $timestamp,
    'config_valid' => $configValid,
    'supabase_url' => $configValid ? SUPABASE_URL : 'Not configured',
    'service_key_configured' => $configValid && !empty(SUPABASE_SERVICE_ROLE_KEY),
    'environment' => ENVIRONMENT,
    'php_version' => PHP_VERSION
];

// Test Supabase connection if config is valid
if ($configValid) {
    try {
        $testUrl = SUPABASE_URL . '/rest/v1/';
        $headers = [
            'Authorization: Bearer ' . SUPABASE_SERVICE_ROLE_KEY,
            'apikey: ' . SUPABASE_SERVICE_ROLE_KEY
        ];
        
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $testUrl,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_TIMEOUT => 10,
            CURLOPT_NOBODY => true // HEAD request only
        ]);
        
        $result = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);
        
        if ($curlError) {
            $response['supabase_connection'] = 'Error: ' . $curlError;
        } else {
            $response['supabase_connection'] = $httpCode === 200 ? 'Connected' : 'HTTP ' . $httpCode;
        }
        
    } catch (Exception $e) {
        $response['supabase_connection'] = 'Error: ' . $e->getMessage();
    }
} else {
    $response['supabase_connection'] = 'Configuration invalid';
}

http_response_code(200);
echo json_encode($response, JSON_PRETTY_PRINT);
?> 