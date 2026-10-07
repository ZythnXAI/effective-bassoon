"""
User service for authentication and user management.
"""

from typing import Optional, Union
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from jose import JWTError

from ..models.user import User
from ..models.conversation import Conversation
from ..core.database import get_db
from ..core.security import (
    create_access_token,
    get_password_hash,
    verify_password,
    decode_access_token,
    Token,
    TokenData,
)
from ..core.config import settings
from pydantic import BaseModel


# Pydantic models for request/response
class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    full_name: Optional[str] = None


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str] = None
    is_active: bool
    is_superuser: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserService:
    """Service for user management and authentication."""
    
    def __init__(self, db: Session = Depends(get_db)):
        self.db = db
    
    def get_user_by_username(self, username: str) -> Optional[User]:
        """Get user by username."""
        return self.db.query(User).filter(User.username == username).first()
    
    def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email."""
        return self.db.query(User).filter(User.email == email).first()
    
    def get_user_by_id(self, user_id: int) -> Optional[User]:
        """Get user by ID."""
        return self.db.query(User).filter(User.id == user_id).first()
    
    def create_user(self, user_data: UserCreate) -> User:
        """Create a new user."""
        # Check if username already exists
        if self.get_user_by_username(user_data.username):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered"
            )
        
        # Check if email already exists
        if self.get_user_by_email(user_data.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Hash password
        hashed_password = get_password_hash(user_data.password)
        
        # Create user
        user = User(
            username=user_data.username,
            email=user_data.email,
            hashed_password=hashed_password,
            full_name=user_data.full_name,
        )
        
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        
        return user
    
    def authenticate_user(self, username: str, password: str) -> Optional[User]:
        """Authenticate a user."""
        user = self.get_user_by_username(username)
        
        if not user:
            return None
        
        if not verify_password(password, user.hashed_password):
            return None
        
        return user
    
    def create_token(self, user: User) -> Token:
        """Create JWT token for user."""
        token_data = {"sub": user.username, "id": user.id}
        access_token = create_access_token(token_data)
        
        # Update last login
        user.last_login = datetime.utcnow()
        self.db.commit()
        
        return Token(access_token=access_token, token_type="bearer")
    
    def get_current_user(self, token: str) -> Optional[User]:
        """Get current user from JWT token."""
        token_data = decode_access_token(token)
        
        if token_data is None:
            return None
        
        user = self.get_user_by_username(token_data.username)
        return user
    
    def get_user_conversations(self, user_id: int) -> list[Conversation]:
        """Get all conversations for a user."""
        return self.db.query(Conversation).filter(
            Conversation.user_id == user_id
        ).order_by(Conversation.updated_at.desc()).all()
    
    def get_user_stats(self, user_id: int) -> dict:
        """Get statistics for a user."""
        user = self.get_user_by_id(user_id)
        if not user:
            return {}
        
        conversations = self.get_user_conversations(user_id)
        total_messages = sum(len(c.messages) for c in conversations)
        
        return {
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "total_conversations": len(conversations),
            "total_messages": total_messages,
            "created_at": user.created_at,
        }


def get_user_service(db: Session = Depends(get_db)) -> UserService:
    """Dependency to get user service."""
    return UserService(db)
