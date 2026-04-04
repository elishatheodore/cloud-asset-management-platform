@echo off
REM Restart backend service only

echo 🛑 Stopping backend service...
docker-compose stop camp-backend

echo 🚀 Starting backend service...
docker-compose up -d camp-backend

echo ✅ Backend service restarted!
echo.
echo 🌐 Backend API: http://localhost:8000
echo 📚 API Docs: http://localhost:8000/docs
echo 🔍 Health Check: http://localhost:8000/health
echo.
echo 📊 To view logs: docker-compose logs -f camp-backend
pause
