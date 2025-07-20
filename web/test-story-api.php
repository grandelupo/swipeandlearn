<?php
/**
 * Test file for Story API
 * 
 * This file helps test the story API endpoint
 */

require_once 'config.php';

// Test share code (you'll need to replace this with a real one from your database)
$testShareCode = 'test123';

echo "<h1>Testing Story API</h1>";
echo "<p>Testing with share code: <strong>$testShareCode</strong></p>";

// Test the API endpoint
$apiUrl = 'https://' . $_SERVER['HTTP_HOST'] . '/api/story.php?code=' . urlencode($testShareCode);
echo "<p>API URL: <code>$apiUrl</code></p>";

$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => $apiUrl,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPGET => true,
    CURLOPT_TIMEOUT => 10,
    CURLOPT_SSL_VERIFYPEER => false
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

echo "<h2>Response</h2>";
echo "<p>HTTP Code: <strong>$httpCode</strong></p>";

if ($curlError) {
    echo "<p style='color: red;'>cURL Error: $curlError</p>";
} else {
    echo "<p>Response:</p>";
    echo "<pre>" . htmlspecialchars($response) . "</pre>";
    
    $data = json_decode($response, true);
    if ($data) {
        echo "<h3>Parsed Response:</h3>";
        echo "<pre>" . print_r($data, true) . "</pre>";
    }
}

echo "<h2>Test Story Page</h2>";
echo "<p>You can test the story page at: <a href='/story/$testShareCode' target='_blank'>/story/$testShareCode</a></p>";

echo "<h2>Configuration Check</h2>";
echo "<p>Supabase URL: " . (defined('SUPABASE_URL') ? SUPABASE_URL : 'NOT DEFINED') . "</p>";
echo "<p>Service Role Key: " . (defined('SUPABASE_SERVICE_ROLE_KEY') ? (strlen(SUPABASE_SERVICE_ROLE_KEY) > 10 ? substr(SUPABASE_SERVICE_ROLE_KEY, 0, 10) . '...' : SUPABASE_SERVICE_ROLE_KEY) : 'NOT DEFINED') . "</p>";
echo "<p>Config Valid: " . (validateConfig() ? 'YES' : 'NO') . "</p>";
?> 