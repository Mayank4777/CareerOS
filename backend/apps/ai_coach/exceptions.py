from ai.providers.base import (
    AIProviderAuthError,
    AIProviderConfigError,
    AIProviderConnectionError,
    AIProviderError,
    AIProviderResponseError,
    AIProviderTimeoutError,
)


class OllamaError(AIProviderError):
    """Base exception for all AI provider/Ollama client failures."""
    pass


class OllamaConnectionError(AIProviderConnectionError, OllamaError):
    """Raised when the AI server cannot be reached."""
    pass


class OllamaTimeoutError(AIProviderTimeoutError, OllamaError):
    """Raised when the AI request times out."""
    pass


class OllamaModelNotFoundError(AIProviderResponseError, OllamaError):
    """Raised when the requested model is not found on the server."""
    def __init__(self, message: str = "Requested AI model was not found.") -> None:
        super().__init__(message=message, status_code=404)


class OllamaInvalidResponseError(AIProviderResponseError, OllamaError):
    """Raised when AI provider returns an invalid or malformed response."""
    pass
