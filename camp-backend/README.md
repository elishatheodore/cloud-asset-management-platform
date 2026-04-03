# Cloud Asset Management Platform (CAMP) Backend

A production-ready backend service for managing cloud assets built with Python and FastAPI.

## Features

- **File Upload**: Upload and store digital assets with metadata
- **File Management**: List and delete uploaded files
- **Health Check**: Service health monitoring
- **Scalable Architecture**: Modular design with separation of concerns
- **Cloud Ready**: Designed for Azure deployment with local storage fallback

## Architecture

The application follows a clean, modular architecture:

```
app/
├── main.py              # FastAPI application entry point
├── api/                 # API routers
│   ├── __init__.py
│   └── assets.py        # Asset management endpoints
├── core/                # Core configuration
│   ├── __init__.py
│   └── config.py        # Settings and environment variables
├── models/              # Database models
│   ├── __init__.py
│   └── asset.py         # Asset SQLAlchemy model
├── schemas/             # Pydantic schemas
│   ├── __init__.py
│   └── asset.py         # API request/response models
├── services/            # Business logic
│   ├── __init__.py
│   ├── storage.py       # Abstract storage service
│   └── asset_service.py # Asset business logic
└── db/                  # Database setup
    ├── __init__.py
    └── database.py      # SQLAlchemy configuration
```

## API Endpoints

### Health Check
- `GET /` - Service status

### Asset Management
- `POST /upload` - Upload a file
- `GET /files` - List all uploaded files
- `DELETE /files/{id}` - Delete a file by ID

## Quick Start

### Prerequisites

- Python 3.8+
- pip or poetry

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd camp-backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

### Running the Application

1. Start the development server:
```bash
python -m app.main
```

Or using uvicorn directly:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

2. Access the API:
- API Documentation: http://localhost:8000/docs
- Health Check: http://localhost:8000/

## Configuration

The application uses environment variables for configuration. See `.env` file:

```env
# Database Configuration
DATABASE_URL=sqlite:///./camp.db
# DATABASE_URL=postgresql://user:password@localhost/camp_db

# Storage Configuration
STORAGE_TYPE=local
LOCAL_STORAGE_PATH=./uploads

# Application Configuration
APP_NAME=Cloud Asset Management Platform
APP_VERSION=1.0.0
DEBUG=True
LOG_LEVEL=INFO
```

## Database

### SQLite (Default)
- Uses SQLite for local development
- Database file: `camp.db`

### PostgreSQL (Production)
- Set `DATABASE_URL` in environment variables
- Example: `postgresql://user:password@localhost/camp_db`

## Storage

### Local Storage (Default)
- Files stored in `./uploads` directory
- Unique filenames generated to prevent conflicts

### Azure Blob Storage (Future)
- Configure Azure storage connection settings
- Set `STORAGE_TYPE=azure`

## Development

### Running Tests
```bash
pytest
```

### Code Formatting
```bash
black app/
isort app/
```

### Linting
```bash
flake8 app/
```

## Production Deployment

### Docker
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY app/ ./app/
COPY .env .

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment Variables for Production
- Set `DEBUG=False`
- Use PostgreSQL database
- Configure Azure Blob Storage
- Set appropriate CORS origins

## Cloud Deployment Roadmap

This backend is designed for deployment to:
- **Azure Container Instances** (ACI)
- **Azure Kubernetes Service** (AKS)
- **Azure App Service**

Integration targets:
- **Azure Blob Storage** for file storage
- **Azure SQL Database** for data persistence
- **Azure Application Gateway** for ingress
- **Azure Front Door** for global routing

## Logging

The application uses Python's built-in logging with configurable levels:
- DEBUG
- INFO
- WARNING
- ERROR
- CRITICAL

## Error Handling

- Comprehensive error handling with HTTP status codes
- Detailed error messages for debugging
- Graceful degradation for storage failures

## Security Considerations

- File type validation
- File size limits
- Secure filename generation
- CORS configuration
- Environment variable security

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

[Add your license here]

## Support

For support and questions, please open an issue in the repository.
