@echo off
REM CAMP Docker Build and Run Script for Windows
REM This script builds and runs all CAMP services in Docker containers

echo 🚀 Building CAMP Docker containers...

REM Build all services
echo 📦 Building camp-backend...
docker-compose build camp-backend

echo 📦 Building camp-web...
docker-compose build camp-web

echo 📦 Building camp-auth...
docker-compose build camp-auth

echo ✅ All containers built successfully!

REM Start all services
echo 🏃 Starting CAMP services...
docker-compose up -d

echo ✅ CAMP services are now running!
echo.
echo 🌐 Access URLs:
echo    - Auth Frontend: http://localhost:3000
echo    - Web Frontend:  http://localhost:3004
echo    - Backend API:   http://localhost:8000
echo.
echo 📊 To view logs: docker-compose logs -f
echo 🛑 To stop: docker-compose down
pause
