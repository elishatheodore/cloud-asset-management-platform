"""
Debug script to test exception handlers directly.
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import Request, HTTPException
from fastapi.exceptions import RequestValidationError
from app.core.error_handlers import validation_exception_handler

# Create a mock request
class MockRequest:
    def __init__(self):
        self.method = "POST"
        self.url = "http://localhost:8000/api/v1/upload"
        self.headers = {}

# Test validation exception handler
mock_request = MockRequest()
mock_validation_error = RequestValidationError([
    {
        "type": "missing",
        "loc": ["body", "file"],
        "msg": "Field required",
        "input": None
    }
])

print("Testing validation exception handler...")
try:
    import asyncio
    result = asyncio.run(validation_exception_handler(mock_request, mock_validation_error))
    print(f"Result: {result}")
except Exception as e:
    print(f"Error: {e}")
