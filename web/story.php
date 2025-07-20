<?php
/**
 * Story Sharing Page
 * 
 * Displays story information and provides app download links
 * Automatically redirects to app if installed
 */

// Get share code from URL
$shareCode = $_GET['code'] ?? '';

// Debug information (remove this in production)
if (isset($_GET['debug'])) {
    echo "<h1>Debug Information</h1>";
    echo "<p><strong>REQUEST_URI:</strong> " . $_SERVER['REQUEST_URI'] . "</p>";
    echo "<p><strong>QUERY_STRING:</strong> " . $_SERVER['QUERY_STRING'] . "</p>";
    echo "<p><strong>GET parameters:</strong> " . print_r($_GET, true) . "</p>";
    echo "<p><strong>Share code:</strong> " . ($shareCode ?: 'EMPTY') . "</p>";
    exit;
}

if (!$shareCode) {
    http_response_code(404);
    echo '<!DOCTYPE html><html><head><title>Story Not Found</title></head><body><h1>Story Not Found</h1><p>The story you are looking for does not exist.</p></body></html>';
    exit;
}

// Fetch story data
$apiUrl = 'https://' . $_SERVER['HTTP_HOST'] . '/api/story.php?code=' . urlencode($shareCode);
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
curl_close($ch);

$storyData = null;
$error = null;

if ($httpCode === 200) {
    $data = json_decode($response, true);
    if ($data && isset($data['success']) && $data['success']) {
        $storyData = $data['story'];
    } else {
        $error = $data['error'] ?? 'Failed to load story';
    }
} else {
    $error = 'Story not found';
}

if ($error) {
    http_response_code(404);
    echo '<!DOCTYPE html><html><head><title>Story Not Found</title></head><body><h1>Story Not Found</h1><p>' . htmlspecialchars($error) . '</p></body></html>';
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($storyData['title']); ?> - Swipe and Learn</title>
    <meta name="description" content="Someone shared a story with you on Swipe and Learn. Download the app to read this interactive language learning story.">
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="<?php echo htmlspecialchars($storyData['title']); ?> - Swipe and Learn">
    <meta property="og:description" content="Someone shared a story with you on Swipe and Learn. Download the app to read this interactive language learning story.">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://<?php echo $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI']; ?>">
    <meta property="og:image" content="https://<?php echo $_SERVER['HTTP_HOST']; ?>/assets/images/screenshot-story.png">
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="<?php echo htmlspecialchars($storyData['title']); ?> - Swipe and Learn">
    <meta name="twitter:description" content="Someone shared a story with you on Swipe and Learn. Download the app to read this interactive language learning story.">
    <meta name="twitter:image" content="https://<?php echo $_SERVER['HTTP_HOST']; ?>/assets/images/screenshot-story.png">
    
    <!-- App Store Links -->
    <meta name="apple-itunes-app" content="app-argument=swipeandlearn://story/story/<?php echo $shareCode; ?>">
    
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .container {
            background: white;
            border-radius: 20px;
            padding: 40px;
            max-width: 500px;
            width: 100%;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        
        .logo {
            width: 80px;
            height: 80px;
            border-radius: 20px;
            margin: 0 auto 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }
        
        .logo img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .title {
            font-size: 28px;
            font-weight: bold;
            color: #333;
            margin-bottom: 20px;
            line-height: 1.3;
        }
        
        .subtitle {
            font-size: 16px;
            color: #666;
            margin-bottom: 30px;
            line-height: 1.5;
        }
        
        .story-info {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 30px;
            text-align: left;
        }
        
        .story-title {
            font-size: 20px;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
        }
        
        .story-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 15px;
        }
        
        .meta-item {
            background: #e9ecef;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 14px;
            color: #495057;
            font-weight: 500;
        }
        
        .story-description {
            font-size: 14px;
            color: #666;
            line-height: 1.5;
        }
        
        .download-section {
            margin-bottom: 30px;
        }
        
        .download-title {
            font-size: 18px;
            font-weight: bold;
            color: #333;
            margin-bottom: 20px;
        }
        
        .download-buttons {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        
        .download-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 16px 24px;
            border-radius: 12px;
            text-decoration: none;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
        }
        
        .download-btn.primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        
        .download-btn.primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }
        
        .download-btn.secondary {
            background: #f8f9fa;
            color: #333;
            border: 2px solid #e9ecef;
        }
        
        .download-btn.secondary:hover {
            background: #e9ecef;
        }
        
        .app-icon {
            width: 24px;
            height: 24px;
            margin-right: 12px;
            border-radius: 6px;
        }
        
        .footer {
            font-size: 14px;
            color: #999;
            line-height: 1.5;
        }
        
        @media (max-width: 480px) {
            .container {
                padding: 30px 20px;
            }
            
            .title {
                font-size: 24px;
            }
            
            .story-title {
                font-size: 18px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <img src="/assets/images/icon.png" alt="Swipe and Learn" onerror="this.style.display='none'; this.parentElement.innerHTML='SL'; this.parentElement.style.fontSize='24px'; this.parentElement.style.fontWeight='bold'; this.parentElement.style.color='white';">
        </div>
        
        <h1 class="title">Someone shared a story with you!</h1>
        <p class="subtitle">Download Swipe and Learn to read this interactive language learning story and improve your skills.</p>
        
        <div class="story-info">
            <div class="story-title"><?php echo htmlspecialchars($storyData['title']); ?></div>
            <div class="story-meta">
                <span class="meta-item"><?php echo htmlspecialchars(ucfirst($storyData['language'])); ?></span>
                <span class="meta-item">CEFR <?php echo htmlspecialchars(strtoupper($storyData['difficulty'])); ?></span>
                <?php if ($storyData['theme']): ?>
                    <span class="meta-item"><?php echo htmlspecialchars(ucfirst($storyData['theme'])); ?></span>
                <?php endif; ?>
                <span class="meta-item"><?php echo $storyData['total_pages']; ?> pages</span>
            </div>
            <div class="story-description">
                This is an interactive story designed to help you learn <?php echo htmlspecialchars($storyData['language']); ?> at the <?php echo htmlspecialchars(strtoupper($storyData['difficulty'])); ?> level. 
                <?php if ($storyData['theme']): ?>
                    The story explores the theme of <?php echo htmlspecialchars($storyData['theme']); ?>.
                <?php endif; ?>
            </div>
        </div>
        
        <div class="download-section">
            <h2 class="download-title">Download the App</h2>
            <div class="download-buttons">
                <a href="swipeandlearn://story/story/<?php echo $shareCode; ?>" class="download-btn primary" id="openApp">
                    <div class="app-icon">📱</div>
                    Open in Swipe and Learn
                </a>
                <a href="https://play.google.com/store/apps/details?id=com.latovi.swipeandlearn" class="download-btn secondary" target="_blank">
                    <div class="app-icon">🤖</div>
                    Download on Google Play
                </a>
            </div>
        </div>
        
        <div class="footer">
            <p>Swipe and Learn helps you learn languages through interactive stories. 
            Each story is personalized to your level and includes vocabulary practice, 
            audio narration, and instant translations.</p>
        </div>
    </div>
    
    <script>
        // Try to open the app immediately
        function openApp() {
            const appUrl = 'swipeandlearn://story/story/<?php echo $shareCode; ?>';
            window.location.href = appUrl;
        }
        
        // Check if the app opened successfully
        function checkAppOpened() {
            // If we're still on this page after 2 seconds, the app probably didn't open
            setTimeout(function() {
                // The user is still here, so the app didn't open
                console.log('App not installed or failed to open');
            }, 2000);
        }
        
        // Try to open app when page loads
        document.addEventListener('DOMContentLoaded', function() {
            // Try to open the app
            openApp();
            checkAppOpened();
        });
        
        // Also try when the "Open in App" button is clicked
        document.getElementById('openApp').addEventListener('click', function(e) {
            e.preventDefault();
            openApp();
            checkAppOpened();
        });
    </script>
</body>
</html> 