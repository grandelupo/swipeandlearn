<?php
/**
 * Waitlist API Endpoint
 * 
 * Handles POST requests to add users to the waitlist
 * Connects to Supabase database
 */

require_once __DIR__ . '/../config.php';

// Set CORS headers
setCorsHeaders();

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Validate configuration
if (!validateConfig()) {
    http_response_code(500);
    echo json_encode(['error' => 'Server configuration error']);
    exit;
}

// Get and validate input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON input']);
    exit;
}

// Validate required fields
$email = trim($input['email'] ?? '');
$name = trim($input['name'] ?? '');
$language = trim($input['language'] ?? '');

if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Valid email address is required']);
    exit;
}

// Prepare data for Supabase
$waitlistData = [
    'email' => $email,
    'name' => $name ?: null,
    'preferred_language' => $language ?: null
];

// Make request to Supabase
$supabaseUrl = SUPABASE_URL . '/rest/v1/waitlist';
$headers = [
    'Content-Type: application/json',
    'Authorization: Bearer ' . SUPABASE_SERVICE_ROLE_KEY,
    'apikey: ' . SUPABASE_SERVICE_ROLE_KEY,
    'Prefer: return=minimal'
];

$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => $supabaseUrl,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($waitlistData),
    CURLOPT_HTTPHEADER => $headers,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_SSL_VERIFYPEER => true
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

// Handle cURL errors
if ($curlError) {
    error_log("Waitlist cURL error: " . $curlError);
    http_response_code(500);
    echo json_encode(['error' => 'Service temporarily unavailable']);
    exit;
}

// Handle Supabase response
if ($httpCode === 201 || $httpCode === 200) {
    // Success
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Successfully joined the waitlist! We\'ll notify you when Swipe and Learn is ready.'
    ]);
} elseif ($httpCode === 409) {
    // Duplicate email
    http_response_code(409);
    echo json_encode(['error' => 'This email is already on the waitlist']);
} else {
    // Other error
    $errorResponse = json_decode($response, true);
    $errorMessage = $errorResponse['message'] ?? 'Failed to join waitlist';
    
    // Log detailed error for debugging
    error_log("Waitlist Supabase error: HTTP $httpCode - " . $response);
    
    // Check if it's a duplicate key error (another way to handle unique constraint)
    if (strpos($response, 'duplicate key') !== false || strpos($response, 'unique constraint') !== false) {
        http_response_code(409);
        echo json_encode(['error' => 'This email is already on the waitlist']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to join waitlist. Please try again.']);
    }
}
?> 