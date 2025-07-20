<?php
require_once 'config.php';

// Initialize Supabase client
$supabaseUrl = SUPABASE_URL;
$supabaseKey = SUPABASE_SERVICE_ROLE_KEY;

echo "<h1>Referral System Test</h1>";

// Test 1: Check if tables exist and have data
echo "<h2>1. Checking Database Tables</h2>";

// Check referral_codes
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $supabaseUrl . '/rest/v1/referral_codes?select=count');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'apikey: ' . $supabaseKey,
    'Authorization: Bearer ' . $supabaseKey
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

$codes = json_decode($response, true);
echo "<p>Referral codes count: " . count($codes) . "</p>";

// Check user_referrals
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $supabaseUrl . '/rest/v1/user_referrals?select=count');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'apikey: ' . $supabaseKey,
    'Authorization: Bearer ' . $supabaseKey
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

$referrals = json_decode($response, true);
echo "<p>User referrals count: " . count($referrals) . "</p>";

// Check referral_earnings
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $supabaseUrl . '/rest/v1/referral_earnings?select=count');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'apikey: ' . $supabaseKey,
    'Authorization: Bearer ' . $supabaseKey
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

$earnings = json_decode($response, true);
echo "<p>Referral earnings count: " . count($earnings) . "</p>";

// Test 2: Show sample data
echo "<h2>2. Sample Data</h2>";

// Show referral codes
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $supabaseUrl . '/rest/v1/referral_codes?select=*&limit=5');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'apikey: ' . $supabaseKey,
    'Authorization: Bearer ' . $supabaseKey
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

$sampleCodes = json_decode($response, true);
echo "<h3>Referral Codes:</h3>";
echo "<pre>" . print_r($sampleCodes, true) . "</pre>";

// Show referral earnings
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $supabaseUrl . '/rest/v1/referral_earnings?select=*&limit=5');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'apikey: ' . $supabaseKey,
    'Authorization: Bearer ' . $supabaseKey
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

$sampleEarnings = json_decode($response, true);
echo "<h3>Referral Earnings:</h3>";
echo "<pre>" . print_r($sampleEarnings, true) . "</pre>";

// Test 3: Test the get_influencer_earnings function
echo "<h2>3. Testing get_influencer_earnings Function</h2>";

if (!empty($sampleCodes)) {
    $testUserId = $sampleCodes[0]['influencer_user_id'];
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $supabaseUrl . '/rest/v1/rpc/get_influencer_earnings');
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['influencer_user_id' => $testUserId]));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'apikey: ' . $supabaseKey,
        'Authorization: Bearer ' . $supabaseKey
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    curl_close($ch);
    
    $testEarnings = json_decode($response, true);
    echo "<p>Test earnings for user $testUserId:</p>";
    echo "<pre>" . print_r($testEarnings, true) . "</pre>";
}

echo "<h2>4. Test Complete</h2>";
echo "<p><a href='influencer-dashboard.php'>Go to Influencer Dashboard</a></p>";
?> 