# GitHub Container Registry (GHCR) Setup Guide

This guide will help you push your CAMP Docker images to GitHub Container Registry.

## Prerequisites

1. **GitHub Account** with a repository
2. **Docker Desktop** or Docker Engine installed
3. **Git CLI** (for authentication)

## Step-by-Step Instructions

### Step 1: Create a GitHub Personal Access Token

1. Go to **GitHub Settings** > **Developer settings** > **Personal access tokens** > **Tokens (classic)**
2. Click **Generate new token** (or **Generate new token (classic)**)
3. Configure the token:
   - **Note**: Enter a descriptive name (e.g., "CAMP Docker Push")
   - **Expiration**: Choose an appropriate expiration period
   - **Scopes**: Check the following:
     - ✅ `write:packages` - Required to push packages
     - ✅ `read:packages` - Required to pull packages
     - ✅ `repo` - Required to access the repository

4. Click **Generate token**
5. **Important**: Copy the token immediately as you won't be able to see it again

### Step 2: Authenticate with GitHub Container Registry

```bash
# Method 1: Using Personal Access Token
echo YOUR_GITHUB_TOKEN | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin

# Method 2: Using GitHub CLI (if installed)
gh auth login
gh auth token
```

Replace:
- `YOUR_GITHUB_TOKEN` with the token you created
- `YOUR_GITHUB_USERNAME` with your GitHub username

### Step 3: Configure the Push Script

Edit the `push-to-ghcr.sh` script and update these variables:

```bash
GITHUB_USERNAME="your-github-username"  # Replace with your actual GitHub username
REPO_NAME="kubernetes-microservices"    # Keep this as is, or change if your repo name is different
VERSION="latest"                         # You can change this to a version number like "v1.0.0"
```

### Step 4: Make the Script Executable and Run

```bash
# Make the script executable
chmod +x push-to-ghcr.sh

# Run the push script
./push-to-ghcr.sh
```

### Step 5: Verify Images in GHCR

1. Go to your GitHub repository
2. Click on **Packages** tab
3. You should see three container packages:
   - `camp-backend`
   - `camp-web`
   - `camp-auth`

## Using Images from GHCR

### Option 1: Using the GHCR Docker Compose File

1. Edit `docker-compose.ghcr.yml` and replace `your-github-username` with your actual username
2. Run:
```bash
docker-compose -f docker-compose.ghcr.yml up -d
```

### Option 2: Pull Individual Images

```bash
# Pull backend
docker pull ghcr.io/YOUR_USERNAME/kubernetes-microservices/camp-backend:latest

# Pull web frontend
docker pull ghcr.io/YOUR_USERNAME/kubernetes-microservices/camp-web:latest

# Pull auth frontend
docker pull ghcr.io/YOUR_USERNAME/kubernetes-microservices/camp-auth:latest
```

## Versioning

### Tagging with Version Numbers

To push with a specific version:

```bash
# Edit the VERSION variable in push-to-ghcr.sh
VERSION="v1.0.0"
./push-to-ghcr.sh
```

### Pushing Multiple Tags

You can modify the script to push multiple tags:

```bash
# Add these lines to the script after each docker build
docker tag ${BACKEND_IMAGE} ghcr.io/${GITHUB_USERNAME}/${REPO_NAME}/camp-backend:latest
docker push ghcr.io/${GITHUB_USERNAME}/${REPO_NAME}/camp-backend:latest
```

## Security Best Practices

1. **Use GitHub Actions**: Automate the build and push process
2. **Limit token scope**: Only grant necessary permissions
3. **Use short-lived tokens**: Regularly rotate your access tokens
4. **Private repositories**: Keep sensitive images in private repos

## Troubleshooting

### Common Issues

1. **Authentication Error**:
   ```bash
   # Re-authenticate
   echo YOUR_NEW_TOKEN | docker login ghcr.io -u YOUR_USERNAME --password-stdin
   ```

2. **Permission Denied**:
   - Ensure your token has `write:packages` scope
   - Check if the repository exists and you have push access

3. **Image Already Exists**:
   - Change the VERSION variable
   - Or use `docker push --force` (not recommended for production)

### Useful Commands

```bash
# List all GHCR images
docker images | grep ghcr.io

# Remove local GHCR images
docker rmi $(docker images "ghcr.io/*" -q)

# Check authentication status
docker info | grep -i registry
```

## GitHub Actions (Optional)

For automated builds, create `.github/workflows/docker.yml`:

```yaml
name: Build and Push Docker Images

on:
  push:
    branches: [ main ]
    tags: [ 'v*' ]

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Log in to Container Registry
      uses: docker/login-action@v2
      with:
        registry: ghcr.io
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Build and push backend
      uses: docker/build-push-action@v4
      with:
        context: ./camp-backend
        push: true
        tags: ghcr.io/${{ github.repository }}/camp-backend:latest
    
    - name: Build and push web
      uses: docker/build-push-action@v4
      with:
        context: ./camp-web-frontend
        push: true
        tags: ghcr.io/${{ github.repository }}/camp-web:latest
    
    - name: Build and push auth
      uses: docker/build-push-action@v4
      with:
        context: ./camp-auth-frontend
        push: true
        tags: ghcr.io/${{ github.repository }}/camp-auth:latest
```

This will automatically build and push your images whenever you push to the main branch or create a version tag.
