# Test Indian Products API
Write-Host "`nTesting Indian Products API...`n" -ForegroundColor Cyan

try {
    Write-Host "Test 1: Getting products..." -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/products?limit=3" -Method Get
    Write-Host "SUCCESS - Total Products: $($response.total)" -ForegroundColor Green
    
    Write-Host "`nProducts:" -ForegroundColor Cyan
    foreach ($product in $response.products) {
        Write-Host "  $($product.name.en) - Rs.$($product.pricing.selling)" -ForegroundColor White
    }
    
    Write-Host "`nTest 2: Getting featured..." -ForegroundColor Yellow
    $featured = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/products/featured" -Method Get
    Write-Host "SUCCESS - Featured: $($featured.Count)" -ForegroundColor Green
    
    Write-Host "`nALL TESTS PASSED!`n" -ForegroundColor Green
    
} catch {
    Write-Host "`nERROR: $($_.Exception.Message)`n" -ForegroundColor Red
    Write-Host "Start backend: cd backend; npm start`n" -ForegroundColor Yellow
}
