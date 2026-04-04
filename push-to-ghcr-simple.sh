#!/bin/bash

# Simple GitHub Container Registry (GHCR) Push Script
# This script builds and pushes all CAMP Docker images to GHCR

set -e

# Configuration
GITHUB_USERNAME="elishatheodore"
REPO_NAME="kubernetes-microservices"
VERSION="latest"

# Image names
BACKEND_IMAGE="ghcr.io/${GITHUB_USERNAME}/${REPO_NAME}/camp-backend:${VERSION}"
WEB_IMAGE="ghcr.io/${GITHUB_USERNAME}/${REPO_NAME}/camp-web:${VERSION}"
AUTH_IMAGE="ghcr.io/${GITHUB_USERNAME}/${REPO_NAME}/camp-auth:${VERSION}"

echo "🚀 Pushing CAMP Docker images to GitHub Container Registry..."
echo "GitHub Username: ${GITHUB_USERNAME}"
echo "Repository: ${REPO_NAME}"
echo "Version: ${VERSION}"
echo ""

# Test authentication by trying a simple operation
echo "🔐 Testing GitHub Container Registry authentication..."
if ! docker pull ghcr.io/${GITHUB_USERNAME}/${REPO_NAME}/camp-backend:${VERSION} 2>/dev/null; then
    echo "⚠️  Authentication test failed, but continuing anyway..."
    echo "   If push fails, please run: echo YOUR_GITHUB_TOKEN | docker login ghcr.io -u ${GITHUB_USERNAME} --password-stdin"
    echo ""
fi

# Build and push backend image
echo ""
echo "📦 Building and pushing backend image..."
docker build -t ${BACKEND_IMAGE} ./camp-backend
docker push ${BACKEND_IMAGE}
echo "✅ Backend image pushed: ${BACKEND_IMAGE}"

# Build and push web frontend image
echo ""
echo "📦 Building and pushing web frontend image..."
docker build -t ${WEB_IMAGE} ./camp-web-frontend
docker push ${WEB_IMAGE}
echo "✅ Web frontend image pushed: ${WEB_IMAGE}"

# Build and push auth frontend image
echo ""
echo "📦 Building and pushing auth frontend image..."
docker build -t ${AUTH_IMAGE} ./camp-auth-frontend
docker push ${AUTH_IMAGE}
echo "✅ Auth frontend image pushed: ${AUTH_IMAGE}"

echo ""
echo "🎉 All images successfully pushed to GitHub Container Registry!"
echo ""
echo "📋 Image References:"
echo "Backend:  ${BACKEND_IMAGE}"
echo "Web:      ${WEB_IMAGE}"
echo "Auth:     ${AUTH_IMAGE}"
echo ""
echo "🔗 View your packages at: https://github.com/${GITHUB_USERNAME}/${REPO_NAME}/pkgs/container"
