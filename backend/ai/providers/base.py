from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any


class AIProviderError(Exception):
    """Base exception for AI provider errors."""
    def __init__(self, message: str, status_code: int = 500) -> None:
        super().__init__(message)
        self.message = message
        self.status_code = status_code


class AIProviderConnectionError(AIProviderError):
    """Raised when connecting to AI provider fails."""
    def __init__(self, message: str = "Failed to connect to AI provider.") -> None:
        super().__init__(message, status_code=503)


class AIProviderAuthError(AIProviderError):
    """Raised when authentication with AI provider fails."""
    def __init__(self, message: str = "AI provider authentication failed.") -> None:
        super().__init__(message, status_code=401)


class AIProviderResponseError(AIProviderError):
    """Raised when AI provider returns an error status or malformed response."""
    def __init__(self, message: str = "Invalid response from AI provider.", status_code: int = 502) -> None:
        super().__init__(message, status_code=status_code)


class AIProviderTimeoutError(AIProviderError):
    """Raised when AI provider request times out."""
    def __init__(self, message: str = "AI provider request timed out.") -> None:
        super().__init__(message, status_code=504)


class AIProviderRateLimitError(AIProviderError):
    """Raised when AI provider rate limit (429) is exceeded."""
    def __init__(self, message: str = "AI provider rate limit exceeded.") -> None:
        super().__init__(message, status_code=429)


class AIProviderConfigError(AIProviderError):
    """Raised when AI provider configuration is missing or invalid."""
    def __init__(self, message: str = "AI provider configuration error.") -> None:
        super().__init__(message, status_code=500)


@dataclass
class AIResponse:
    content: str
    provider_name: str
    model_name: str
    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0
    raw_response: Any = None


class BaseAIProvider(ABC):
    """Abstract base class for all AI provider adapters."""

    def __init__(self, model: str | None = None, timeout: int | None = None) -> None:
        self.model = model
        self.timeout = timeout or 300

    @abstractmethod
    def generate(self, prompt: str, system_prompt: str = "", model: str | None = None, **kwargs: Any) -> AIResponse:
        """Send generation request to provider and return normalized AIResponse."""
        pass
