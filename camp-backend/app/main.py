"""
Main FastAPI application for Cloud Asset Management Platform (CAMP).
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import ValidationError as PydanticValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.assets import router as assets_router
from app.core.config import settings
from app.core.logging import setup_logging, get_logger
from app.core.error_handlers import (
    http_exception_handler,
    validation_exception_handler,
    pydantic_validation_exception_handler,
    general_exception_handler,
    starlette_http_exception_handler
)
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
    description="A production-ready backend for managing cloud assets",
    lifespan=lifespan,
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
)

# Add exception handlers for consistent error responses
@app.exception_handler(HTTPException)
async def custom_http_exception_handler(request: Request, exc: HTTPException):
    return await http_exception_handler(request, exc)

@app.exception_handler(RequestValidationError)
async def custom_validation_exception_handler(request: Request, exc: RequestValidationError):
    return await validation_exception_handler(request, exc)

@app.exception_handler(PydanticValidationError)
async def custom_pydantic_validation_exception_handler(request: Request, exc: PydanticValidationError):
    return await pydantic_validation_exception_handler(request, exc)

@app.exception_handler(StarletteHTTPException)
async def custom_starlette_exception_handler(request: Request, exc: StarletteHTTPException):
    return await starlette_http_exception_handler(request, exc)

@app.exception_handler(Exception)
async def custom_general_exception_handler(request: Request, exc: Exception):
    return await general_exception_handler(request, exc)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(assets_router, prefix=settings.api_v1_prefix, tags=["Assets"])


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Cloud Asset Management Platform (CAMP)",
        "version": settings.app_version,
        "status": "running"
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
