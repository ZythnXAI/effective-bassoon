"""
Base model for SQLAlchemy models.
"""

from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
from sqlalchemy import Column, DateTime

Base = declarative_base()


class BaseModel:
    """Base model with common fields."""
    
    id = Column(DateTime, primary_key=True, index=True, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
