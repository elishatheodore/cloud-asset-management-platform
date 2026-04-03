"""
Pydantic schemas for Asset operations.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class AssetBase(BaseModel):
    """Base schema for Asset."""
    filename: str
    original_filename: str
    file_size: int
    content_type: str


class AssetCreate(AssetBase):
    """Schema for creating an Asset."""
    file_path: str


class AssetUpdate(BaseModel):
    """Schema for updating an Asset filename."""
    filename: str


class AssetResponse(AssetBase):
    """Schema for Asset response."""
    id: int
    file_path: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class AssetList(BaseModel):
    """Schema for list of assets."""
    assets: list[AssetResponse]
    total: int


class HealthCheck(BaseModel):
    """Schema for health check response."""
    status: str
    service: str
    version: str
    timestamp: datetime
