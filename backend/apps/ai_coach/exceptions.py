from __future__ import annotations


class OllamaError(Exception):
    """Base exception for all Ollama client failures."""

    def __init__(self, message: str, status_code: int = 500) -> None:
        super().__init__(message)
        self.message = message
        self.status_code = status_code


class OllamaConnectionError(OllamaError):
    """Raised when the local Ollama server cannot be reached."""

    def __init__(self, message: str = "Could not connect to local Ollama server.") -> None:
        super().__init__(message=message, status_code=503)


class OllamaTimeoutError(OllamaError):
    """Raised when the Ollama request times out."""

    def __init__(self, message: str = "Ollama request timed out.") -> None:
        super().__init__(message=message, status_code=504)


class OllamaModelNotFoundError(OllamaError):
    """Raised when the requested Ollama model is not found on the server."""

    def __init__(self, message: str = "Requested Ollama model was not found.") -> None:
        super().__init__(message=message, status_code=404)


class OllamaInvalidResponseError(OllamaError):
    """Raised when Ollama returns an invalid or malformed response."""

    def __init__(self, message: str = "Received an invalid response from Ollama.") -> None:
        super().__init__(message=message, status_code=502)
