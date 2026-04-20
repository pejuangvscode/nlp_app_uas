"""
API Key Authentication Middleware
==================================

This module provides optional API key authentication for the RAPHA MEDICAL AI API.
It is designed to be easily enabled when you're ready to monetize/sell the API.

ENABLE AUTH:
  Set environment variable: REQUIRE_API_KEY=true
  Then add keys: VALID_API_KEYS=key1,key2,key3

HOW TO ISSUE API KEYS:
  1. Generate a secure key: python -c "import secrets; print(secrets.token_urlsafe(32))"
  2. Add to VALID_API_KEYS env var (comma-separated)
  3. Give the key to your API customer
  4. Customers include it in requests as: X-API-Key: <their-key>
"""

import logging
from fastapi import HTTPException, Security, status
from fastapi.security.api_key import APIKeyHeader

from app.config import get_settings

logger = logging.getLogger(__name__)

settings = get_settings()

api_key_header = APIKeyHeader(
    name=settings.API_KEY_HEADER,
    auto_error=False,
    description="API Key for authenticated access. Required when REQUIRE_API_KEY=true.",
)


async def verify_api_key(api_key: str = Security(api_key_header)) -> str | None:
    """
    FastAPI dependency that validates the API key.

    - If REQUIRE_API_KEY is False (default), always passes through.
    - If REQUIRE_API_KEY is True, validates against VALID_API_KEYS list.

    Usage in router:
        @router.post("/diagnose")
        async def diagnose(request: ..., _: str = Depends(verify_api_key)):
            ...
    """
    if not settings.REQUIRE_API_KEY:
        return None  # Auth disabled — pass through

    valid_keys = settings.get_valid_api_keys()

    if not api_key:
        logger.warning("[Auth] Request missing API key")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key required. Include 'X-API-Key' header.",
            headers={"WWW-Authenticate": "ApiKey"},
        )

    if api_key not in valid_keys:
        logger.warning(f"[Auth] Invalid API key attempted: {api_key[:8]}...")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid or expired API key.",
        )

    logger.info(f"[Auth] Valid API key: ...{api_key[-4:]}")
    return api_key
