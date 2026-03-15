from pydantic_settings import BaseSettings
from typing import List, Optional
import os


class Settings(BaseSettings):
    # App
    APP_ENV: str = "development"
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000
    API_V1_STR: str = "/api/v1"

    # AI Services
    ANTHROPIC_API_KEY: str = ""

    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/ai_ad_platform"

    # Redis
    REDIS_URL: str = "redis://localhost:6379"

    # Storage
    STORAGE_BUCKET: str = "ai-ad-platform-assets"
    STORAGE_REGION: str = "us-east-1"

    # Security
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:3001"]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
