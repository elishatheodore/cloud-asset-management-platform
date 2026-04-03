"""
Middleware for consistent error response formatting.
"""
import json
from datetime import datetime
from typing import Any, Dict, Optional
from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.logging import get_logger

logger = get_logger(__name__)


class ErrorResponseMiddleware(BaseHTTPMiddleware):
    """
    Middleware to ensure all error responses follow consistent format.
    """
    
    async def dispatch(self, request: Request, call_next):
        try:
            response = await call_next(request)
            
            # Only transform error responses (4xx, 5xx)
            if response.status_code >= 400:
                try:
                    # Try to parse existing response
                    content = response.body.decode()
                    data = json.loads(content)
                    
                    # If it's already in our format, return as-is
                    if isinstance(data, dict) and "success" in data:
                        return response
                    
                    # Transform FastAPI's default error format to our format
                    if "detail" in data:
                        error_detail = data["detail"]
                        
                        # Handle validation errors
                        if isinstance(error_detail, list):
                            validation_errors = []
                            for error in error_detail:
                                field_path = " -> ".join(str(loc) for loc in error.get("loc", []))
                                validation_errors.append({
                                    "field": field_path,
                                    "message": error.get("msg", "Validation error"),
                                    "value": error.get("input")
                                })
                            
                            return JSONResponse(
                                status_code=response.status_code,
                                content={
                                    "success": False,
                                    "error": "Validation failed",
                                    "code": response.status_code,
                                    "timestamp": datetime.utcnow().isoformat(),
                                    "validation_errors": validation_errors
                                }
                            )
                        else:
                            # Handle single error messages
                            return JSONResponse(
                                status_code=response.status_code,
                                content={
                                    "success": False,
                                    "error": str(error_detail),
                                    "code": response.status_code,
                                    "timestamp": datetime.utcnow().isoformat()
                                }
                            )
                except (json.JSONDecodeError, UnicodeDecodeError):
                    # If we can't parse the response, create a generic error
                    logger.warning(f"Could not parse error response: {response.status_code}")
                    pass
                
                # Fallback to generic error format
                return JSONResponse(
                    status_code=response.status_code,
                    content={
                        "success": False,
                        "error": f"HTTP {response.status_code} error",
                        "code": response.status_code,
                        "timestamp": datetime.utcnow().isoformat()
                    }
                )
            
            return response
            
        except Exception as e:
            logger.error(f"Error in middleware: {str(e)}")
            return JSONResponse(
                status_code=500,
                content={
                    "success": False,
                    "error": "Internal server error",
                    "code": 500,
                    "timestamp": datetime.utcnow().isoformat()
                }
            )
