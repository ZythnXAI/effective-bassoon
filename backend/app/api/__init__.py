"""
API routers for NexusMind AI backend.
"""

from .auth import router as auth_router
from .chat import router as chat_router
from .conversations import router as conversations_router
from .models import router as models_router
from .health import router as health_router

__all__ = [
    "auth_router",
    "chat_router",
    "conversations_router",
    "models_router",
    "health_router",
]
