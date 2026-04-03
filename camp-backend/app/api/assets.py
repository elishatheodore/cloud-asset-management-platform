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
    StorageOperationException
)

router = APIRouter()


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
    if not file.filename:
        raise InvalidFileException("No filename provided")
    
    if file.size == 0:
        raise InvalidFileException("File is empty")
    
    try:
        asset_service = AssetService(db)
        asset = await asset_service.create_asset(file)
        return asset
    except Exception as e:
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
    asset_service = AssetService(db)
    success = await asset_service.delete_asset(asset_id)
    
    if not success:
        raise AssetNotFoundException(asset_id)
    
    return {"message": "Asset deleted successfully", "asset_id": asset_id}


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
    asset_service = AssetService(db)
    asset = await asset_service.update_asset(asset_id, asset_update.filename)
    
    if not asset:
        raise AssetNotFoundException(asset_id)
    
    return asset
