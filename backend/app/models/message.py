"""
Message model for storing chat messages.
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base


class Message(Base):
    """
    Message model representing a single message in a conversation.
    """
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(20), nullable=False)  # 'user', 'assistant', 'system'
    content = Column(Text, nullable=False)
    model_id = Column(String(100), nullable=True)
    is_streaming = Column(Boolean, default=False)
    
    # Metadata
    token_count = Column(Integer, nullable=True)
    latency_ms = Column(Integer, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    conversation = relationship("Conversation", back_populates="messages")
    
    def __repr__(self):
        return f"<Message(id={self.id}, conversation_id={self.conversation_id}, role='{self.role}')>"
    
    @property
    def is_user_message(self) -> bool:
        """Check if message is from user."""
        return self.role == "user"
    
    @property
    def is_assistant_message(self) -> bool:
        """Check if message is from assistant."""
        return self.role == "assistant"
