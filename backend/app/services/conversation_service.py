"""
Conversation service for managing chat conversations.
"""

from typing import Optional, Union
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from ..models.conversation import Conversation
from ..models.message import Message
from ..models.user import User
from ..core.database import get_db
from pydantic import BaseModel


# Pydantic models for request/response
class ConversationCreate(BaseModel):
    model_id: str
    title: Optional[str] = None


class ConversationUpdate(BaseModel):
    title: Optional[str] = None
    is_favorite: Optional[bool] = None


class ConversationResponse(BaseModel):
    id: int
    user_id: int
    title: Optional[str] = None
    model_id: str
    is_favorite: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class MessageResponse(BaseModel):
    id: int
    conversation_id: int
    role: str
    content: str
    model_id: Optional[str] = None
    is_streaming: bool
    token_count: Optional[int] = None
    latency_ms: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class ConversationService:
    """Service for managing conversations and messages."""
    
    def __init__(self, db: Session = Depends(get_db)):
        self.db = db
    
    def get_conversation(self, conversation_id: int, user_id: int) -> Optional[Conversation]:
        """Get a specific conversation for a user."""
        return self.db.query(Conversation).filter(
            Conversation.id == conversation_id,
            Conversation.user_id == user_id
        ).first()
    
    def get_conversations(self, user_id: int, limit: int = 50, offset: int = 0) -> list[Conversation]:
        """Get all conversations for a user."""
        return self.db.query(Conversation).filter(
            Conversation.user_id == user_id
        ).order_by(Conversation.updated_at.desc()).limit(limit).offset(offset).all()
    
    def create_conversation(
        self,
        user_id: int,
        model_id: str,
        title: Optional[str] = None
    ) -> Conversation:
        """Create a new conversation."""
        conversation = Conversation(
            user_id=user_id,
            model_id=model_id,
            title=title or f"Nova conversa - {datetime.now().strftime('%d/%m/%Y')}",
        )
        
        self.db.add(conversation)
        self.db.commit()
        self.db.refresh(conversation)
        
        return conversation
    
    def update_conversation(
        self,
        conversation_id: int,
        user_id: int,
        title: Optional[str] = None,
        is_favorite: Optional[bool] = None,
    ) -> Optional[Conversation]:
        """Update a conversation."""
        conversation = self.get_conversation(conversation_id, user_id)
        
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
        
        if title is not None:
            conversation.title = title
        if is_favorite is not None:
            conversation.is_favorite = is_favorite
        
        conversation.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(conversation)
        
        return conversation
    
    def delete_conversation(self, conversation_id: int, user_id: int) -> bool:
        """Delete a conversation."""
        conversation = self.get_conversation(conversation_id, user_id)
        
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
        
        self.db.delete(conversation)
        self.db.commit()
        
        return True
    
    def get_messages(
        self,
        conversation_id: int,
        user_id: int,
        limit: int = 100,
        offset: int = 0
    ) -> list[Message]:
        """Get all messages in a conversation."""
        # Verify conversation belongs to user
        conversation = self.get_conversation(conversation_id, user_id)
        
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
        
        return self.db.query(Message).filter(
            Message.conversation_id == conversation_id
        ).order_by(Message.created_at.asc()).limit(limit).offset(offset).all()
    
    def get_message(self, message_id: int, user_id: int) -> Optional[Message]:
        """Get a specific message."""
        message = self.db.query(Message).filter(
            Message.id == message_id
        ).first()
        
        if message and message.conversation.user_id != user_id:
            return None
        
        return message
    
    def add_message(
        self,
        conversation_id: int,
        role: str,
        content: str,
        model_id: Optional[str] = None,
        user_id: Optional[int] = None,
        is_streaming: bool = False,
        token_count: Optional[int] = None,
        latency_ms: Optional[int] = None,
    ) -> Message:
        """Add a message to a conversation."""
        # Verify conversation exists and belongs to user
        if user_id:
            conversation = self.db.query(Conversation).filter(
                Conversation.id == conversation_id,
                Conversation.user_id == user_id
            ).first()
        else:
            conversation = self.db.query(Conversation).filter(
                Conversation.id == conversation_id
            ).first()
        
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
        
        message = Message(
            conversation_id=conversation_id,
            role=role,
            content=content,
            model_id=model_id,
            is_streaming=is_streaming,
            token_count=token_count,
            latency_ms=latency_ms,
        )
        
        self.db.add(message)
        self.db.commit()
        self.db.refresh(message)
        
        # Update conversation timestamp
        conversation.updated_at = datetime.utcnow()
        self.db.commit()
        
        return message
    
    def update_message(
        self,
        message_id: int,
        content: Optional[str] = None,
        user_id: Optional[int] = None,
    ) -> Optional[Message]:
        """Update a message."""
        message = self.get_message(message_id, user_id) if user_id else self.db.query(Message).filter(
            Message.id == message_id
        ).first()
        
        if not message:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Message not found"
            )
        
        if content is not None:
            message.content = content
        
        self.db.commit()
        self.db.refresh(message)
        
        return message
    
    def delete_message(self, message_id: int, user_id: int) -> bool:
        """Delete a message."""
        message = self.get_message(message_id, user_id)
        
        if not message:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Message not found"
            )
        
        self.db.delete(message)
        self.db.commit()
        
        return True
    
    def toggle_favorite(self, conversation_id: int, user_id: int) -> Conversation:
        """Toggle favorite status of a conversation."""
        conversation = self.get_conversation(conversation_id, user_id)
        
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
        
        conversation.is_favorite = not conversation.is_favorite
        conversation.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(conversation)
        
        return conversation
    
    def get_conversation_stats(self, conversation_id: int, user_id: int) -> dict:
        """Get statistics for a conversation."""
        conversation = self.get_conversation(conversation_id, user_id)
        
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
        
        messages = self.get_messages(conversation_id, user_id)
        
        return {
            "id": conversation.id,
            "title": conversation.title,
            "model_id": conversation.model_id,
            "message_count": len(messages),
            "created_at": conversation.created_at,
            "updated_at": conversation.updated_at,
            "is_favorite": conversation.is_favorite,
        }


def get_conversation_service(db: Session = Depends(get_db)) -> ConversationService:
    """Dependency to get conversation service."""
    return ConversationService(db)
