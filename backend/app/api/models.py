"""
Models API endpoints for managing AI model configurations.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import Optional

from ..core.database import get_db
from ..core.security import decode_access_token
from ..services.ai_service import AIService, get_ai_service
from ..services.user_service import UserService, get_user_service

router = APIRouter(prefix="/api/models", tags=["models"])


@router.get(
    "/",
    summary="List all available models",
    status_code=status.HTTP_200_OK
)
async def list_all_models(
    request: Request = None,
    ai_service: AIService = Depends(get_ai_service),
):
    """
    Get a complete list of all available AI models.
    
    **Authentication**: Optional (JWT token in Authorization header)
    
    Returns:
    - List of all models with their configurations
    """
    models = ai_service.get_available_models()
    
    return JSONResponse({
        "models": models,
        "count": len(models),
    })


@router.get(
    "/{model_id}",
    summary="Get model details",
    status_code=status.HTTP_200_OK
)
async def get_model_details(
    model_id: str,
    ai_service: AIService = Depends(get_ai_service),
):
    """
    Get detailed information about a specific model.
    
    **Path Parameters**:
    - **model_id**: ID of the model to retrieve
    
    Returns:
    - Model configuration and capabilities
    """
    config = ai_service.get_model_config(model_id)
    
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Model {model_id} not found"
        )
    
    return JSONResponse({
        "id": model_id,
        "config": config,
    })


@router.get(
    "/providers",
    summary="List model providers",
    status_code=status.HTTP_200_OK
)
async def list_providers(
    ai_service: AIService = Depends(get_ai_service),
):
    """
    Get a list of all model providers.
    
    Returns:
    - List of unique providers
    """
    models = ai_service.get_available_models()
    providers = set(model["provider"] for model in models)
    
    return JSONResponse({
        "providers": sorted(list(providers)),
        "count": len(providers),
    })


@router.get(
    "/providers/{provider}",
    summary="List models by provider",
    status_code=status.HTTP_200_OK
)
async def list_models_by_provider(
    provider: str,
    ai_service: AIService = Depends(get_ai_service),
):
    """
    Get all models from a specific provider.
    
    **Path Parameters**:
    - **provider**: Name of the provider
    
    Returns:
    - List of models from the specified provider
    """
    models = ai_service.get_available_models()
    provider_models = [model for model in models if model["provider"] == provider]
    
    if not provider_models:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Provider {provider} not found or has no models"
        )
    
    return JSONResponse({
        "provider": provider,
        "models": provider_models,
        "count": len(provider_models),
    })


@router.get(
    "/types",
    summary="List model types",
    status_code=status.HTTP_200_OK
)
async def list_model_types(
    ai_service: AIService = Depends(get_ai_service),
):
    """
    Get a list of all model types (chat, code, search, etc.).
    
    Returns:
    - List of unique model types
    """
    models = ai_service.get_available_models()
    types = set(model["type"] for model in models)
    
    return JSONResponse({
        "types": sorted(list(types)),
        "count": len(types),
    })


@router.get(
    "/types/{model_type}",
    summary="List models by type",
    status_code=status.HTTP_200_OK
)
async def list_models_by_type(
    model_type: str,
    ai_service: AIService = Depends(get_ai_service),
):
    """
    Get all models of a specific type.
    
    **Path Parameters**:
    - **model_type**: Type of models to retrieve (chat, code, search, etc.)
    
    Returns:
    - List of models of the specified type
    """
    models = ai_service.get_available_models()
    type_models = [model for model in models if model["type"] == model_type]
    
    if not type_models:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Type {model_type} not found or has no models"
        )
    
    return JSONResponse({
        "type": model_type,
        "models": type_models,
        "count": len(type_models),
    })
