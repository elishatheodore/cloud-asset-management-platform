"""
Business logic service for Asset operations.
"""
from typing import List, Optional
from pathlib import Path
from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.models.asset import Asset
from app.schemas.asset import AssetCreate, AssetResponse
from app.services.storage import get_storage_service
from app.core.exceptions import StorageOperationException


class AssetService:
    """Service for managing assets."""
    
    def __init__(self, db: Session):
        self.db = db
        self.storage_service = get_storage_service()
    
    async def create_asset(self, file: UploadFile) -> AssetResponse:
        """
        Create a new asset from uploaded file.
        
        Args:
            file: Uploaded file
            
        Returns:
            AssetResponse: Created asset information
        """
        # Save file to storage
        file_path = await self.storage_service.save_file(
            file.file, file.filename, file.content_type
        )
        
        # Create asset record
        asset_data = AssetCreate(
            filename=file.filename,
            original_filename=file.filename,
            file_path=file_path,
            file_size=file.size,
            content_type=file.content_type
        )
        
        asset = Asset(**asset_data.model_dump())
        self.db.add(asset)
        self.db.commit()
        self.db.refresh(asset)
        
        return AssetResponse.model_validate(asset)
    
    async def get_all_assets(self) -> List[AssetResponse]:
        """
        Get all assets.
        
        Returns:
            List[AssetResponse]: List of all assets
        """
        assets = self.db.query(Asset).all()
        return [AssetResponse.model_validate(asset) for asset in assets]
    
    async def get_asset_by_id(self, asset_id: int) -> Optional[AssetResponse]:
        """
        Get asset by ID.
        
        Args:
            asset_id: Asset ID
            
        Returns:
            Optional[AssetResponse]: Asset if found, None otherwise
        """
        asset = self.db.query(Asset).filter(Asset.id == asset_id).first()
        if asset:
            return AssetResponse.model_validate(asset)
        return None
    
    async def update_asset(self, asset_id: int, new_filename: str) -> Optional[AssetResponse]:
        """
        Update asset filename.
        
        Args:
            asset_id: Asset ID
            new_filename: New filename for the asset
            
        Returns:
            Optional[AssetResponse]: Updated asset if found, None otherwise
            
        Raises:
            StorageOperationException: If file rename fails
        """
        asset = self.db.query(Asset).filter(Asset.id == asset_id).first()
        if not asset:
            return None
        
        # Get current file path
        old_file_path = Path(asset.file_path)
        
        # Generate new filename with same extension
        new_unique_filename = self.storage_service._generate_unique_filename(new_filename)
        new_file_path = old_file_path.parent / new_unique_filename
        
        try:
            # Rename file on disk
            if old_file_path.exists():
                old_file_path.rename(new_file_path)
            
            # Update database record
            asset.filename = new_filename
            asset.original_filename = new_filename
            asset.file_path = str(new_file_path)
            
            self.db.commit()
            self.db.refresh(asset)
            
            return AssetResponse.model_validate(asset)
            
        except Exception as e:
            # If DB update fails, try to rename file back
            try:
                if new_file_path.exists():
                    new_file_path.rename(old_file_path)
            except:
                pass  # Best effort to restore
            raise StorageOperationException("update", f"Failed to rename file: {str(e)}")
    
    async def delete_asset(self, asset_id: int) -> bool:
        """
        Delete asset by ID.
        
        Args:
            asset_id: Asset ID
            
        Returns:
            bool: True if deleted, False if not found
        """
        asset = self.db.query(Asset).filter(Asset.id == asset_id).first()
        if not asset:
            return False
        
        # Delete file from storage
        await self.storage_service.delete_file(asset.file_path)
        
        # Delete database record
        self.db.delete(asset)
        self.db.commit()
        
        return True
