"""
Model configuration for AI models.
"""

from sqlalchemy import Column, Integer, String, Text, Boolean, Float
from .base import Base


class ModelConfig(Base):
    """
    Model configuration for available AI models.
    """
    __tablename__ = "model_configs"
    
    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(String(100), unique=True, nullable=False)
    name = Column(String(200), nullable=False)
    provider = Column(String(100), nullable=False)  # e2b, groq, manus, etc.
    description = Column(Text, nullable=True)
    
    # Model capabilities
    supports_chat = Column(Boolean, default=True)
    supports_code = Column(Boolean, default=False)
    supports_image = Column(Boolean, default=False)
    supports_streaming = Column(Boolean, default=True)
    
    # Pricing (optional)
    price_per_1k_tokens_input = Column(Float, nullable=True)
    price_per_1k_tokens_output = Column(Float, nullable=True)
    
    # Limits
    max_tokens = Column(Integer, nullable=True)
    context_window = Column(Integer, nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True)
    is_default = Column(Boolean, default=False)
    
    def __repr__(self):
        return f"<ModelConfig(id={self.id}, model_id='{self.model_id}', provider='{self.provider}')>"
