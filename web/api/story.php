<?php
/**
 * Story API Endpoint
 * 
 * Handles GET requests to fetch story data by share code
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

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
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

// Get share code from URL parameter
$shareCode = trim($_GET['code'] ?? '');

if (!$shareCode) {
    http_response_code(400);
    echo json_encode(['error' => 'Share code is required']);
    exit;
}

// Make request to Supabase to get story by share code
$supabaseUrl = SUPABASE_URL . '/rest/v1/story_shares?share_code=eq.' . urlencode($shareCode) . '&select=*,stories(*)';
$headers = [
    'Content-Type: application/json',
    'Authorization: Bearer ' . SUPABASE_SERVICE_ROLE_KEY,
    'apikey: ' . SUPABASE_SERVICE_ROLE_KEY
];

$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => $supabaseUrl,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPGET => true,
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
    error_log("Story API cURL error: " . $curlError);
    http_response_code(500);
    echo json_encode(['error' => 'Service temporarily unavailable']);
    exit;
}

// Handle Supabase response
if ($httpCode === 200) {
    $data = json_decode($response, true);
    
    if (empty($data)) {
        http_response_code(404);
        echo json_encode(['error' => 'Story not found']);
        exit;
    }
    
    $storyShare = $data[0];
    $story = $storyShare['stories'];
    
    if (!$story) {
        http_response_code(404);
        echo json_encode(['error' => 'Story not found']);
        exit;
    }
    
    // Return story data
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'story' => [
            'id' => $story['id'],
            'title' => $story['title'],
            'language' => $story['language'],
            'difficulty' => $story['difficulty'],
            'theme' => $story['theme'],
            'total_pages' => $story['total_pages'],
            'created_at' => $story['created_at'],
            'author_name' => $story['author_name'] ?? null
        ],
        'share_code' => $shareCode
    ]);
} else {
    // Other error
    $errorResponse = json_decode($response, true);
    $errorMessage = $errorResponse['message'] ?? 'Failed to fetch story';
    
    // Log detailed error for debugging
    error_log("Story API Supabase error: HTTP $httpCode - " . $response);
    
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch story. Please try again.']);
}
?> 