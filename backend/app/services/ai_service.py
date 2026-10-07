"""
AI Service for integrating multiple AI APIs.
This service handles all AI model interactions and provides a unified interface.
"""

import asyncio
import json
import time
from typing import Optional, Union, AsyncGenerator, Any
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
import httpx
from datetime import datetime

from ..core.config import settings
from ..core.database import get_db
from ..models.message import Message
from ..models.conversation import Conversation
from ..services.conversation_service import get_conversation_service


class AIService:
    """
    Service for AI model interactions.
    Integrates with multiple AI APIs (E2B, GROQ, Manus, Exa, Fal, Daytona, BrowserBase, NVIDIA NIM).
    """
    
    # Model configurations
    MODELS = {
        # E2B Models
        "e2b-code": {
            "provider": "e2b",
            "name": "E2B Code",
            "type": "code",
            "supports_streaming": True,
        },
        "e2b-chat": {
            "provider": "e2b",
            "name": "E2B Chat",
            "type": "chat",
            "supports_streaming": True,
        },
        
        # GROQ Models
        "llama-3-8b": {
            "provider": "groq",
            "name": "Llama 3 8B",
            "type": "chat",
            "supports_streaming": True,
        },
        "mixtral-8x7b": {
            "provider": "groq",
            "name": "Mixtral 8x7B",
            "type": "chat",
            "supports_streaming": True,
        },
        "gemma-7b": {
            "provider": "groq",
            "name": "Gemma 7B",
            "type": "chat",
            "supports_streaming": True,
        },
        
        # Manus AI
        "manus-v2": {
            "provider": "manus",
            "name": "Manus v2",
            "type": "chat",
            "supports_streaming": True,
        },
        
        # Fal AI
        "fal-llm": {
            "provider": "fal",
            "name": "Fal LLM",
            "type": "chat",
            "supports_streaming": True,
        },
        
        # NVIDIA NIM
        "nim-llama-3": {
            "provider": "nvidia_nim",
            "name": "NVIDIA Llama 3",
            "type": "chat",
            "supports_streaming": True,
        },
        
        # Daytona (Code Execution)
        "daytona-code": {
            "provider": "daytona",
            "name": "Daytona Code",
            "type": "code_execution",
            "supports_streaming": False,
        },
        
        # Exa AI (Semantic Search)
        "exa-search": {
            "provider": "exa",
            "name": "Exa Search",
            "type": "search",
            "supports_streaming": False,
        },
        
        # BrowserBase (Web Browsing)
        "browserbase-browser": {
            "provider": "browserbase",
            "name": "BrowserBase Browser",
            "type": "web_browsing",
            "supports_streaming": False,
        },
    }
    
    def __init__(
        self,
        db: Session = Depends(get_db),
        conversation_service: Optional[Any] = None
    ):
        self.db = db
        self.conversation_service = conversation_service
        self._clients = {}
    
    def _get_client(self, provider: str) -> httpx.AsyncClient:
        """Get or create an HTTP client for a provider."""
        if provider not in self._clients:
            timeout = httpx.Timeout(30.0, connect=10.0)
            self._clients[provider] = httpx.AsyncClient(timeout=timeout)
        return self._clients[provider]
    
    def _get_api_key(self, provider: str) -> str:
        """Get API key for a provider."""
        key_map = {
            "e2b": settings.e2b_api_key,
            "groq": settings.groq_api_key,
            "manus": settings.manus_ai_api_key,
            "fal": settings.fal_ai_api_key,
            "daytona": settings.daytona_api_key,
            "exa": settings.exa_ai_api_key,
            "browserbase": settings.browserbase_api_key,
            "nvidia_nim": settings.nvidia_nim_api_key,
        }
        key = key_map.get(provider)
        if not key:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"API key for {provider} not configured"
            )
        return key
    
    def _get_base_url(self, provider: str) -> str:
        """Get base URL for a provider."""
        url_map = {
            "e2b": settings.e2b_base_url,
            "groq": settings.groq_base_url,
            "manus": settings.manus_ai_base_url,
            "fal": settings.fal_ai_base_url,
            "daytona": settings.daytona_base_url,
            "exa": settings.exa_ai_base_url,
            "browserbase": settings.browserbase_base_url,
            "nvidia_nim": settings.nvidia_nim_base_url,
        }
        return url_map.get(provider, "")
    
    def get_available_models(self) -> list[dict]:
        """Get list of available AI models."""
        models = []
        for model_id, config in self.MODELS.items():
            models.append({
                "id": model_id,
                "name": config["name"],
                "provider": config["provider"],
                "type": config["type"],
                "supports_streaming": config["supports_streaming"],
            })
        return models
    
    def get_model_config(self, model_id: str) -> Optional[dict]:
        """Get configuration for a specific model."""
        return self.MODELS.get(model_id)
    
    async def chat(
        self,
        model_id: str,
        messages: list[dict],
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        stream: bool = False,
        conversation_id: Optional[int] = None,
        user_id: Optional[int] = None,
    ) -> Union[str, AsyncGenerator[str, None]]:
        """
        Send a chat message to an AI model.
        
        Args:
            model_id: ID of the model to use
            messages: List of message dictionaries (role, content)
            temperature: Sampling temperature
            max_tokens: Maximum tokens to generate
            stream: Whether to stream the response
            conversation_id: Optional conversation ID for saving
            user_id: Optional user ID for saving
        
        Returns:
            str or AsyncGenerator: The response or streaming generator
        """
        model_config = self.get_model_config(model_id)
        if not model_config:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Model {model_id} not found"
            )
        
        provider = model_config["provider"]
        
        # Route to appropriate provider handler
        if provider == "groq":
            return await self._groq_chat(
                model_id, messages, temperature, max_tokens, stream
            )
        elif provider == "e2b":
            return await self._e2b_chat(
                model_id, messages, temperature, max_tokens, stream
            )
        elif provider == "manus":
            return await self._manus_chat(
                model_id, messages, temperature, max_tokens, stream
            )
        elif provider == "fal":
            return await self._fal_chat(
                model_id, messages, temperature, max_tokens, stream
            )
        elif provider == "nvidia_nim":
            return await self._nvidia_nim_chat(
                model_id, messages, temperature, max_tokens, stream
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_501_NOT_IMPLEMENTED,
                detail=f"Provider {provider} not yet implemented"
            )
    
    async def _groq_chat(
        self,
        model_id: str,
        messages: list[dict],
        temperature: float,
        max_tokens: Optional[int],
        stream: bool,
    ) -> Union[str, AsyncGenerator[str, None]]:
        """Handle GROQ API chat requests."""
        client = self._get_client("groq")
        api_key = self._get_api_key("groq")
        base_url = self._get_base_url("groq")
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        
        payload = {
            "model": model_id,
            "messages": messages,
            "temperature": temperature,
        }
        
        if max_tokens:
            payload["max_tokens"] = max_tokens
        
        if stream:
            # Streaming response
            async with client.stream(
                "POST",
                f"{base_url}/chat/completions",
                headers=headers,
                json=payload,
            ) as response:
                if response.status_code != 200:
                    error = await response.aread()
                    raise HTTPException(
                        status_code=response.status_code,
                        detail=f"GROQ API error: {error.decode()}"
                    )
                
                async for line in response.aiter_lines():
                    if line:
                        line = line.strip()
                        if line.startswith("data:"):
                            data = line[5:].strip()
                            if data == "[DONE]":
                                break
                            try:
                                chunk = json.loads(data)
                                if "choices" in chunk and len(chunk["choices"]) > 0:
                                    content = chunk["choices"][0].get("delta", {}).get("content", "")
                                    if content:
                                        yield content
                            except json.JSONDecodeError:
                                continue
        else:
            # Non-streaming response
            response = await client.post(
                f"{base_url}/chat/completions",
                headers=headers,
                json=payload,
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"GROQ API error: {response.text}"
                )
            
            data = response.json()
            return data["choices"][0]["message"]["content"]
    
    async def _e2b_chat(
        self,
        model_id: str,
        messages: list[dict],
        temperature: float,
        max_tokens: Optional[int],
        stream: bool,
    ) -> Union[str, AsyncGenerator[str, None]]:
        """Handle E2B API chat requests."""
        client = self._get_client("e2b")
        api_key = self._get_api_key("e2b")
        base_url = self._get_base_url("e2b")
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        
        # Convert messages to E2B format
        e2b_messages = []
        for msg in messages:
            e2b_messages.append({
                "role": msg.get("role", "user"),
                "content": msg.get("content", ""),
            })
        
        payload = {
            "model": model_id,
            "messages": e2b_messages,
            "temperature": temperature,
        }
        
        if max_tokens:
            payload["max_tokens"] = max_tokens
        
        if stream:
            async with client.stream(
                "POST",
                f"{base_url}/v1/chat/completions",
                headers=headers,
                json=payload,
            ) as response:
                if response.status_code != 200:
                    error = await response.aread()
                    raise HTTPException(
                        status_code=response.status_code,
                        detail=f"E2B API error: {error.decode()}"
                    )
                
                async for line in response.aiter_lines():
                    if line:
                        line = line.strip()
                        if line.startswith("data:"):
                            data = line[5:].strip()
                            if data == "[DONE]":
                                break
                            try:
                                chunk = json.loads(data)
                                if "choices" in chunk and len(chunk["choices"]) > 0:
                                    content = chunk["choices"][0].get("delta", {}).get("content", "")
                                    if content:
                                        yield content
                            except json.JSONDecodeError:
                                continue
        else:
            response = await client.post(
                f"{base_url}/v1/chat/completions",
                headers=headers,
                json=payload,
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"E2B API error: {response.text}"
                )
            
            data = response.json()
            return data["choices"][0]["message"]["content"]
    
    async def _manus_chat(
        self,
        model_id: str,
        messages: list[dict],
        temperature: float,
        max_tokens: Optional[int],
        stream: bool,
    ) -> Union[str, AsyncGenerator[str, None]]:
        """Handle Manus AI API chat requests."""
        client = self._get_client("manus")
        api_key = self._get_api_key("manus")
        base_url = self._get_base_url("manus")
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        
        # Manus API format
        manus_messages = []
        for msg in messages:
            manus_messages.append({
                "role": msg.get("role", "user"),
                "content": msg.get("content", ""),
            })
        
        payload = {
            "model": model_id,
            "messages": manus_messages,
            "temperature": temperature,
        }
        
        if max_tokens:
            payload["max_tokens"] = max_tokens
        
        if stream:
            async with client.stream(
                "POST",
                f"{base_url}/v1/chat/completions",
                headers=headers,
                json=payload,
            ) as response:
                if response.status_code != 200:
                    error = await response.aread()
                    raise HTTPException(
                        status_code=response.status_code,
                        detail=f"Manus API error: {error.decode()}"
                    )
                
                async for line in response.aiter_lines():
                    if line:
                        line = line.strip()
                        if line.startswith("data:"):
                            data = line[5:].strip()
                            if data == "[DONE]":
                                break
                            try:
                                chunk = json.loads(data)
                                if "choices" in chunk and len(chunk["choices"]) > 0:
                                    content = chunk["choices"][0].get("delta", {}).get("content", "")
                                    if content:
                                        yield content
                            except json.JSONDecodeError:
                                continue
        else:
            response = await client.post(
                f"{base_url}/v1/chat/completions",
                headers=headers,
                json=payload,
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Manus API error: {response.text}"
                )
            
            data = response.json()
            return data["choices"][0]["message"]["content"]
    
    async def _fal_chat(
        self,
        model_id: str,
        messages: list[dict],
        temperature: float,
        max_tokens: Optional[int],
        stream: bool,
    ) -> Union[str, AsyncGenerator[str, None]]:
        """Handle Fal AI API chat requests."""
        client = self._get_client("fal")
        api_key = self._get_api_key("fal")
        base_url = self._get_base_url("fal")
        
        headers = {
            "Authorization": f"Key {api_key}",
            "Content-Type": "application/json",
        }
        
        # Fal AI format
        fal_messages = []
        for msg in messages:
            fal_messages.append({
                "role": msg.get("role", "user"),
                "content": msg.get("content", ""),
            })
        
        payload = {
            "model": model_id,
            "messages": fal_messages,
            "temperature": temperature,
        }
        
        if max_tokens:
            payload["max_tokens"] = max_tokens
        
        if stream:
            async with client.stream(
                "POST",
                f"{base_url}/v1/chat/completions",
                headers=headers,
                json=payload,
            ) as response:
                if response.status_code != 200:
                    error = await response.aread()
                    raise HTTPException(
                        status_code=response.status_code,
                        detail=f"Fal AI error: {error.decode()}"
                    )
                
                async for line in response.aiter_lines():
                    if line:
                        line = line.strip()
                        if line.startswith("data:"):
                            data = line[5:].strip()
                            if data == "[DONE]":
                                break
                            try:
                                chunk = json.loads(data)
                                if "choices" in chunk and len(chunk["choices"]) > 0:
                                    content = chunk["choices"][0].get("delta", {}).get("content", "")
                                    if content:
                                        yield content
                            except json.JSONDecodeError:
                                continue
        else:
            response = await client.post(
                f"{base_url}/v1/chat/completions",
                headers=headers,
                json=payload,
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Fal AI error: {response.text}"
                )
            
            data = response.json()
            return data["choices"][0]["message"]["content"]
    
    async def _nvidia_nim_chat(
        self,
        model_id: str,
        messages: list[dict],
        temperature: float,
        max_tokens: Optional[int],
        stream: bool,
    ) -> Union[str, AsyncGenerator[str, None]]:
        """Handle NVIDIA NIM API chat requests."""
        client = self._get_client("nvidia_nim")
        api_key = self._get_api_key("nvidia_nim")
        base_url = self._get_base_url("nvidia_nim")
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        
        # NVIDIA NIM format
        nim_messages = []
        for msg in messages:
            nim_messages.append({
                "role": msg.get("role", "user"),
                "content": msg.get("content", ""),
            })
        
        payload = {
            "model": model_id,
            "messages": nim_messages,
            "temperature": temperature,
        }
        
        if max_tokens:
            payload["max_tokens"] = max_tokens
        
        if stream:
            async with client.stream(
                "POST",
                f"{base_url}/v1/chat/completions",
                headers=headers,
                json=payload,
            ) as response:
                if response.status_code != 200:
                    error = await response.aread()
                    raise HTTPException(
                        status_code=response.status_code,
                        detail=f"NVIDIA NIM error: {error.decode()}"
                    )
                
                async for line in response.aiter_lines():
                    if line:
                        line = line.strip()
                        if line.startswith("data:"):
                            data = line[5:].strip()
                            if data == "[DONE]":
                                break
                            try:
                                chunk = json.loads(data)
                                if "choices" in chunk and len(chunk["choices"]) > 0:
                                    content = chunk["choices"][0].get("delta", {}).get("content", "")
                                    if content:
                                        yield content
                            except json.JSONDecodeError:
                                continue
        else:
            response = await client.post(
                f"{base_url}/v1/chat/completions",
                headers=headers,
                json=payload,
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"NVIDIA NIM error: {response.text}"
                )
            
            data = response.json()
            return data["choices"][0]["message"]["content"]
    
    async def exa_search(
        self,
        query: str,
        num_results: int = 5,
        start_published_date: Optional[str] = None,
        end_published_date: Optional[str] = None,
    ) -> list[dict]:
        """
        Perform semantic search using Exa AI.
        
        Args:
            query: Search query
            num_results: Number of results to return
            start_published_date: Optional start date filter
            end_published_date: Optional end date filter
        
        Returns:
            list: Search results
        """
        client = self._get_client("exa")
        api_key = self._get_api_key("exa")
        base_url = self._get_base_url("exa")
        
        headers = {
            "x-api-key": api_key,
            "Content-Type": "application/json",
        }
        
        payload = {
            "query": query,
            "numResults": num_results,
        }
        
        if start_published_date:
            payload["startPublishedDate"] = start_published_date
        if end_published_date:
            payload["endPublishedDate"] = end_published_date
        
        response = await client.post(
            f"{base_url}/search",
            headers=headers,
            json=payload,
        )
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Exa AI error: {response.text}"
            )
        
        return response.json().get("results", [])
    
    async def daytona_execute(
        self,
        code: str,
        language: str = "python",
        timeout: int = 30,
    ) -> dict:
        """
        Execute code using Daytona API.
        
        Args:
            code: Code to execute
            language: Programming language
            timeout: Timeout in seconds
        
        Returns:
            dict: Execution result
        """
        client = self._get_client("daytona")
        api_key = self._get_api_key("daytona")
        base_url = self._get_base_url("daytona")
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        
        payload = {
            "code": code,
            "language": language,
            "timeout": timeout,
        }
        
        response = await client.post(
            f"{base_url}/v1/execute",
            headers=headers,
            json=payload,
        )
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Daytona error: {response.text}"
            )
        
        return response.json()
    
    async def browserbase_browse(
        self,
        url: str,
        action: str = "visit",
        timeout: int = 30,
    ) -> dict:
        """
        Browse a URL using BrowserBase API.
        
        Args:
            url: URL to browse
            action: Action to perform (visit, click, etc.)
            timeout: Timeout in seconds
        
        Returns:
            dict: Browsing result
        """
        client = self._get_client("browserbase")
        api_key = self._get_api_key("browserbase")
        base_url = self._get_base_url("browserbase")
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        
        payload = {
            "url": url,
            "action": action,
            "timeout": timeout,
        }
        
        response = await client.post(
            f"{base_url}/v1/browse",
            headers=headers,
            json=payload,
        )
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"BrowserBase error: {response.text}"
            )
        
        return response.json()
    
    async def save_message(
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
        """Save a message to the database."""
        if not self.conversation_service:
            return None
        
        return await self.conversation_service.add_message(
            conversation_id=conversation_id,
            role=role,
            content=content,
            model_id=model_id,
            is_streaming=is_streaming,
            token_count=token_count,
            latency_ms=latency_ms,
        )
    
    async def close(self):
        """Close all HTTP clients."""
        for client in self._clients.values():
            await client.aclose()
        self._clients.clear()


def get_ai_service(
    db: Session = Depends(get_db),
) -> AIService:
    """Dependency to get AI service."""
    return AIService(db)
