# Cloud Asset Management Platform (CAMP)

A comprehensive, production-ready full-stack application for secure cloud asset management with authentication, file upload, storage, and management capabilities. Now fully containerized with Docker support and GitHub Container Registry integration.

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           Cloud Asset Management Platform                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐              │
│  │   Auth Frontend │    │  Main Frontend  │    │    Backend      │              │
│  │   (Port 3000)   │    │   (Port 3004)   │    │   (Port 8000)   │              │
│  │                 │    │                 │    │                 │              │
│  │ • Login Page    │◄──►│ • File Manager  │◄──►│ • FastAPI       │              │
│  │ • Security      │    │ • Upload UI     │    │ • SQLAlchemy    │              │
│  │ • Validation    │    │ • Asset Grid    │    │ • SQLite DB     │              │
│  │ • Redirection   │    │ • Real-time     │    │ • File Storage  │              │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘              │
│           │                       │                       │                      │
│           └───────────────────────┼───────────────────────┘                      │
│                                   │                                              │
│                          ┌─────────────────┐                                      │
│                          │   File Storage  │                                      │
│                          │   (Local Disk)  │                                      │
│                          │                 │                                      │
│                          │ • uploads/      │                                      │
│                          │ • Metadata DB   │                                      │
│                          │ • camp.db       │                                      │
│                          └─────────────────┘                                      │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 🐳 Docker Containerization

This project is fully containerized with Docker support:

### Container Images
- **Backend**: `ghcr.io/elishatheodore/kubernetes-microservices/camp-backend:latest`
- **Web Frontend**: `ghcr.io/elishatheodore/kubernetes-microservices/camp-web:latest`
- **Auth Frontend**: `ghcr.io/elishatheodore/kubernetes-microservices/camp-auth:latest`

### Quick Docker Start
```bash
# Using pre-built images from GHCR
docker-compose -f docker-compose.ghcr.yml up -d

# Or build locally
docker-compose up -d
```

### Container Access URLs
- **Auth Frontend**: http://localhost:3000
- **Web Frontend**: http://localhost:3004
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 📁 Project Structure

```
kubernetes-microservices/
├── README.md                    # Main project documentation
├── DOCKER_README.md            # Docker-specific documentation
├── GHCR_SETUP.md               # GitHub Container Registry guide
├── docker-compose.yml          # Local Docker compose
├── docker-compose.ghcr.yml    # GHCR Docker compose
├── build.sh / build.bat        # Build scripts
├── restart.sh / restart.bat    # Restart scripts
├── push-to-ghcr.sh             # GHCR push script
├── setup-ghcr.sh               # GHCR setup script
│
├── camp-backend/                # FastAPI Python Backend
│   ├── README.md               # Backend documentation
│   ├── requirements.txt        # Python dependencies
│   ├── run.py                  # Backend entry point
│   ├── Dockerfile              # Backend container definition
│   ├── .dockerignore           # Docker build exclusions
│   ├── .env                    # Backend environment config
│   ├── camp.db                 # SQLite database (auto-created)
│   ├── uploads/                # File storage directory
│   └── app/
│       ├── main.py            # FastAPI application
│       ├── api/               # API routers
│       │   └── assets.py      # Asset management endpoints
│       ├── core/              # Core configuration
│       │   ├── config.py      # Settings and environment
│       │   ├── middleware.py  # Error handling middleware
│       │   └── logging.py     # Logging configuration
│       ├── models/            # Database models
│       │   └── asset.py       # SQLAlchemy asset model
│       ├── schemas/           # Pydantic schemas
│       │   └── asset.py       # API request/response models
│       ├── services/          # Business logic
│       │   ├── storage.py     # Abstract storage service
│       │   └── asset_service.py # Asset business logic
│       └── db/                # Database configuration
│           └── database.py     # Database setup and sessions
│
├── camp-web-frontend/          # Main Web Frontend
│   ├── README.md              # Frontend documentation
│   ├── serve.py               # Development server
│   ├── Dockerfile             # Web frontend container
│   ├── .dockerignore          # Docker build exclusions
│   ├── package.json           # Node.js dependencies
│   ├── index.html             # Main application
│   ├── styles.css             # Custom CSS (dark theme)
│   ├── config.js              # API configuration
│   ├── api-client.js          # API communication
│   ├── app.js                 # Application logic
│   ├── api-tester.js          # API testing interface
│   ├── debug.html             # Debug interface
│   └── API_DOCUMENTATION.md   # API usage guide
│
└── camp-auth-frontend/         # Authentication Frontend
    ├── README.md              # Auth documentation
    ├── Dockerfile             # Auth frontend container
    ├── .dockerignore          # Docker build exclusions
    ├── nginx.conf             # Nginx configuration
    ├── index.html             # Login page
    ├── styles.css             # Auth styling (matching theme)
    └── app.js                 # Authentication logic
```

## 🚀 Quick Start

### 🐳 Docker (Recommended)

```bash
# Option 1: Use pre-built images from GitHub Container Registry
docker-compose -f docker-compose.ghcr.yml up -d

# Option 2: Build locally
docker-compose up -d

# Option 3: Use build scripts
# Windows
.\build.bat
# Linux/Mac
./build.sh
```

### 📍 Access URLs (Docker)
- **Auth Frontend**: http://localhost:3000
- **Web Frontend**: http://localhost:3004
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

### 💻 Local Development

#### Prerequisites
- Python 3.8+
- Modern web browser
- Terminal/command prompt

#### 1. Start the Backend
```bash
cd camp-backend
python run.py
```
Backend will run on: `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

#### 2. Start the Main Frontend
```bash
cd camp-web-frontend
python serve.py
```
Frontend will be available at: `http://localhost:3004`

#### 3. Start the Auth Frontend
```bash
cd camp-auth-frontend
python -m http.server 3000
```
Auth page will be available at: `http://localhost:3000`

#### 4. Use the Application
1. **Login**: Visit `http://localhost:3000` and authenticate
   - Username: `admin`
   - Password: `admin123`
2. **Redirect**: After successful login, you'll be redirected to the main app
3. **Manage Files**: Upload, view, rename, and delete assets

## ✨ Features

### 🔐 Authentication System
- **Secure Login**: Enterprise-grade authentication with security features
- **Session Management**: 30-minute session timeout
- **Account Lockout**: 5 failed attempts → 15-minute lockout
- **Input Validation**: Comprehensive client-side validation
- **Accessibility**: WCAG compliant for screen readers
- **Theme Consistency**: Perfect integration with main app design

### 🗄️ Backend (FastAPI)
- **File Upload**: Secure file upload with validation
- **Asset Management**: List, rename, delete operations
- **Database**: SQLite with SQLAlchemy ORM
- **API Documentation**: Auto-generated OpenAPI/Swagger docs
- **Error Handling**: Comprehensive error responses
- **CORS Support**: Cross-origin resource sharing
- **Logging**: Structured logging with configurable levels

### 🎨 Frontend (HTML/CSS/JS)
- **Modern UI**: Dark theme matching CAMP design system
- **Responsive Design**: Mobile-friendly interface
- **Drag & Drop**: Intuitive file upload experience
- **Real-time Updates**: Live file management
- **Notifications**: Success/error feedback system
- **Accessibility**: ARIA labels and keyboard navigation

## 🔧 Technical Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - Database ORM
- **SQLite** - File-based database (development)
- **Pydantic** - Data validation and serialization
- **Uvicorn** - ASGI server
- **Python** - Programming language (3.8+)

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Custom styling with dark theme
- **JavaScript (ES6+)** - Modern client-side logic
- **Font Awesome** - Icon library
- **Fetch API** - HTTP requests

### Authentication
- **Vanilla JS** - No external dependencies
- **localStorage** - Session management
- **CSS Animations** - Smooth transitions
- **WCAG Compliance** - Accessibility features

## 📡 API Endpoints

### Health & System
- `GET /` - Service health check and basic info
- `GET /health` - Detailed health status with database checks
- `GET /test` - Simple endpoint for connectivity testing

### Asset Management
- `POST /api/v1/upload` - Upload file with metadata
- `GET /api/v1/files` - List all assets with pagination
- `PUT /api/v1/files/{id}` - Update asset metadata
- `DELETE /api/v1/files/{id}` - Delete asset by ID

### Response Format
```json
{
  "success": true,
  "data": {...},
  "message": "Operation completed",
  "timestamp": "2026-04-04T14:30:00Z"
}
```

## 🐳 Docker Configuration

### Container Images
- **Backend**: `ghcr.io/elishatheodore/kubernetes-microservices/camp-backend:latest`
- **Web Frontend**: `ghcr.io/elishatheodore/kubernetes-microservices/camp-web:latest`
- **Auth Frontend**: `ghcr.io/elishatheodore/kubernetes-microservices/camp-auth:latest`

### Container Features
- **Health Checks**: All containers include health monitoring
- **Volume Mounting**: Persistent storage for uploads and database
- **Networking**: Dedicated Docker network for inter-service communication
- **Environment Variables**: Configurable settings for different environments

### Docker Commands
```bash
# Build and run locally
docker-compose up -d

# Use GHCR images
docker-compose -f docker-compose.ghcr.yml up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild with no cache
docker-compose build --no-cache
```

## 🚀 GitHub Container Registry (GHCR)

### Push Images to GHCR
```bash
# Setup authentication
echo YOUR_GITHUB_TOKEN | docker login ghcr.io -u elishatheodore --password-stdin

# Push all images
bash push-to-ghcr.sh

# Or setup interactively
bash setup-ghcr.sh
```

### Available Images
- `ghcr.io/elishatheodore/kubernetes-microservices/camp-backend:latest`
- `ghcr.io/elishatheodore/kubernetes-microservices/camp-web:latest`
- `ghcr.io/elishatheodore/kubernetes-microservices/camp-auth:latest`

### View Packages
https://github.com/elishatheodore/kubernetes-microservices/pkgs/container

## 🗄 Database Schema

### Assets Table
```sql
CREATE TABLE assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    content_type VARCHAR(100),
    file_size INTEGER,
    upload_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 📁 File Storage

### Local Storage (Default)
- **Directory**: `camp-backend/uploads/`
- **Supported Formats**: All file types
- **Size Limit**: 50MB per file (configurable)
- **Naming**: UUID-based unique filenames
- **Organization**: Flat structure with metadata tracking

### Security Features
- **File Type Validation**: Prevents executable uploads
- **Size Limits**: Configurable maximum file sizes
- **Secure Names**: UUID-based filenames prevent conflicts
- **Path Validation**: Prevents directory traversal attacks

## 🔒 Security Architecture

### Authentication Layer
- **Input Sanitization**: XSS prevention
- **Brute Force Protection**: Account lockout mechanism
- **Session Security**: Timeout-based session management
- **Secure Storage**: Proper localStorage cleanup

### API Security
- **CORS Configuration**: Restricted cross-origin access
- **File Validation**: Type and size verification
- **Error Handling**: No sensitive information leakage
- **Rate Limiting**: Implicit through authentication flow

### Data Protection
- **Input Validation**: Comprehensive server-side validation
- **File Security**: Secure upload and storage practices
- **Environment Variables**: Sensitive config protection
- **Logging Security**: No sensitive data in logs

## 🌐 Network Architecture

```
User Browser
    │
    ├─► Auth Frontend (8081) ──► Main Frontend (3004)
    │                                      │
    │                                      ▼
    │                                 Backend API (8000)
    │                                      │
    │                                      ▼
    │                              SQLite Database + Files
    │
    └─► Direct API Access (8000/docs)
```

## 🛠 Development Setup

### Backend Development
```bash
cd camp-backend
# Install dependencies
pip install -r requirements.txt
# Run development server
python run.py
```

### Frontend Development
```bash
cd camp-web-frontend
# Serve with Python
python serve.py
# Or use Node.js
npm install
npm start
```

### Auth Development
```bash
cd camp-auth-frontend
# Simple HTTP server
python -m http.server 8081
# Or open directly in browser
open index.html
```

## 🚀 Deployment Architecture

### Development Environment
- **Backend**: Local SQLite + Uvicorn
- **Frontend**: Python HTTP server
- **Auth**: Static file serving
- **Database**: Local SQLite file

### Production Architecture (Future)
- **Backend**: Docker + Gunicorn + PostgreSQL
- **Frontend**: Nginx static serving
- **Auth**: Integrated with main app
- **Database**: PostgreSQL or Azure SQL
- **Storage**: Azure Blob Storage
- **Load Balancer**: Azure Application Gateway

## 📊 Performance Considerations

### Backend Optimization
- **Database Indexing**: Primary key and timestamp indexes
- **File Streaming**: Efficient file upload/download
- **Memory Management**: Proper resource cleanup
- **Async Operations**: Non-blocking I/O with FastAPI

### Frontend Optimization
- **Lazy Loading**: Load files on demand
- **Caching**: Browser cache optimization
- **Compression**: Gzip for API responses
- **Bundle Size**: Minimal external dependencies

### Security Performance
- **Rate Limiting**: Prevent abuse
- **Input Validation**: Early rejection of invalid data
- **File Size Limits**: Prevent resource exhaustion
- **Session Management**: Efficient cleanup

## 📱 Browser Support

- **Chrome** 90+ (recommended)
- **Firefox** 88+
- **Safari** 14+
- **Edge** 90+

## 🔧 Configuration

### Environment Variables (.env)
```env
# Database Configuration
DATABASE_URL=sqlite:///./camp.db

# Storage Configuration
STORAGE_TYPE=local
LOCAL_STORAGE_PATH=./uploads
MAX_FILE_SIZE=52428800  # 50MB

# Application Configuration
APP_NAME=Cloud Asset Management Platform
APP_VERSION=1.0.0
DEBUG=True
LOG_LEVEL=INFO

# CORS Configuration
CORS_ORIGINS=["http://localhost:3004", "http://localhost:8081"]
```

### Frontend Configuration (config.js)
```javascript
const API_BASE_URL = 'http://localhost:8000';
const APP_VERSION = '1.0.0';
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
```

## 🧪 Testing

### Backend Testing
```bash
cd camp-backend
# Run tests (if available)
pytest
# Check API health
curl http://localhost:8000/health
```

### Frontend Testing
- **Manual Testing**: Use browser developer tools
- **API Testing**: Built-in API tester in debug.html
- **Cross-browser**: Test on multiple browsers

## 📚 Documentation

- **Backend API**: `http://localhost:8000/docs`
- **Frontend Guide**: `camp-web-frontend/README.md`
- **Auth System**: `camp-auth-frontend/README.md`
- **API Usage**: `camp-web-frontend/API_DOCUMENTATION.md`

## 🔄 Integration Flow

1. **User Access**: Auth frontend validates credentials
2. **Session Creation**: Secure session token stored
3. **Redirect**: User sent to main application
4. **API Calls**: Frontend communicates with backend
5. **File Operations**: Upload, list, rename, delete
6. **Session Management**: Timeout and cleanup

## 🚀 Deployment Roadmap

### Phase 1: Current ✅
- ✅ Local SQLite database
- ✅ File system storage
- ✅ Development servers
- ✅ Basic authentication
- ✅ Docker containerization
- ✅ GitHub Container Registry integration

### Phase 2: Production Ready 🔄
- 🔄 PostgreSQL database
- 🔄 Docker Compose production configs
- 🔄 Nginx reverse proxy
- 🔄 Environment-based configuration
- 🔄 CI/CD pipelines

### Phase 3: Cloud Native 📋
- 📋 Azure Container Instances
- 📋 Azure Blob Storage
- 📋 Azure SQL Database
- 📋 Application Gateway
- 📋 Front Door CDN

## 🛠 Development & Operations

### Docker Development
```bash
# Development workflow
docker-compose up -d                    # Start services
docker-compose logs -f camp-backend     # View backend logs
docker-compose restart camp-backend     # Restart backend
docker-compose down                     # Stop all services

# Build and push
bash push-to-ghcr.sh                   # Push to GHCR
bash setup-ghcr.sh                     # Interactive setup
```

### Local Development
```bash
# Backend
cd camp-backend
python run.py                           # Start backend

# Frontend
cd camp-web-frontend
python serve.py                        # Start web frontend

# Auth
cd camp-auth-frontend
python -m http.server 3000            # Start auth frontend
```

### Testing
```bash
# Backend health check
curl http://localhost:8000/health

# API testing
curl http://localhost:8000/test

# Container health
docker-compose ps
```

## 📚 Documentation

- **Main Documentation**: This README.md
- **Docker Guide**: `DOCKER_README.md`
- **GHCR Setup**: `GHCR_SETUP.md`
- **Backend API**: `http://localhost:8000/docs`
- **Frontend Guide**: `camp-web-frontend/README.md`
- **Auth System**: `camp-auth-frontend/README.md`
- **API Usage**: `camp-web-frontend/API_DOCUMENTATION.md`

## 🔄 Integration Flow

1. **Container Startup**: Docker Compose orchestrates all services
2. **User Access**: Auth frontend validates credentials (Port 3000)
3. **Session Creation**: Secure session token stored
4. **Redirect**: User sent to main application (Port 3004)
5. **API Calls**: Frontend communicates with backend (Port 8000)
6. **File Operations**: Upload, list, rename, delete
7. **Session Management**: Timeout and cleanup
8. **Data Persistence**: Volume mounts for database and uploads

## 🎯 Production Considerations

### Security
- **Environment Variables**: All secrets in environment variables
- **Volume Permissions**: Proper file system permissions
- **Network Isolation**: Docker network segmentation
- **Health Monitoring**: Container health checks

### Performance
- **Resource Limits**: Container resource constraints
- **Database Optimization**: Proper indexing and queries
- **File Storage**: Efficient file handling
- **Caching**: Browser and API response caching

### Monitoring
- **Health Checks**: All services monitored
- **Logging**: Structured logging with levels
- **Metrics**: Container and application metrics
- **Alerting**: Health check failures

## 🤝 Contributing

1. **Fork** the repository
2. **Create** feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** changes (`git commit -m 'Add amazing feature'`)
4. **Test** locally with Docker
5. **Push** to branch (`git push origin feature/amazing-feature`)
6. **Open** Pull Request

### Development Guidelines
- Follow existing code style
- Add tests for new features
- Update documentation
- Test Docker containers
- Ensure accessibility compliance
- Test on multiple browsers

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support and questions:
1. Check existing documentation
2. Review API documentation at `/docs`
3. Check `DOCKER_README.md` for Docker issues
4. Review `GHCR_SETUP.md` for container registry issues
5. Open an issue in the repository
6. Check browser console for errors

---

**Built with ❤️ using FastAPI, Docker, HTML, CSS, JavaScript, and modern security practices**

**Version**: 1.0.0  
**Last Updated**: 2026-04-04  
**Status**: Production Ready (Docker Containerized)  
**Container Registry**: GitHub Container Registry (GHCR)
