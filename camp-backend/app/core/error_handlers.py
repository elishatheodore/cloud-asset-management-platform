"""
Global exception handlers for consistent error responses.
"""
from datetime import datetime
from typing import Any, Dict, Optional, Union
from fastapi import Request, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import ValidationError as PydanticValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.logging import get_logger
from app.schemas.error import ErrorResponse, ValidationErrorResponse, ValidationErrorDetail

logger = get_logger(__name__)


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """
    Handle HTTPException and return consistent error response.
    
    Args:
        request: FastAPI request object
        exc: HTTPException instance
        
    Returns:
        JSONResponse: Standardized error response
    """
    logger.error(f"HTTPException: {exc.status_code} - {exc.detail}")
    
    error_response = ErrorResponse(
        error=str(exc.detail),
        code=exc.status_code,
        timestamp=datetime.utcnow().isoformat()
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response.model_dump()
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """
    Handle FastAPI request validation errors and return consistent error response.
    
    Args:
        request: FastAPI request object
        exc: RequestValidationError instance
        
    Returns:
        JSONResponse: Standardized validation error response
    """
    logger.error(f"RequestValidationError: {exc.errors()}")
    
    validation_errors = []
    for error in exc.errors():
        field_path = " -> ".join(str(loc) for loc in error["loc"])
        validation_errors.append(
            ValidationErrorDetail(
                field=field_path,
                message=error["msg"],
                value=error.get("input")
            )
        )
    
    error_response = ValidationErrorResponse(
        error="Validation failed",
        code=422,
        timestamp=datetime.utcnow().isoformat(),
        validation_errors=validation_errors
    )
    
    return JSONResponse(
        status_code=422,
        content=error_response.model_dump()
    )


async def pydantic_validation_exception_handler(request: Request, exc: PydanticValidationError) -> JSONResponse:
    """
    Handle Pydantic validation errors and return consistent error response.
    
    Args:
        request: FastAPI request object
        exc: PydanticValidationError instance
        
    Returns:
        JSONResponse: Standardized validation error response
    """
    logger.error(f"PydanticValidationError: {exc.errors()}")
    
    validation_errors = []
    for error in exc.errors():
        field_path = " -> ".join(str(loc) for loc in error["loc"])
        validation_errors.append(
            ValidationErrorDetail(
                field=field_path,
                message=error["msg"],
                value=error.get("input")
            )
        )
    
    error_response = ValidationErrorResponse(
        error="Data validation failed",
        code=422,
        timestamp=datetime.utcnow().isoformat(),
        validation_errors=validation_errors
    )
    
    return JSONResponse(
        status_code=422,
        content=error_response.model_dump()
    )


async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Handle general exceptions and return consistent error response.
    
    Args:
        request: FastAPI request object
        exc: General exception instance
        
    Returns:
        JSONResponse: Standardized error response
    """
    logger.error(f"Unhandled exception: {type(exc).__name__}: {str(exc)}")
    
    error_response = ErrorResponse(
        error="An internal server error occurred",
        code=500,
        timestamp=datetime.utcnow().isoformat()
    )
    
    return JSONResponse(
        status_code=500,
        content=error_response.model_dump()
    )


async def starlette_http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    """
    Handle Starlette HTTPException and return consistent error response.
    
    Args:
        request: FastAPI request object
        exc: StarletteHTTPException instance
        
    Returns:
        JSONResponse: Standardized error response
    """
    logger.error(f"StarletteHTTPException: {exc.status_code} - {exc.detail}")
    
    error_response = ErrorResponse(
        error=str(exc.detail),
        code=exc.status_code,
        timestamp=datetime.utcnow().isoformat()
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response.model_dump()
    )
