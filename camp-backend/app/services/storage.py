"""
Abstract storage service and implementations.
"""
import os
import shutil
import uuid
from abc import ABC, abstractmethod
from pathlib import Path
from typing import BinaryIO, Optional

from app.core.config import settings


class StorageService(ABC):
    """Abstract base class for storage services."""
    
    @abstractmethod
    async def save_file(self, file_data: BinaryIO, filename: str, content_type: str) -> str:
        """
        Save a file to storage.
        
        Args:
            file_data: File data as binary stream
            filename: Original filename
            content_type: MIME type of the file
            
        Returns:
            str: Unique file identifier or path
        """
        pass
    
    @abstractmethod
    async def delete_file(self, file_path: str) -> bool:
        """
        Delete a file from storage.
        
        Args:
            file_path: File path or identifier
            
        Returns:
            bool: True if successful, False otherwise
        """
        pass
    
    @abstractmethod
    async def file_exists(self, file_path: str) -> bool:
        """
        Check if file exists in storage.
        
        Args:
            file_path: File path or identifier
            
        Returns:
            bool: True if file exists, False otherwise
        """
        pass


class LocalStorageService(StorageService):
    """Local file system storage implementation."""
    
    def __init__(self, storage_path: str = None):
        self.storage_path = Path(storage_path or settings.local_storage_path)
        self.storage_path.mkdir(parents=True, exist_ok=True)
    
    def _generate_unique_filename(self, original_filename: str) -> str:
        """Generate a unique filename while preserving extension."""
        file_extension = Path(original_filename).suffix
        unique_id = str(uuid.uuid4())
        return f"{unique_id}{file_extension}"
    
    async def save_file(self, file_data: BinaryIO, filename: str, content_type: str) -> str:
        """Save file to local storage."""
        unique_filename = self._generate_unique_filename(filename)
        file_path = self.storage_path / unique_filename
        
        # Reset file pointer to beginning
        file_data.seek(0)
        
        # Write file to disk
        with open(file_path, "wb") as f:
            shutil.copyfileobj(file_data, f)
        
        return str(file_path)
    
    async def delete_file(self, file_path: str) -> bool:
        """Delete file from local storage."""
        try:
            path = Path(file_path)
            if path.exists():
                path.unlink()
                return True
            return False
        except Exception:
            return False
    
    async def file_exists(self, file_path: str) -> bool:
        """Check if file exists in local storage."""
        return Path(file_path).exists()


class AzureBlobStorageService(StorageService):
    """Azure Blob Storage implementation (placeholder for future)."""
    
    def __init__(self, connection_string: str, container_name: str):
        self.connection_string = connection_string
        self.container_name = container_name
        # TODO: Initialize Azure Blob Storage client
    
    async def save_file(self, file_data: BinaryIO, filename: str, content_type: str) -> str:
        """Save file to Azure Blob Storage."""
        # TODO: Implement Azure Blob Storage upload
        raise NotImplementedError("Azure Blob Storage not yet implemented")
    
    async def delete_file(self, file_path: str) -> bool:
        """Delete file from Azure Blob Storage."""
        # TODO: Implement Azure Blob Storage delete
        raise NotImplementedError("Azure Blob Storage not yet implemented")
    
    async def file_exists(self, file_path: str) -> bool:
        """Check if file exists in Azure Blob Storage."""
        # TODO: Implement Azure Blob Storage exists check
        raise NotImplementedError("Azure Blob Storage not yet implemented")


def get_storage_service() -> StorageService:
    """
    Factory function to get appropriate storage service.
    
    Returns:
        StorageService: Configured storage service
    """
    if settings.storage_type == "azure":
        if not settings.azure_storage_connection_string or not settings.azure_storage_container_name:
            raise ValueError("Azure storage configuration missing")
        return AzureBlobStorageService(
            settings.azure_storage_connection_string,
            settings.azure_storage_container_name
        )
    else:
        return LocalStorageService()
