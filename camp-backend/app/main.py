"""
Main FastAPI application for Cloud Asset Management Platform (CAMP).
"""
from contextlib import asynccontextmanager
from datetime import datetime
from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import ValidationError as PydanticValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import os

from app.api.assets import router as assets_router
from app.core.config import settings
from app.core.logging import setup_logging, get_logger
from app.core.middleware import ErrorResponseMiddleware
from app.db.database import create_tables

# Setup logging
setup_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    logger.info("Starting CAMP backend...")
    create_tables()
    logger.info("Database tables created/verified")
    
    yield
    
    # Shutdown
    logger.info("Shutting down CAMP backend...")


# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Main FastAPI application.",
    debug=settings.debug,
    lifespan=lifespan,
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
)

# Add error response middleware for consistent formatting
app.add_middleware(ErrorResponseMiddleware)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
# app.include_router(auth_router, prefix=settings.api_v1_prefix, tags=["Authentication"])
app.include_router(assets_router, prefix=settings.api_v1_prefix, tags=["Assets"])

# Mount static files for uploads
uploads_dir = os.path.join(os.getcwd(), "uploads")
if os.path.exists(uploads_dir):
    app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")
    logger.info(f"Mounted static files from: {uploads_dir}")
    logger.info(f"Uploads directory contents: {os.listdir(uploads_dir)}")
else:
    logger.warning(f"Uploads directory not found: {uploads_dir}")
    # Try to create it
    os.makedirs(uploads_dir, exist_ok=True)
    logger.info(f"Created uploads directory: {uploads_dir}")


@app.get("/")
async def root():
    """Root endpoint with basic health information."""
    return {
        "message": "Cloud Asset Management Platform (CAMP)",
        "version": settings.app_version,
        "status": "running",
        "auth_enabled": True,
        "api_version": "v1",
        "endpoints": {
            "health": "/health",
            "assets": "/api/v1/files",
            "upload": "/api/v1/upload",
            "docs": "/docs"
        }
    }

@app.get("/health")
async def health_check():
    """Detailed health check endpoint."""
    try:
        # Check database connection
        from app.db.database import engine
        with engine.connect() as conn:
            conn.execute("SELECT 1")
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
    
    # Check uploads directory
    uploads_dir = os.path.join(os.getcwd(), "uploads")
    uploads_accessible = os.path.exists(uploads_dir) and os.access(uploads_dir, os.R_OK | os.W_OK)
    
    return {
        "status": "healthy" if db_status == "healthy" and uploads_accessible else "unhealthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": settings.app_version,
        "checks": {
            "database": db_status,
            "uploads": "accessible" if uploads_accessible else "not accessible",
            "api": "healthy"
        },
        "environment": "development" if settings.debug else "production"
    }

@app.get("/debug/uploads")
async def debug_uploads():
    """Debug endpoint to check uploads directory."""
    uploads_dir = os.path.join(os.getcwd(), "uploads")
    if os.path.exists(uploads_dir):
        files = os.listdir(uploads_dir)
        return {
            "uploads_dir": uploads_dir,
            "exists": True,
            "files": files,
            "file_count": len(files)
        }
    else:
        return {
            "uploads_dir": uploads_dir,
            "exists": False,
            "files": [],
            "file_count": 0
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
        log_level=settings.log_level.lower()
    )
