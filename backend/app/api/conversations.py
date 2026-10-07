"""
Conversations API endpoints for managing chat history.
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from datetime import datetime
from pydantic import BaseModel, Field

from ..core.database import get_db
from ..core.security import decode_access_token
from ..services.conversation_service import (
    ConversationService,
    get_conversation_service,
    ConversationCreate,
    ConversationUpdate,
    ConversationResponse,
    MessageResponse,
)
from ..services.user_service import UserService, get_user_service
from ..models.conversation import Conversation
from ..models.message import Message

router = APIRouter(prefix="/api/conversations", tags=["conversations"])


class ConversationListResponse(BaseModel):
    """Response model for listing conversations."""
    conversations: list[ConversationResponse]
    total: int
    limit: int
    offset: int
    
    class Config:
        from_attributes = True


class MessageListResponse(BaseModel):
    """Response model for listing messages."""
    messages: list[MessageResponse]
    conversation_id: int
    total: int
    
    class Config:
        from_attributes = True


@router.get(
    "/",
    summary="List all conversations",
    response_model=ConversationListResponse,
    status_code=status.HTTP_200_OK
)
async def list_conversations(
    limit: int = 50,
    offset: int = 0,
    request: Request = None,
    conversation_service: ConversationService = Depends(get_conversation_service),
    user_service: UserService = Depends(get_user_service),
):
    """
    Get a list of all conversations for the current user.
    
    **Authentication**: Required (JWT token in Authorization header)
    
    **Query Parameters**:
    - **limit**: Maximum number of conversations to return (default: 50)
    - **offset**: Number of conversations to skip (default: 0)
    
    Returns:
    - List of conversations
    - Total count
    - Pagination info
    """
    # Verify authentication
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
    
    conversations = conversation_service.get_conversations(
        user_id=user.id,
        limit=limit,
        offset=offset
    )
    
    total = len(conversations)
    
    return ConversationListResponse(
        conversations=[ConversationResponse.from_orm(c) for c in conversations],
        total=total,
        limit=limit,
        offset=offset,
    )


@router.post(
    "/",
    summary="Create a new conversation",
    response_model=ConversationResponse,
    status_code=status.HTTP_201_CREATED
)
async def create_conversation(
    conversation_data: ConversationCreate,
    request: Request = None,
    conversation_service: ConversationService = Depends(get_conversation_service),
    user_service: UserService = Depends(get_user_service),
):
    """
    Create a new conversation.
    
    **Authentication**: Required (JWT token in Authorization header)
    
    **Request Body**:
    - **model_id**: ID of the AI model to use
    - **title**: Optional conversation title
    
    Returns:
    - Created conversation
    """
    # Verify authentication
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
    
    conversation = conversation_service.create_conversation(
        user_id=user.id,
        model_id=conversation_data.model_id,
        title=conversation_data.title,
    )
    
    return ConversationResponse.from_orm(conversation)


@router.get(
    "/{conversation_id}",
    summary="Get a specific conversation",
    response_model=ConversationResponse,
    status_code=status.HTTP_200_OK
)
async def get_conversation(
    conversation_id: int,
    request: Request = None,
    conversation_service: ConversationService = Depends(get_conversation_service),
    user_service: UserService = Depends(get_user_service),
):
    """
    Get detailed information about a specific conversation.
    
    **Authentication**: Required (JWT token in Authorization header)
    
    **Path Parameters**:
    - **conversation_id**: ID of the conversation to retrieve
    
    Returns:
    - Conversation details
    """
    # Verify authentication
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
    
    conversation = conversation_service.get_conversation(conversation_id, user.id)
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    return ConversationResponse.from_orm(conversation)


@router.patch(
    "/{conversation_id}",
    summary="Update a conversation",
    response_model=ConversationResponse,
    status_code=status.HTTP_200_OK
)
async def update_conversation(
    conversation_id: int,
    update_data: ConversationUpdate,
    request: Request = None,
    conversation_service: ConversationService = Depends(get_conversation_service),
    user_service: UserService = Depends(get_user_service),
):
    """
    Update a conversation's properties.
    
    **Authentication**: Required (JWT token in Authorization header)
    
    **Path Parameters**:
    - **conversation_id**: ID of the conversation to update
    
    **Request Body**:
    - **title**: New title for the conversation
    - **is_favorite**: Whether to mark as favorite
    
    Returns:
    - Updated conversation
    """
    # Verify authentication
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
    
    conversation = conversation_service.update_conversation(
        conversation_id=conversation_id,
        user_id=user.id,
        title=update_data.title,
        is_favorite=update_data.is_favorite,
    )
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    return ConversationResponse.from_orm(conversation)


@router.delete(
    "/{conversation_id}",
    summary="Delete a conversation",
    status_code=status.HTTP_204_NO_CONTENT
)
async def delete_conversation(
    conversation_id: int,
    request: Request = None,
    conversation_service: ConversationService = Depends(get_conversation_service),
    user_service: UserService = Depends(get_user_service),
):
    """
    Delete a conversation and all its messages.
    
    **Authentication**: Required (JWT token in Authorization header)
    
    **Path Parameters**:
    - **conversation_id**: ID of the conversation to delete
    """
    # Verify authentication
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
    
    success = conversation_service.delete_conversation(conversation_id, user.id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    return JSONResponse(status_code=status.HTTP_204_NO_CONTENT)


@router.get(
    "/{conversation_id}/messages",
    summary="Get messages in a conversation",
    response_model=MessageListResponse,
    status_code=status.HTTP_200_OK
)
async def get_messages(
    conversation_id: int,
    limit: int = 100,
    offset: int = 0,
    request: Request = None,
    conversation_service: ConversationService = Depends(get_conversation_service),
    user_service: UserService = Depends(get_user_service),
):
    """
    Get all messages in a specific conversation.
    
    **Authentication**: Required (JWT token in Authorization header)
    
    **Path Parameters**:
    - **conversation_id**: ID of the conversation
    
    **Query Parameters**:
    - **limit**: Maximum number of messages to return (default: 100)
    - **offset**: Number of messages to skip (default: 0)
    
    Returns:
    - List of messages
    - Conversation ID
    - Total count
    """
    # Verify authentication
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
    
    messages = conversation_service.get_messages(
        conversation_id=conversation_id,
        user_id=user.id,
        limit=limit,
        offset=offset
    )
    
    return MessageListResponse(
        messages=[MessageResponse.from_orm(m) for m in messages],
        conversation_id=conversation_id,
        total=len(messages),
    )


@router.post(
    "/{conversation_id}/favorite",
    summary="Toggle favorite status",
    response_model=ConversationResponse,
    status_code=status.HTTP_200_OK
)
async def toggle_favorite(
    conversation_id: int,
    request: Request = None,
    conversation_service: ConversationService = Depends(get_conversation_service),
    user_service: UserService = Depends(get_user_service),
):
    """
    Toggle the favorite status of a conversation.
    
    **Authentication**: Required (JWT token in Authorization header)
    
    **Path Parameters**:
    - **conversation_id**: ID of the conversation to toggle
    
    Returns:
    - Updated conversation
    """
    # Verify authentication
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
    
    conversation = conversation_service.toggle_favorite(conversation_id, user.id)
    
    return ConversationResponse.from_orm(conversation)


@router.get(
    "/{conversation_id}/stats",
    summary="Get conversation statistics",
    status_code=status.HTTP_200_OK
)
async def get_conversation_stats(
    conversation_id: int,
    request: Request = None,
    conversation_service: ConversationService = Depends(get_conversation_service),
    user_service: UserService = Depends(get_user_service),
):
    """
    Get statistics for a specific conversation.
    
    **Authentication**: Required (JWT token in Authorization header)
    
    **Path Parameters**:
    - **conversation_id**: ID of the conversation
    
    Returns:
    - Conversation statistics
    """
    # Verify authentication
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
    
    return conversation_service.get_conversation_stats(conversation_id, user.id)
