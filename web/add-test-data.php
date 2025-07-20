<?php
require_once 'config.php';

// Initialize Supabase client
$supabaseUrl = SUPABASE_URL;
$supabaseKey = SUPABASE_SERVICE_ROLE_KEY;

echo "<h1>Add Test Referral Data</h1>";

// First, let's get some existing referral codes
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $supabaseUrl . '/rest/v1/referral_codes?select=*&limit=1');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'apikey: ' . $supabaseKey,
    'Authorization: Bearer ' . $supabaseKey
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

$referralCodes = json_decode($response, true);

if (empty($referralCodes)) {
    echo "<p>No referral codes found. Please create a referral code first.</p>";
    echo "<p><a href='influencer-login.php'>Go to Login</a></p>";
    exit;
}

$referralCode = $referralCodes[0];
echo "<p>Using referral code: " . $referralCode['code'] . "</p>";

// Add some test referral earnings
$testEarnings = [
    [
        'referral_code_id' => $referralCode['id'],
        'referred_user_id' => '00000000-0000-0000-0000-000000000001', // Test user ID
        'transaction_amount' => 29.99,
        'commission_amount' => 2.99,
        'transaction_type' => 'coin_purchase',
        'transaction_date' => date('Y-m-d H:i:s', strtotime('-1 day')),
        'created_at' => date('Y-m-d H:i:s', strtotime('-1 day'))
    ],
    [
        'referral_code_id' => $referralCode['id'],
        'referred_user_id' => '00000000-0000-0000-0000-000000000002', // Test user ID
        'transaction_amount' => 49.99,
        'commission_amount' => 4.99,
        'transaction_type' => 'subscription',
        'transaction_date' => date('Y-m-d H:i:s', strtotime('-2 days')),
        'created_at' => date('Y-m-d H:i:s', strtotime('-2 days'))
    ],
    [
        'referral_code_id' => $referralCode['id'],
        'referred_user_id' => '00000000-0000-0000-0000-000000000003', // Test user ID
        'transaction_amount' => 19.99,
        'commission_amount' => 1.99,
        'transaction_type' => 'coin_purchase',
        'transaction_date' => date('Y-m-d H:i:s', strtotime('-3 days')),
        'created_at' => date('Y-m-d H:i:s', strtotime('-3 days'))
    ]
];

echo "<h2>Adding Test Earnings</h2>";

foreach ($testEarnings as $earning) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $supabaseUrl . '/rest/v1/referral_earnings');
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($earning));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'apikey: ' . $supabaseKey,
        'Authorization: Bearer ' . $supabaseKey
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode === 201) {
        echo "<p style='color: green;'>✓ Added earning: " . $earning['transaction_type'] . " - " . $earning['commission_amount'] . " zł</p>";
    } else {
        echo "<p style='color: red;'>✗ Failed to add earning: " . $earning['transaction_type'] . " (HTTP $httpCode)</p>";
        echo "<p>Response: " . $response . "</p>";
    }
}

echo "<h2>Test Data Added</h2>";
echo "<p><a href='influencer-dashboard.php'>Go to Influencer Dashboard</a></p>";
echo "<p><a href='test-referral-system.php'>Test Referral System</a></p>";
?> 