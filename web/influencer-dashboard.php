<?php
require_once 'config.php';

session_start();

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    header('Location: influencer-login.php');
    exit;
}

$userId = $_SESSION['user_id'];
$userEmail = $_SESSION['user_email'];

// Initialize Supabase client
$supabaseUrl = SUPABASE_URL;
$supabaseKey = SUPABASE_SERVICE_ROLE_KEY;

// Get referral code
$referralCode = '';
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $supabaseUrl . '/rest/v1/referral_codes?influencer_user_id=eq.' . $userId . '&select=code,id');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'apikey: ' . $supabaseKey,
    'Authorization: Bearer ' . $supabaseKey
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

$referralCodes = json_decode($response, true);
if (!empty($referralCodes)) {
    $referralCode = $referralCodes[0]['code'];
    $referralCodeId = $referralCodes[0]['id'];
} else {
    // Create referral code if none exists
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $supabaseUrl . '/rest/v1/rpc/create_referral_code_for_user');
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['user_id' => $userId]));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'apikey: ' . $supabaseKey,
        'Authorization: Bearer ' . $supabaseKey
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    curl_close($ch);
    
    $newCode = json_decode($response, true);
    if (is_string($newCode)) {
        $referralCode = $newCode;
        // Get the referral code ID for the newly created code
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $supabaseUrl . '/rest/v1/referral_codes?influencer_user_id=eq.' . $userId . '&select=id');
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'apikey: ' . $supabaseKey,
            'Authorization: Bearer ' . $supabaseKey
        ]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($ch);
        curl_close($ch);
        
        $newCodes = json_decode($response, true);
        $referralCodeId = !empty($newCodes) ? $newCodes[0]['id'] : null;
    } else {
        $referralCode = '';
        $referralCodeId = null;
    }
}

// Get total earnings
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $supabaseUrl . '/rest/v1/rpc/get_influencer_earnings');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['influencer_user_id' => $userId]));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'apikey: ' . $supabaseKey,
    'Authorization: Bearer ' . $supabaseKey
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

$earnings = json_decode($response, true) ?: ['total_earnings' => 0, 'total_referrals' => 0];

// Get recent earnings - Fixed query to work with service role
$recentEarnings = [];
if ($referralCodeId) {
    // Use a direct query that works with service role
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $supabaseUrl . '/rest/v1/referral_earnings?referral_code_id=eq.' . $referralCodeId . '&order=created_at.desc&limit=10');
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'apikey: ' . $supabaseKey,
        'Authorization: Bearer ' . $supabaseKey
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    curl_close($ch);
    
    $recentEarnings = json_decode($response, true) ?: [];
}

// Handle logout
if (isset($_POST['logout'])) {
    session_destroy();
    header('Location: influencer-login.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Influencer Dashboard - Swipe and Learn</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f8fafc;
            color: #333;
        }
        
        .header {
            background: white;
            padding: 1rem 2rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .header h1 {
            color: #667eea;
            font-size: 1.5rem;
        }
        
        .user-info {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .logout-btn {
            background: #e74c3c;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.9rem;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        
        .stat-card {
            background: white;
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .stat-card h3 {
            color: #667eea;
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .stat-card .value {
            font-size: 2rem;
            font-weight: 700;
            color: #333;
        }
        
        .referral-code-section {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            margin-bottom: 2rem;
        }
        
        .referral-code-section h2 {
            color: #333;
            margin-bottom: 1rem;
        }
        
        .code-display {
            background: #f8fafc;
            border: 2px solid #e1e5e9;
            border-radius: 8px;
            padding: 1rem;
            font-family: monospace;
            font-size: 1.2rem;
            font-weight: 600;
            color: #667eea;
            text-align: center;
            margin-bottom: 1rem;
        }
        
        .copy-btn {
            background: #667eea;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: background 0.2s;
        }
        
        .copy-btn:hover {
            background: #5a6fd8;
        }
        
        .recent-earnings {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .recent-earnings h2 {
            color: #333;
            margin-bottom: 1rem;
        }
        
        .earnings-table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .earnings-table th,
        .earnings-table td {
            padding: 0.75rem;
            text-align: left;
            border-bottom: 1px solid #e1e5e9;
        }
        
        .earnings-table th {
            background: #f8fafc;
            font-weight: 600;
            color: #555;
        }
        
        .earnings-table tr:hover {
            background: #f8fafc;
        }
        
        .amount {
            font-weight: 600;
            color: #27ae60;
        }
        
        .no-earnings {
            text-align: center;
            color: #666;
            padding: 2rem;
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 1rem;
            }
            
            .stats-grid {
                grid-template-columns: 1fr;
            }
            
            .earnings-table {
                font-size: 0.9rem;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Influencer Dashboard</h1>
        <div class="user-info">
            <span><?php echo htmlspecialchars($userEmail); ?></span>
            <form method="POST" style="display: inline;">
                <button type="submit" name="logout" class="logout-btn">Logout</button>
            </form>
        </div>
    </div>
    
    <div class="container">
        <div class="stats-grid">
            <div class="stat-card">
                <h3>Total Earnings</h3>
                <div class="value"><?php echo number_format($earnings['total_earnings'] ?? 0, 2); ?> zł</div>
            </div>
            <div class="stat-card">
                <h3>Total Referrals</h3>
                <div class="value"><?php echo $earnings['total_referrals'] ?? 0; ?></div>
            </div>
            <div class="stat-card">
                <h3>Commission Rate</h3>
                <div class="value">10%</div>
            </div>
        </div>
        
        <div class="referral-code-section">
            <h2>Your Referral Code</h2>
            <div class="code-display" id="referralCode"><?php echo htmlspecialchars(is_string($referralCode) ? $referralCode : ''); ?></div>
            <button class="copy-btn" onclick="copyReferralCode()">Copy Code</button>
        </div>
        
        <div class="recent-earnings">
            <h2>Recent Earnings</h2>
            <?php if (empty($recentEarnings)): ?>
                <div class="no-earnings">
                    <p>No earnings yet. Share your referral code to start earning!</p>
                </div>
            <?php else: ?>
                <table class="earnings-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Transaction Type</th>
                            <th>Amount</th>
                            <th>Commission</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($recentEarnings as $earning): ?>
                            <tr>
                                <td><?php echo date('M j, Y', strtotime($earning['created_at'])); ?></td>
                                <td><?php echo htmlspecialchars(ucfirst($earning['transaction_type'])); ?></td>
                                <td><?php echo number_format($earning['transaction_amount'], 2); ?> zł</td>
                                <td class="amount"><?php echo number_format($earning['commission_amount'], 2); ?> zł</td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            <?php endif; ?>
        </div>
    </div>
    
    <script>
        function copyReferralCode() {
            const code = document.getElementById('referralCode').textContent;
            navigator.clipboard.writeText(code).then(function() {
                const btn = document.querySelector('.copy-btn');
                const originalText = btn.textContent;
                btn.textContent = 'Copied!';
                btn.style.background = '#27ae60';
                
                setTimeout(function() {
                    btn.textContent = originalText;
                    btn.style.background = '#667eea';
                }, 2000);
            });
        }
    </script>
</body>
</html> 