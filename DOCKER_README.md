# CAMP Docker Containerization

This document provides instructions for containerizing and running the Cloud Asset Management Platform (CAMP) using Docker.

## Services

The CAMP platform consists of three main services:

1. **camp-backend** - FastAPI backend service (Port 8000)
2. **camp-web** - Web frontend service (Port 3004)
3. **camp-auth** - Authentication frontend service (Port 3000)

## Prerequisites

- Docker installed on your system
- Docker Compose installed on your system

## Quick Start

### Option 1: Using the Build Script

**Windows:**
```bash
.\build.bat
```

**Linux/Mac:**
```bash
chmod +x build.sh
./build.sh
```

### Option 2: Manual Commands

1. **Build all services:**
```bash
docker-compose build
```

2. **Start all services:**
```bash
docker-compose up -d
```

3. **View logs:**
```bash
docker-compose logs -f
```

4. **Stop services:**
```bash
docker-compose down
```

## Access URLs

Once the services are running, you can access them at:

- **Auth Frontend:** http://localhost:3000
- **Web Frontend:** http://localhost:3004
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs

## Docker Configuration

### Backend (camp-backend)
- **Base Image:** Python 3.11-slim
- **Port:** 8000
- **Volumes:** 
  - `./camp-backend/uploads:/app/uploads` (for file uploads)
  - `./camp-backend/camp.db:/app/camp.db` (for database persistence)
- **Health Check:** HTTP check on `/health` endpoint

### Web Frontend (camp-web)
- **Base Image:** Python 3.11-slim
- **Port:** 3004
- **Health Check:** HTTP check on root endpoint

### Auth Frontend (camp-auth)
- **Base Image:** Nginx Alpine
- **Port:** 3000 (mapped to container port 80)
- **Health Check:** HTTP check on root endpoint

## Development

### Building Individual Services

```bash
# Build backend only
docker-compose build camp-backend

# Build web frontend only
docker-compose build camp-web

# Build auth frontend only
docker-compose build camp-auth
```

### Running Individual Services

```bash
# Run backend only
docker-compose up -d camp-backend

# Run web frontend only
docker-compose up -d camp-web

# Run auth frontend only
docker-compose up -d camp-auth
```

### Viewing Logs for Specific Service

```bash
# Backend logs
docker-compose logs -f camp-backend

# Web frontend logs
docker-compose logs -f camp-web

# Auth frontend logs
docker-compose logs -f camp-auth
```

## Environment Variables

The backend service can be configured using environment variables:

- `DATABASE_URL`: Database connection string (default: sqlite:///./camp.db)
- `DEBUG`: Enable debug mode (default: false)
- `LOG_LEVEL`: Logging level (default: info)

## Volumes

- **camp-uploads:** Persistent storage for uploaded files
- **camp-database:** Persistent storage for the SQLite database

## Network

All services are connected to a shared Docker network named `camp-network` for inter-service communication.

## Troubleshooting

### Port Conflicts
If you encounter port conflicts, you can modify the port mappings in `docker-compose.yml`:
```yaml
ports:
  - "8001:8000"  # Change host port from 8000 to 8001
```

### Permission Issues
On Linux, you might need to adjust permissions for the uploads directory:
```bash
sudo chmod -R 755 ./camp-backend/uploads
```

### Rebuilding Services
If you make changes to the code, rebuild the affected service:
```bash
docker-compose build camp-backend
docker-compose up -d camp-backend
```

### Cleaning Up
To remove all containers, networks, and volumes:
```bash
docker-compose down -v
docker system prune -f
```
