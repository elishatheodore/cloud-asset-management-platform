#!/bin/bash

# CAMP Docker Restart Script
# This script rebuilds and restarts all CAMP services

set -e

echo "🛑 Stopping CAMP services..."
docker-compose down

echo "🧹 Cleaning up containers and images..."
docker-compose down --rmi all

echo "🚀 Rebuilding CAMP Docker containers..."
docker-compose build --no-cache

echo "🏃 Starting CAMP services..."
docker-compose up -d

echo "✅ CAMP services restarted successfully!"
echo ""
echo "🌐 Access URLs:"
echo "   - Auth Frontend: http://localhost:3000"
echo "   - Web Frontend:  http://localhost:3004"
echo "   - Backend API:   http://localhost:8000"
echo ""
echo "📊 To view logs: docker-compose logs -f"
echo "🧪 To test backend: curl http://localhost:8000/test"
echo "🔍 To check health: curl http://localhost:8000/health"
