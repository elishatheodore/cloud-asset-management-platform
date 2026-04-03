"""
API router for asset operations.
"""
from datetime import datetime
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
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


@router.get("/", response_model=HealthCheck)
async def health_check():
    """
    Health check endpoint.
    
    Returns:
        HealthCheck: Service health status
    """
    return HealthCheck(
        status="healthy",
        service="Cloud Asset Management Platform",
        version="1.0.0",
        timestamp=datetime.utcnow()
    )


@router.post("/upload", response_model=AssetResponse)
async def upload_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload a file to the platform.
    
    Args:
        file: File to upload
        db: Database session
        
    Returns:
        AssetResponse: Created asset information
        
    Raises:
        InvalidFileException: If file is invalid
        StorageOperationException: If storage operation fails
    """
    # Validate file is provided
    if not file.filename:
        logger.error("Upload attempt without filename")
        raise InvalidFileException("No filename provided")
    
    # Validate file is not empty
    if file.size == 0:
        logger.error(f"Upload attempt with empty file: {file.filename}")
        raise InvalidFileException("File is empty")
    
    # Validate file size limit
    if file.size > MAX_FILE_SIZE:
        logger.error(f"File size exceeds limit: {file.filename}, size: {file.size}, max: {MAX_FILE_SIZE}")
        raise FileSizeExceededException(MAX_FILE_SIZE, file.size)
    
    # Validate file type
    if file.content_type and file.content_type not in ALLOWED_FILE_TYPES:
        logger.error(f"Unsupported file type: {file.filename}, type: {file.content_type}")
        raise UnsupportedFileTypeException(file.content_type, ALLOWED_FILE_TYPES)
    
    try:
        logger.info(f"Starting file upload: {file.filename}, size: {file.size}")
        asset_service = AssetService(db)
        asset = await asset_service.create_asset(file)
        logger.info(f"Successfully uploaded file: {file.filename}, asset_id: {asset.id}")
        return asset
    except Exception as e:
        logger.error(f"Failed to upload file {file.filename}: {str(e)}")
        raise StorageOperationException("upload", str(e))


@router.get("/files", response_model=AssetList)
async def list_files(db: Session = Depends(get_db)):
    """
    List all uploaded files.
    
    Args:
        db: Database session
        
    Returns:
        AssetList: List of all assets
    """
    asset_service = AssetService(db)
    assets = await asset_service.get_all_assets()
    return AssetList(assets=assets, total=len(assets))


@router.get("/test-error")
async def test_error():
    """Test endpoint to trigger error handling."""
    from app.core.exceptions import InvalidFileException
    raise InvalidFileException("This is a test error")


@router.delete("/files/{asset_id}")
async def delete_file(asset_id: int, db: Session = Depends(get_db)):
    """
    Delete a file by ID.
    
    Args:
        asset_id: ID of the asset to delete
        db: Database session
        
    Returns:
        dict: Deletion status
        
    Raises:
        AssetNotFoundException: If asset not found
    """
    try:
        logger.info(f"Attempting to delete asset: {asset_id}")
        asset_service = AssetService(db)
        success = await asset_service.delete_asset(asset_id)
        
        if not success:
            logger.error(f"Asset not found for deletion: {asset_id}")
            raise AssetNotFoundException(asset_id)
        
        logger.info(f"Successfully deleted asset: {asset_id}")
        return {"message": "Asset deleted successfully", "asset_id": asset_id}
    except AssetNotFoundException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete asset {asset_id}: {str(e)}")
        raise StorageOperationException("delete", str(e))


@router.put("/files/{asset_id}", response_model=AssetResponse)
async def update_file(
    asset_id: int, 
    asset_update: AssetUpdate, 
    db: Session = Depends(get_db)
):
    """
    Update/rename a file by ID.
    
    Args:
        asset_id: ID of the asset to update
        asset_update: Update data containing new filename
        db: Database session
        
    Returns:
        AssetResponse: Updated asset information
        
    Raises:
        AssetNotFoundException: If asset not found
        StorageOperationException: If file rename fails
    """
    try:
        logger.info(f"Attempting to update asset: {asset_id}, new filename: {asset_update.filename}")
        asset_service = AssetService(db)
        asset = await asset_service.update_asset(asset_id, asset_update.filename)
        
        if not asset:
            logger.error(f"Asset not found for update: {asset_id}")
            raise AssetNotFoundException(asset_id)
        
        logger.info(f"Successfully updated asset: {asset_id}")
        return asset
    except AssetNotFoundException:
        raise
    except Exception as e:
        logger.error(f"Failed to update asset {asset_id}: {str(e)}")
        raise StorageOperationException("update", str(e))
