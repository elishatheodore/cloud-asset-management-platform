"""
Configuration management for CAMP backend.
"""
import os
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings with environment variable support."""
    
    # Application
    app_name: str = "Cloud Asset Management Platform"
    app_version: str = "1.0.0"
    debug: bool = False
    log_level: str = "INFO"
    
    # Database
    database_url: str = "sqlite:///./camp.db"
    
    # Storage
    storage_type: str = "local"
    local_storage_path: str = "./uploads"
    azure_storage_connection_string: Optional[str] = None
    azure_storage_container_name: Optional[str] = None
    
    # API
    api_v1_prefix: str = "/api/v1"
    
    # JWT Authentication
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30  # 30 minutes
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


# Global settings instance
settings = Settings()
