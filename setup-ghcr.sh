#!/bin/bash

# Quick setup script for GHCR authentication and configuration

set -e

echo "🔧 GitHub Container Registry Setup"
echo "=================================="
echo ""

# Function to prompt for input
prompt() {
    local prompt_text="$1"
    local var_name="$2"
    local default_value="$3"
    
    if [ -n "$default_value" ]; then
        read -p "$prompt_text [$default_value]: " input
        if [ -z "$input" ]; then
            input="$default_value"
        fi
    else
        read -p "$prompt_text: " input
    fi
    
    eval "$var_name='$input'"
}

# Get user configuration
prompt "Enter your GitHub username" GITHUB_USERNAME
prompt "Enter your repository name" REPO_NAME "kubernetes-microservices"
prompt "Enter image version" VERSION "latest"

echo ""
echo "📝 Configuration:"
echo "GitHub Username: $GITHUB_USERNAME"
echo "Repository: $REPO_NAME"
echo "Version: $VERSION"
echo ""

# Check if user wants to proceed
read -p "Continue with this configuration? (y/N): " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo "❌ Setup cancelled."
    exit 1
fi

# Update the push script
echo ""
echo "📝 Updating push-to-ghcr.sh..."
sed -i "s/your-github-username/$GITHUB_USERNAME/g" push-to-ghcr.sh
sed -i "s/kubernetes-microservices/$REPO_NAME/g" push-to-ghcr.sh
sed -i "s/latest/$VERSION/g" push-to-ghcr.sh

# Update the GHCR docker-compose file
echo "📝 Updating docker-compose.ghcr.yml..."
sed -i "s/your-github-username/$GITHUB_USERNAME/g" docker-compose.ghcr.yml
sed -i "s/kubernetes-microservices/$REPO_NAME/g" docker-compose.ghcr.yml

echo "✅ Configuration files updated!"
echo ""

# Instructions for authentication
echo "🔐 Next Steps - Authentication:"
echo "1. Create a GitHub Personal Access Token:"
echo "   - Go to: https://github.com/settings/tokens"
echo "   - Click 'Generate new token (classic)'"
echo "   - Add scopes: write:packages, read:packages, repo"
echo ""
echo "2. Authenticate with GHCR:"
echo "   echo YOUR_GITHUB_TOKEN | docker login ghcr.io -u $GITHUB_USERNAME --password-stdin"
echo ""
echo "3. Push images:"
echo "   chmod +x push-to-ghcr.sh"
echo "   ./push-to-ghcr.sh"
echo ""
echo "📚 For detailed instructions, see GHCR_SETUP.md"
