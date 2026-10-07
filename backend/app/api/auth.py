"""
Authentication API endpoints.
"""

from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional

from ..core.database import get_db
from ..core.security import Token, create_access_token, decode_access_token
from ..services.user_service import (
    UserService,
    get_user_service,
    UserCreate,
    UserLogin,
    UserResponse,
)
from ..models.user import User

router = APIRouter(prefix="/api/auth", tags=["authentication"])
security = HTTPBearer()


@router.post(
    "/register",
    summary="Register a new user",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED
)
async def register_user(
    user_data: UserCreate,
    user_service: UserService = Depends(get_user_service),
):
    """
    Register a new user with username, email, and password.
    
    - **username**: Unique username
    - **email**: Unique email address
    - **password**: User password (will be hashed)
    - **full_name**: Optional full name
    """
    user = user_service.create_user(user_data)
    return UserResponse.from_orm(user)


@router.post(
    "/login",
    summary="Login and get access token",
    response_model=Token,
    status_code=status.HTTP_200_OK
)
async def login(
    login_data: UserLogin,
    user_service: UserService = Depends(get_user_service),
):
    """
    Authenticate a user and return a JWT access token.
    
    - **username**: Registered username
    - **password**: User password
    """
    user = user_service.authenticate_user(
        login_data.username, login_data.password
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is disabled"
        )
    
    return user_service.create_token(user)


@router.get(
    "/me",
    summary="Get current user",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK
)
async def get_current_user(
    request: Request,
    user_service: UserService = Depends(get_user_service),
):
    """
    Get information about the currently authenticated user.
    
    Requires a valid JWT token in the Authorization header.
    """
    # Get token from Authorization header
    auth_header = request.headers.get("Authorization")
    
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = auth_header[7:]  # Remove "Bearer " prefix
    
    # Decode token and get user
    token_data = decode_access_token(token)
    
    if token_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = user_service.get_user_by_username(token_data.username)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse.from_orm(user)


@router.get(
    "/stats",
    summary="Get user statistics",
    status_code=status.HTTP_200_OK
)
async def get_user_stats(
    request: Request,
    user_service: UserService = Depends(get_user_service),
):
    """
    Get statistics for the current user.
    
    Returns:
    - Total conversations
    - Total messages
    - Account information
    """
    auth_header = request.headers.get("Authorization")
    
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = auth_header[7:]
    token_data = decode_access_token(token)
    
    if token_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = user_service.get_user_by_username(token_data.username)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user_service.get_user_stats(user.id)


@router.post(
    "/refresh",
    summary="Refresh access token",
    response_model=Token,
    status_code=status.HTTP_200_OK
)
async def refresh_token(
    request: Request,
    user_service: UserService = Depends(get_user_service),
):
    """
    Refresh the access token for the current user.
    
    Returns a new JWT token with updated expiration.
    """
    auth_header = request.headers.get("Authorization")
    
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = auth_header[7:]
    token_data = decode_access_token(token)
    
    if token_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = user_service.get_user_by_username(token_data.username)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user_service.create_token(user)


@router.post(
    "/logout",
    summary="Logout (invalidate token)",
    status_code=status.HTTP_200_OK
)
async def logout():
    """
    Logout endpoint.
    
    Note: JWT tokens are stateless and cannot be invalidated server-side.
    The client should remove the token from storage.
    """
    return JSONResponse({
        "message": "Logged out successfully. Please remove the token from client storage."
    })
