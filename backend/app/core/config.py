"""
Configuration settings for NexusMind AI backend.
"""

from pydantic_settings import BaseSettings
from typing import List, Optional
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Application
    app_name: str = "NexusMind AI"
    app_version: str = "1.0.0"
    debug: bool = False
    
    # Server
    backend_host: str = "0.0.0.0"
    backend_port: int = 8000
    
    # Security
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440  # 24 hours
    
    # Database
    database_url: str = "sqlite:///./nexusmind.db"
    
    # CORS
    cors_origins: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
    ]
    
    # Rate Limiting
    rate_limit_requests: int = 100
    rate_limit_period: int = 60  # seconds
    
    # Logging
    log_level: str = "INFO"
    log_format: str = "json"
    
    # AI API Keys
    e2b_api_key: Optional[str] = None
    exa_ai_api_key: Optional[str] = None
    manus_ai_api_key: Optional[str] = None
    groq_api_key: Optional[str] = None
    fal_ai_api_key: Optional[str] = None
    daytona_api_key: Optional[str] = None
    browserbase_api_key: Optional[str] = None
    nvidia_nim_api_key: Optional[str] = None
    
    # AI API Endpoints
    e2b_base_url: str = "https://api.e2b.dev"
    exa_ai_base_url: str = "https://api.exa.ai"
    manus_ai_base_url: str = "https://api.manus.ai"
    groq_base_url: str = "https://api.groq.com/v1"
    fal_ai_base_url: str = "https://fal.run"
    daytona_base_url: str = "https://api.daytona.io"
    browserbase_base_url: str = "https://api.browserbase.io"
    nvidia_nim_base_url: str = "https://api.nim.nvidia.com"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


# Global settings instance
settings = get_settings()
