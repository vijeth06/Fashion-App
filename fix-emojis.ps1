# Fix garbled emojis in source files
$files = @(
    "src\pages\Recommendations.jsx",
    "src\pages\AIFeatures.jsx",
    "src\pages\Home.jsx",
    "src\pages\Home.js",
    "src\pages\Favorites.js",
    "src\pages\Checkout.jsx",
    "src\pages\QuantumTryOnPage.jsx",
    "src\pages\EnhancedTryOn.jsx",
    "src\utils\socialSharing.js",
    "src\utils\authDebug.js",
    "src\utils\apiConnectionTester.js",
    "src\services\DevelopmentPhaseTracker.js",
    "src\services\advancedPaymentService.js",
    "src\services\database.js",
    "src\services\ClothSegmentationService.js",
    "src\services\api.js",
    "src\web3\fashionEcosystem.js",
    "src\sustainability\sustainabilityEngine.js",
    "src\social\collaborationEngine.js",
    "src\payments\advancedPaymentSystem.js"
)

$replacements = @{
    'ðŸŽ¯' = '🎯'
    'ðŸ"…' = '📅'
    'ðŸ"¥' = '🔥'
    'ðŸ'"' = '👔'
    'ðŸ'•' = '👕'
    'ðŸ'¼' = '💼'
    'ðŸŽ‰' = '🎉'
    'ðŸ'ª' = '💪'
    'ðŸ–ï¸' = '🏖️'
    'â¤ï¸' = '❤️'
    'ðŸ"' = '🔍'
    'ðŸš€' = '🚀'
    'ðŸ"ˆ' = '📈'
    'ðŸ"„' = '🔄'
    'ðŸ"Š' = '📊'
    'âœ…' = '✅'
    'ðŸ"‹' = '📋'
    'ðŸŒ' = '🌍'
    'ðŸ"˜' = '📘'
    'ðŸ¦' = '🦅'
    'ðŸ"·' = '📷'
    'ðŸ'¬' = '💬'
    'ðŸ"Œ' = '📌'
    'ðŸ"§' = '📧'
    'ðŸ"—' = '🔗'
    'ðŸ§ª' = '🧪'
    'ðŸ'¤' = '👤'
    'ðŸŒ±' = '🌱'
    'ðŸ"´' = '🔴'
    'ðŸŽ¨' = '🎨'
    'ðŸ—'ï¸' = '🗑️'
    'ðŸ'°' = '💰'
    'ðŸ'³' = '💳'
    'ðŸ"±' = '📱'
    'ðŸ'µ' = '💵'
    'ðŸ…¿ï¸' = '🅿️'
    'ðŸŽ' = '🎁'
    'ðŸŒŸ' = '🌟'
    'ðŸ¥»' = '🥻'
    'ðŸ§¥' = '🧥'
    'ðŸ'–' = '👖'
    'ðŸ‡®ðŸ‡³' = '🇮🇳'
    'ðŸ§ ' = '🧠'
    'ðŸ"®' = '🔮'
    'ðŸ"¸' = '📸'
    'ðŸ›'' = '🛒'
    'ðŸ"Œ' = '🔌'
}

$count = 0
foreach ($file in $files) {
    $filePath = Join-Path $PSScriptRoot $file
    if (Test-Path $filePath) {
        try {
            $content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)
            $modified = $false
            
            foreach ($key in $replacements.Keys) {
                if ($content.Contains($key)) {
                    $content = $content.Replace($key, $replacements[$key])
                    $modified = $true
                }
            }
            
            if ($modified) {
                # Write without BOM
                [System.IO.File]::WriteAllText($filePath, $content, [System.Text.UTF8Encoding]::new($false))
                $count++
                Write-Host "✓ Fixed: $file"
            }
        }
        catch {
            Write-Host "✗ Error processing: $file - $_"
        }
    }
}

Write-Host "`n✓ Total files fixed: $count"
