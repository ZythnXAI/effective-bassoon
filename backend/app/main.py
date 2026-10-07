"""
Main application file for NexusMind AI backend.
This file initializes the FastAPI application and mounts all routers.
"""

import json
import logging
from contextlib import asynccontextmanager
from datetime import datetime
from typing import AsyncGenerator

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.staticfiles import StaticFiles

from .core.config import settings
from .core.database import engine, Base
from .api import (
    auth_router,
    chat_router,
    conversations_router,
    models_router,
    health_router,
)

# Configure logging
logging_config = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "json": {
            "()": "pythonjsonlogger.jsonlogger.JsonFormatter",
            "fmt": "%(asctime)s %(levelname)s %(name)s %(message)s",
        },
        "simple": {
            "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "json" if settings.log_format == "json" else "simple",
            "level": settings.log_level,
        },
    },
    "root": {
        "handlers": ["console"],
        "level": settings.log_level,
    },
}

logging.config.dictConfig(logging_config)
logger = logging.getLogger(__name__)


# Lifespan management
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Application lifespan manager.
    Handles startup and shutdown events.
    """
    # Startup
    logger.info(f"Starting {settings.app_name} v{settings.app_version}")
    logger.info(f"Server: {settings.backend_host}:{settings.backend_port}")
    
    # Create database tables
    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created")
    
    yield
    
    # Shutdown
    logger.info(f"Shutting down {settings.app_name}")


# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="""
    # NexusMind AI - Plataforma de IA Conversacional
    
    ## Sobre
    
    NexusMind AI é uma plataforma completa de chat de IA que integra múltiplos modelos de linguagem 
    e ferramentas de IA através de APIs de terceiros.
    
    ## Funcionalidades
    
    - **Chat em tempo real** com múltiplos modelos de IA
    - **Integração com 8+ APIs de IA** (E2B, Exa AI, Manus AI, GROQ, Fal AI, Daytona, BrowserBase, NVIDIA NIM)
    - **Gerenciamento de conversas** (histórico, favoritos, exclusão)
    - **Autenticação de usuários** (JWT-based)
    - **Streaming de respostas** para melhor UX
    
    ## Autenticação
    
    A maioria dos endpoints requer autenticação via JWT token no header `Authorization`:
    
    ```
    Authorization: Bearer <token>
    ```
    
    Para obter um token, use o endpoint `/api/auth/login`.
    
    ## Modelos Disponíveis
    
    - **E2B**: e2b-code, e2b-chat
    - **GROQ**: llama-3-8b, mixtral-8x7b, gemma-7b
    - **Manus AI**: manus-v2
    - **Fal AI**: fal-llm
    - **NVIDIA NIM**: nim-llama-3
    - **Daytona**: daytona-code (execução de código)
    - **Exa AI**: exa-search (busca semântica)
    - **BrowserBase**: browserbase-browser (navegação web)
    """,
    openapi_url="/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)


# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(health_router)
app.include_router(auth_router)
app.include_router(chat_router)
app.include_router(conversations_router)
app.include_router(models_router)


# Global exception handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request, exc: RequestValidationError
):
    """Handle validation errors."""
    logger.error(f"Validation error: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={
            "error": "Validation Error",
            "detail": exc.errors(),
            "timestamp": datetime.utcnow().isoformat(),
        },
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle unexpected errors."""
    logger.error(f"Unexpected error: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "detail": str(exc),
            "timestamp": datetime.utcnow().isoformat(),
        },
    )


# Root endpoint
@app.get("/", tags=["root"])
async def root():
    """Root endpoint with basic information."""
    return JSONResponse({
        "app": settings.app_name,
        "version": settings.app_version,
        "docs": "/docs",
        "health": "/api/health",
        "timestamp": datetime.utcnow().isoformat(),
    })


# Add static files (for potential frontend build)
app.mount("/static", StaticFiles(directory="static"), name="static")


# For running with uvicorn directly
if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host=settings.backend_host,
        port=settings.backend_port,
        reload=settings.debug,
        log_level=settings.log_level.lower(),
    )
