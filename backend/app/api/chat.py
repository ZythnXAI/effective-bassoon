"""
Chat API endpoints for AI interactions.
"""

import asyncio
import time
from typing import Optional, AsyncGenerator
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import JSONResponse, StreamingResponse
from sqlalchemy.orm import Session
from datetime import datetime
from pydantic import BaseModel, Field

from ..core.database import get_db
from ..core.security import decode_access_token
from ..services.ai_service import AIService, get_ai_service
from ..services.conversation_service import ConversationService, get_conversation_service
from ..services.user_service import UserService, get_user_service
from ..models.message import Message
from ..models.conversation import Conversation

router = APIRouter(prefix="/api/chat", tags=["chat"])


class ChatMessage(BaseModel):
    """Message model for chat requests."""
    role: str = Field(default="user", description="Role of the message sender")
    content: str = Field(..., description="Content of the message")


class ChatRequest(BaseModel):
    """Request model for chat completion."""
    model_id: str = Field(
        default="llama-3-8b",
        description="ID of the AI model to use"
    )
    messages: list[ChatMessage] = Field(
        default_factory=list,
        description="List of messages in the conversation"
    )
    temperature: float = Field(
        default=0.7,
        ge=0.0,
        le=2.0,
        description="Sampling temperature"
    )
    max_tokens: Optional[int] = Field(
        default=None,
        ge=1,
        le=10000,
        description="Maximum tokens to generate"
    )
    stream: bool = Field(
        default=False,
        description="Whether to stream the response"
    )
    conversation_id: Optional[int] = Field(
        default=None,
        description="ID of the conversation to continue"
    )


class ChatResponse(BaseModel):
    """Response model for chat completion."""
    id: str
    model_id: str
    content: str
    role: str = "assistant"
    finish_reason: Optional[str] = None
    created_at: datetime
    latency_ms: Optional[int] = None
    token_count: Optional[int] = None
    conversation_id: Optional[int] = None
    
    class Config:
        from_attributes = True


class ModelInfo(BaseModel):
    """Model information model."""
    id: str
    name: str
    provider: str
    type: str
    supports_streaming: bool


@router.get(
    "/models",
    summary="List available AI models",
    response_model=list[ModelInfo],
    status_code=status.HTTP_200_OK
)
async def list_models(
    ai_service: AIService = Depends(get_ai_service),
):
    """
    Get a list of all available AI models.
    
    Returns information about each model including:
    - Model ID
    - Name
    - Provider
    - Type (chat, code, search, etc.)
    - Streaming support
    """
    models = ai_service.get_available_models()
    return [ModelInfo(**model) for model in models]


@router.get(
    "/models/{model_id}",
    summary="Get model information",
    response_model=ModelInfo,
    status_code=status.HTTP_200_OK
)
async def get_model_info(
    model_id: str,
    ai_service: AIService = Depends(get_ai_service),
):
    """
    Get detailed information about a specific model.
    """
    config = ai_service.get_model_config(model_id)
    
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Model {model_id} not found"
        )
    
    return ModelInfo(
        id=model_id,
        name=config["name"],
        provider=config["provider"],
        type=config["type"],
        supports_streaming=config["supports_streaming"],
    )


@router.post(
    "/",
    summary="Send chat message",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK
)
async def chat_completion(
    request: ChatRequest,
    chat_request: Request,
    ai_service: AIService = Depends(get_ai_service),
    conversation_service: ConversationService = Depends(get_conversation_service),
    user_service: UserService = Depends(get_user_service),
):
    """
    Send a chat message and receive a response from the AI.
    
    This is the main endpoint for chat interactions.
    
    **Authentication**: Required (JWT token in Authorization header)
    
    **Request Body**:
    - **model_id**: ID of the model to use (default: llama-3-8b)
    - **messages**: List of previous messages in the conversation
    - **temperature**: Sampling temperature (0.0-2.0)
    - **max_tokens**: Maximum tokens to generate
    - **stream**: Whether to stream the response (default: false)
    - **conversation_id**: Optional conversation ID to continue
    """
    # Get current user from token
    auth_header = chat_request.headers.get("Authorization")
    
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
    
    start_time = time.time()
    
    # Handle conversation
    conversation_id = request.conversation_id
    
    if conversation_id:
        # Continue existing conversation
        conversation = conversation_service.get_conversation(conversation_id, user.id)
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
    else:
        # Create new conversation
        conversation = conversation_service.create_conversation(
            user_id=user.id,
            model_id=request.model_id,
        )
        conversation_id = conversation.id
    
    # Save user message
    user_message = request.messages[-1] if request.messages else ChatMessage(
        role="user",
        content=""
    )
    
    await conversation_service.add_message(
        conversation_id=conversation_id,
        role=user_message.role,
        content=user_message.content,
        model_id=request.model_id,
        user_id=user.id,
    )
    
    # Prepare messages for AI
    messages = [
        {"role": msg.role, "content": msg.content}
        for msg in request.messages
    ]
    
    # Call AI service
    try:
        if request.stream:
            # For non-streaming fallback
            response_text = await ai_service.chat(
                model_id=request.model_id,
                messages=messages,
                temperature=request.temperature,
                max_tokens=request.max_tokens,
                stream=False,
            )
        else:
            response_text = await ai_service.chat(
                model_id=request.model_id,
                messages=messages,
                temperature=request.temperature,
                max_tokens=request.max_tokens,
                stream=False,
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI service error: {str(e)}"
        )
    
    latency_ms = int((time.time() - start_time) * 1000)
    
    # Save assistant message
    await conversation_service.add_message(
        conversation_id=conversation_id,
        role="assistant",
        content=response_text,
        model_id=request.model_id,
        user_id=user.id,
        latency_ms=latency_ms,
    )
    
    # Update conversation title if it's the first message
    if len(request.messages) == 1:
        first_message = request.messages[0].content[:50]
        conversation_service.update_conversation(
            conversation_id=conversation_id,
            user_id=user.id,
            title=first_message,
        )
    
    return ChatResponse(
        id=f"msg_{int(time.time() * 1000)}",
        model_id=request.model_id,
        content=response_text,
        role="assistant",
        finish_reason="stop",
        created_at=datetime.utcnow(),
        latency_ms=latency_ms,
        token_count=len(response_text.split()),
        conversation_id=conversation_id,
    )


@router.post(
    "/stream",
    summary="Stream chat response",
    status_code=status.HTTP_200_OK
)
async def chat_stream(
    request: ChatRequest,
    chat_request: Request,
    ai_service: AIService = Depends(get_ai_service),
    conversation_service: ConversationService = Depends(get_conversation_service),
    user_service: UserService = Depends(get_user_service),
):
    """
    Stream chat response in real-time.
    
    Returns a Server-Sent Events (SSE) stream of the AI response.
    
    **Authentication**: Required (JWT token in Authorization header)
    
    **Request Body**: Same as /api/chat endpoint
    
    **Response**: SSE stream with chunks of the response
    """
    # Get current user from token
    auth_header = chat_request.headers.get("Authorization")
    
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
    
    start_time = time.time()
    
    # Handle conversation
    conversation_id = request.conversation_id
    
    if conversation_id:
        conversation = conversation_service.get_conversation(conversation_id, user.id)
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
    else:
        conversation = conversation_service.create_conversation(
            user_id=user.id,
            model_id=request.model_id,
        )
        conversation_id = conversation.id
    
    # Save user message
    user_message = request.messages[-1] if request.messages else ChatMessage(
        role="user",
        content=""
    )
    
    await conversation_service.add_message(
        conversation_id=conversation_id,
        role=user_message.role,
        content=user_message.content,
        model_id=request.model_id,
        user_id=user.id,
    )
    
    # Prepare messages for AI
    messages = [
        {"role": msg.role, "content": msg.content}
        for msg in request.messages
    ]
    
    async def generate_stream():
        """Generate streaming response."""
        full_response = ""
        first_chunk = True
        
        try:
            # Call AI service with streaming
            async for chunk in ai_service.chat(
                model_id=request.model_id,
                messages=messages,
                temperature=request.temperature,
                max_tokens=request.max_tokens,
                stream=True,
            ):
                if first_chunk:
                    # Send initial metadata
                    yield f"data: {json.dumps({'type': 'start', 'model_id': request.model_id, 'conversation_id': conversation_id})}\n\n"
                    first_chunk = False
                
                # Send chunk
                yield f"data: {json.dumps({'type': 'chunk', 'content': chunk})}\n\n"
                full_response += chunk
            
            latency_ms = int((time.time() - start_time) * 1000)
            
            # Save assistant message
            await conversation_service.add_message(
                conversation_id=conversation_id,
                role="assistant",
                content=full_response,
                model_id=request.model_id,
                user_id=user.id,
                latency_ms=latency_ms,
                is_streaming=True,
            )
            
            # Update conversation title if it's the first message
            if len(request.messages) == 1:
                first_message = request.messages[0].content[:50]
                conversation_service.update_conversation(
                    conversation_id=conversation_id,
                    user_id=user.id,
                    title=first_message,
                )
            
            # Send completion event
            yield f"data: {json.dumps({'type': 'done', 'conversation_id': conversation_id, 'latency_ms': latency_ms})}\n\n"
            
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"
    
    import json
    return StreamingResponse(
        generate_stream(),
        media_type="text/event-stream",
    )


@router.post(
    "/search",
    summary="Semantic search",
    status_code=status.HTTP_200_OK
)
async def semantic_search(
    query: str = "",
    num_results: int = 5,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    chat_request: Request = None,
    ai_service: AIService = Depends(get_ai_service),
):
    """
    Perform semantic search using Exa AI.
    
    **Authentication**: Required (JWT token in Authorization header)
    
    **Query Parameters**:
    - **query**: Search query
    - **num_results**: Number of results (default: 5)
    - **start_date**: Start date filter (YYYY-MM-DD)
    - **end_date**: End date filter (YYYY-MM-DD)
    """
    # Verify authentication
    auth_header = chat_request.headers.get("Authorization")
    
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
    
    try:
        results = await ai_service.exa_search(
            query=query,
            num_results=num_results,
            start_published_date=start_date,
            end_published_date=end_date,
        )
        
        return JSONResponse({
            "query": query,
            "results": results,
            "count": len(results),
        })
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Search error: {str(e)}"
        )


@router.post(
    "/execute",
    summary="Execute code",
    status_code=status.HTTP_200_OK
)
async def execute_code(
    code: str = "",
    language: str = "python",
    timeout: int = 30,
    chat_request: Request = None,
    ai_service: AIService = Depends(get_ai_service),
):
    """
    Execute code using Daytona API.
    
    **Authentication**: Required (JWT token in Authorization header)
    
    **Query Parameters**:
    - **code**: Code to execute
    - **language**: Programming language (default: python)
    - **timeout**: Timeout in seconds (default: 30)
    """
    # Verify authentication
    auth_header = chat_request.headers.get("Authorization")
    
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
    
    try:
        result = await ai_service.daytona_execute(
            code=code,
            language=language,
            timeout=timeout,
        )
        
        return JSONResponse(result)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Execution error: {str(e)}"
        )


@router.post(
    "/browse",
    summary="Browse web",
    status_code=status.HTTP_200_OK
)
async def browse_web(
    url: str = "",
    action: str = "visit",
    timeout: int = 30,
    chat_request: Request = None,
    ai_service: AIService = Depends(get_ai_service),
):
    """
    Browse a URL using BrowserBase API.
    
    **Authentication**: Required (JWT token in Authorization header)
    
    **Query Parameters**:
    - **url**: URL to browse
    - **action**: Action to perform (default: visit)
    - **timeout**: Timeout in seconds (default: 30)
    """
    # Verify authentication
    auth_header = chat_request.headers.get("Authorization")
    
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
    
    try:
        result = await ai_service.browserbase_browse(
            url=url,
            action=action,
            timeout=timeout,
        )
        
        return JSONResponse(result)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Browsing error: {str(e)}"
        )
