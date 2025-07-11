<?php
/**
 * Configuration file for Supabase credentials
 * 
 * Create a .env file in the same directory with:
 * SUPABASE_URL=https://your-project-id.supabase.co
 * SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
 * ENVIRONMENT=development
 */

// Load .env file if it exists
if (file_exists(__DIR__ . '/.env')) {
    $envFile = file_get_contents(__DIR__ . '/.env');
    $lines = explode("\n", $envFile);
    
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line && strpos($line, '=') !== false && strpos($line, '#') !== 0) {
            list($key, $value) = explode('=', $line, 2);
            $_ENV[trim($key)] = trim($value);
        }
    }
}

// Define configuration constants
define('SUPABASE_URL', $_ENV['SUPABASE_URL'] ?? 'https://your-project-id.supabase.co');
define('SUPABASE_SERVICE_ROLE_KEY', $_ENV['SUPABASE_SERVICE_ROLE_KEY'] ?? 'your-service-role-key-here');
define('ENVIRONMENT', $_ENV['ENVIRONMENT'] ?? 'development');

// CORS headers
function setCorsHeaders() {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Content-Type: application/json');
}

// Validate required configuration
function validateConfig() {
    if (SUPABASE_URL === 'https://your-project-id.supabase.co' || 
        SUPABASE_SERVICE_ROLE_KEY === 'your-service-role-key-here') {
        return false;
    }
    return true;
}
?> 