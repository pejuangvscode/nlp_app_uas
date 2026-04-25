from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "RAPHA MEDICAL AI"
    APP_VERSION: str = "1.0.0"
    API_PREFIX: str = "/api/v1"
    DEBUG: bool = False

    # CORS — add your Vercel domain here
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://raphamed.vercel.app",
        "https://*.vercel.app",
    ]

    # API Key Authentication
    # Set REQUIRE_API_KEY=true in env to enable for monetization
    REQUIRE_API_KEY: bool = False
    API_KEY_HEADER: str = "X-API-Key"
    # Comma-separated list of valid API keys (set via environment variable)
    VALID_API_KEYS: str = ""

    # Model
    MODEL_NAME: str = "dummy-v0.1"
    MODEL_VERSION: str = "0.1.0"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

    def get_valid_api_keys(self) -> list[str]:
        """Parse the comma-separated API keys into a list."""
        if not self.VALID_API_KEYS:
            return []
        return [k.strip() for k in self.VALID_API_KEYS.split(",") if k.strip()]


@lru_cache()
def get_settings() -> Settings:
    return Settings()
