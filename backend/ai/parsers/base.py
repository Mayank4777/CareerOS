from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any


class AIResponseParsingError(Exception):
    """Raised when parsing AI raw output fails."""
    def __init__(self, message: str = "Failed to parse AI response.") -> None:
        super().__init__(message)
        self.message = message


class AISchemaValidationError(AIResponseParsingError):
    """Raised when parsed AI response fails schema validation."""
    def __init__(self, message: str = "AI response failed schema validation.") -> None:
        super().__init__(message)


class BaseResponseParser(ABC):
    """Abstract base class for AI response parsers."""

    @abstractmethod
    def parse(self, text: str) -> Any:
        """Parse raw text response and return structured output or raise parsing exception."""
        pass
