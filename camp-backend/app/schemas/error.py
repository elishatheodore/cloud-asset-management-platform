"""
Error response schemas for consistent API error handling.
"""
from datetime import datetime
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field


class ErrorResponse(BaseModel):
    """Standard error response format for all API errors."""
    
    success: bool = Field(False, description="Always false for error responses")
    error: str = Field(..., description="Detailed error message")
    code: int = Field(..., description="HTTP status code")
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat(), description="Error timestamp in ISO format")
    details: Optional[Dict[str, Any]] = Field(None, description="Additional error details")


class ValidationErrorDetail(BaseModel):
    """Validation error detail for individual fields."""
    
    field: str = Field(..., description="Field name that failed validation")
    message: str = Field(..., description="Validation error message for the field")
    value: Optional[Any] = Field(None, description="The value that failed validation")


class ValidationErrorResponse(ErrorResponse):
    """Extended error response for validation errors."""
    
    validation_errors: Optional[list[ValidationErrorDetail]] = Field(
        None, description="List of field-specific validation errors"
    )
