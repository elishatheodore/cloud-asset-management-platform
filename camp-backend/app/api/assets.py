"""
API router for asset operations with JWT authentication.
"""
import os
import re
from pathlib import Path
from datetime import datetime
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Header, status
from fastapi.responses import FileResponse
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.asset_service import AssetService
from app.schemas.asset import AssetResponse, AssetList, AssetUpdate, HealthCheck
from app.core.exceptions import (
    AssetNotFoundException,
    InvalidFileException,
    StorageOperationException,
    FileSizeExceededException,
    UnsupportedFileTypeException
)
from app.core.security import verify_token

# OAuth2 scheme for token authentication (optional for development)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login", auto_error=False)

from app.core.logging import get_logger

logger = get_logger(__name__)
router = APIRouter()

# File upload configuration
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
ALLOWED_FILE_TYPES = [
    "image/jpeg", "image/png", "image/gif", "image/webp",
    "application/pdf", "text/plain", "text/csv",
    "application/json", "application/xml",
    "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
]


# Dependency to get current user from auth service
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    """Get current authenticated user."""
    # For development, allow requests without authentication
    if token is None:
        return {
            "sub": "demo_user",
            "email": "demo@example.com",
            "is_active": True,
            "role": "user"
        }
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        from app.auth.security import verify_token
        payload = verify_token(token)
        if payload is None:
            raise credentials_exception
        
        # For demo purposes, return mock user data
        # In production with full auth service, this would validate against auth database
        user_data = {
            "sub": payload.get("sub", "unknown"),
            "email": f"{payload.get('sub', 'unknown')}@example.com",
            "is_active": True,
            "role": "user"
        }
        
        return user_data
    except Exception:
        raise credentials_exception


@router.post("/upload", response_model=AssetResponse)
async def upload_file(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload a file to the platform.
    
    Args:
        file: File to upload
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        AssetResponse: Created asset information
    """
    try:
        # Validate file
        if not file.filename:
            raise InvalidFileException("No file provided")
        
        if file.size > MAX_FILE_SIZE:
            raise FileSizeExceededException(f"File size exceeds maximum allowed size of {MAX_FILE_SIZE} bytes")
        
        # Check file type
        content_type = file.content_type or "application/octet-stream"
        if content_type not in ALLOWED_FILE_TYPES:
            raise UnsupportedFileTypeException(f"File type {content_type} is not supported")
        
        # Save file
        asset_service = AssetService(db)
        file_path = await asset_service.save_file(
            file_data=file.file,
            filename=file.filename,
            content_type=content_type
        )
        
        # Create asset record
        asset = await asset_service.create_asset(
            filename=file.filename,
            original_filename=file.filename,
            file_size=file.size,
            content_type=content_type,
            file_path=file_path
        )
        
        logger.info(f"File uploaded successfully by user {current_user.get('email', 'unknown')}: {asset.filename}")
        return AssetResponse(
            id=asset.id,
            filename=asset.filename,
            original_filename=asset.original_filename,
            file_size=asset.file_size,
            content_type=asset.content_type,
            file_path=asset.file_path,
            created_at=asset.created_at,
            updated_at=asset.updated_at
        )
        
    except Exception as e:
        logger.error(f"Error uploading file: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/files", response_model=AssetList)
async def list_files(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all uploaded files.
    
    Args:
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        AssetList: List of all assets
    """
    try:
        asset_service = AssetService(db)
        assets = await asset_service.get_all_assets()
        
        # Add image_url to each asset
        base_url = "http://localhost:8000"
        assets_with_urls = []
        
        for asset in assets:
            # Extract filename from file_path
            filename = re.split(r'[\\/]', asset.file_path)[-1] if asset.file_path else None
            image_url = None
            
            if filename and asset.content_type and asset.content_type.startswith('image/'):
                image_url = f"{base_url}/uploads/{filename}"
            
            asset_response = AssetResponse(
                id=asset.id,
                filename=asset.filename,
                original_filename=asset.original_filename,
                file_size=asset.file_size,
                content_type=asset.content_type,
                file_path=asset.file_path,
                created_at=asset.created_at,
                updated_at=asset.updated_at,
                image_url=image_url
            )
            assets_with_urls.append(asset_response)
        
        logger.info(f"Files listed by user: {current_user.get('email', 'unknown')}")
        return AssetList(assets=assets_with_urls, total=len(assets_with_urls))
        
    except Exception as e:
        logger.error(f"Error listing files: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/files/{asset_id}", response_model=AssetResponse)
async def get_file(
    asset_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific file by ID.
    
    Args:
        asset_id: ID of the asset to retrieve
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        AssetResponse: File information
    """
    try:
        asset_service = AssetService(db)
        asset = await asset_service.get_asset_by_id(asset_id)
        
        if not asset:
            raise AssetNotFoundException(f"Asset with ID {asset_id} not found")
        
        # Add image_url if it's an image
        base_url = "http://localhost:8000"
        filename = re.split(r'[\\/]', asset.file_path)[-1] if asset.file_path else None
        image_url = None
        
        if filename and asset.content_type and asset.content_type.startswith('image/'):
            image_url = f"{base_url}/uploads/{filename}"
        
        logger.info(f"File {asset.filename} accessed by user: {current_user.get('email', 'unknown')}")
        return AssetResponse(
            id=asset.id,
            filename=asset.filename,
            original_filename=asset.original_filename,
            file_size=asset.file_size,
            content_type=asset.content_type,
            file_path=asset.file_path,
            created_at=asset.created_at,
            updated_at=asset.updated_at,
            image_url=image_url
        )
        
    except AssetNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error getting file: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.put("/files/{asset_id}", response_model=AssetResponse)
async def update_file(
    asset_id: int,
    asset_update: AssetUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update file information.
    
    Args:
        asset_id: ID of the asset to update
        asset_update: Updated asset information
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        AssetResponse: Updated asset information
    """
    try:
        asset_service = AssetService(db)
        asset = await asset_service.get_asset_by_id(asset_id)
        
        if not asset:
            raise AssetNotFoundException(f"Asset with ID {asset_id} not found")
        
        # Update asset
        updated_asset = await asset_service.update_asset(asset_id, asset_update.filename)
        
        logger.info(f"File {updated_asset.filename} updated by user: {current_user.get('email', 'unknown')}")
        
        # Add image_url if it's an image
        base_url = "http://localhost:8000"
        filename = re.split(r'[\\/]', updated_asset.file_path)[-1] if updated_asset.file_path else None
        image_url = None
        
        if filename and updated_asset.content_type and updated_asset.content_type.startswith('image/'):
            image_url = f"{base_url}/uploads/{filename}"
        
        return AssetResponse(
            id=updated_asset.id,
            filename=updated_asset.filename,
            original_filename=updated_asset.original_filename,
            file_size=updated_asset.file_size,
            content_type=updated_asset.content_type,
            file_path=updated_asset.file_path,
            created_at=updated_asset.created_at,
            updated_at=updated_asset.updated_at,
            image_url=image_url
        )
        
    except AssetNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating file: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.delete("/files/{asset_id}")
async def delete_file(
    asset_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a file.
    
    Args:
        asset_id: ID of the asset to delete
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        dict: Deletion confirmation
    """
    try:
        asset_service = AssetService(db)
        asset = await asset_service.get_asset_by_id(asset_id)
        
        if not asset:
            raise AssetNotFoundException(f"Asset with ID {asset_id} not found")
        
        # Delete file and asset record
        await asset_service.delete_asset(asset_id)
        
        logger.info(f"File {asset.filename} deleted by user: {current_user.get('email', 'unknown')}")
        return {"message": "File deleted successfully"}
        
    except AssetNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error deleting file: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/test-error")
async def test_error():
    """Test endpoint to trigger error handling."""
    from app.core.exceptions import InvalidFileException
    raise InvalidFileException("This is a test error")


@router.get("/files/{asset_id}")
async def download_file(
    asset_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve a file for download.
    
    Args:
        asset_id: ID of the asset to retrieve
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        FileResponse: The file content
    """
    try:
        asset_service = AssetService(db)
        asset = await asset_service.get_asset_by_id(asset_id)
        
        if not asset:
            raise AssetNotFoundException(f"Asset with ID {asset_id} not found")
        
        file_path = Path(asset.file_path)
        
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="File not found on disk")
        
        logger.info(f"File {asset.filename} downloaded by user: {current_user.get('email', 'unknown')}")
        
        # Return file for download
        return FileResponse(
            path=str(file_path),
            filename=asset.original_filename,
            media_type=asset.content_type
        )
        
    except AssetNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error retrieving file: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
