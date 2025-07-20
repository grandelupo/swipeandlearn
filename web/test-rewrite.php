<?php
/**
 * Test file for .htaccess rewrite rules
 * 
 * This file helps test if the URL rewriting is working
 */

echo "<h1>URL Rewrite Test</h1>";

echo "<h2>Current URL Information</h2>";
echo "<p><strong>REQUEST_URI:</strong> " . $_SERVER['REQUEST_URI'] . "</p>";
echo "<p><strong>SCRIPT_NAME:</strong> " . $_SERVER['SCRIPT_NAME'] . "</p>";
echo "<p><strong>PHP_SELF:</strong> " . $_SERVER['PHP_SELF'] . "</p>";
echo "<p><strong>QUERY_STRING:</strong> " . $_SERVER['QUERY_STRING'] . "</p>";

echo "<h2>GET Parameters</h2>";
if (empty($_GET)) {
    echo "<p>No GET parameters found</p>";
} else {
    echo "<pre>" . print_r($_GET, true) . "</pre>";
}

echo "<h2>Test Links</h2>";
echo "<p><a href='/story/test123'>Test Story Link: /story/test123</a></p>";
echo "<p><a href='/story.php?code=test123'>Direct PHP Link: /story.php?code=test123</a></p>";
echo "<p><a href='/api/story.php?code=test123'>API Link: /api/story.php?code=test123</a></p>";

echo "<h2>Server Information</h2>";
echo "<p><strong>Server Software:</strong> " . $_SERVER['SERVER_SOFTWARE'] . "</p>";
echo "<p><strong>mod_rewrite enabled:</strong> " . (function_exists('apache_get_modules') ? (in_array('mod_rewrite', apache_get_modules()) ? 'Yes' : 'No') : 'Unknown') . "</p>";

// Test if we can access the story.php file directly
echo "<h2>Story.php Access Test</h2>";
$storyTestUrl = 'https://' . $_SERVER['HTTP_HOST'] . '/story.php?code=test123';
echo "<p>Testing direct access to: <code>$storyTestUrl</code></p>";

$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => $storyTestUrl,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPGET => true,
    CURLOPT_TIMEOUT => 5,
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_NOBODY => true
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

echo "<p><strong>HTTP Code:</strong> $httpCode</p>";
if ($curlError) {
    echo "<p><strong>cURL Error:</strong> $curlError</p>";
} else {
    echo "<p><strong>Status:</strong> " . ($httpCode === 200 ? 'Success' : 'Failed') . "</p>";
}
?> 