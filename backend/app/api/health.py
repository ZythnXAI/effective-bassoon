"""
Health check endpoint.
"""

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from ..core.config import settings

router = APIRouter(prefix="/api/health", tags=["health"])


@router.get("/", summary="Health Check")
async def health_check():
    """
    Basic health check endpoint.
    Returns the application status and version.
    """
    return JSONResponse({
        "status": "healthy",
        "app_name": settings.app_name,
        "version": settings.app_version,
        "timestamp": "2024-01-01T00:00:00Z",
    })


@router.get("/ready", summary="Readiness Check")
async def readiness_check():
    """
    Readiness check endpoint.
    Verifies that the application is ready to receive traffic.
    """
    return JSONResponse({
        "status": "ready",
        "app_name": settings.app_name,
        "version": settings.app_version,
    })
