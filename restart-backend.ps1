# Restart backend service only

Write-Host "🛑 Stopping backend service..." -ForegroundColor Yellow
docker-compose stop camp-backend

Write-Host "🚀 Starting backend service..." -ForegroundColor Green
docker-compose up -d camp-backend

Write-Host "✅ Backend service restarted!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Backend API: http://localhost:8000"
Write-Host "📚 API Docs: http://localhost:8000/docs"
Write-Host "🔍 Health Check: http://localhost:8000/health"
Write-Host ""
Write-Host "📊 To view logs: docker-compose logs -f camp-backend" -ForegroundColor Cyan

# Wait a moment for the service to start
Start-Sleep -Seconds 3

# Test the service
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/test" -UseBasicParsing
    Write-Host "✅ Backend is responding correctly!" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend is not responding yet. Please wait a moment and try again." -ForegroundColor Red
}
