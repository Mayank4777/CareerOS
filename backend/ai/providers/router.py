from __future__ import annotations

import logging
from typing import Any

from django.conf import settings

from .base import (
    AIProviderConnectionError,
    AIProviderRateLimitError,
    AIProviderResponseError,
    AIProviderTimeoutError,
    AIResponse,
)
from .factory import get_provider

logger = logging.getLogger(__name__)


def is_retryable_provider_error(exc: Exception) -> bool:
    """Determine whether an exception represents a retryable AI provider transport/service failure."""
    if isinstance(exc, (AIProviderConnectionError, AIProviderTimeoutError, AIProviderRateLimitError)):
        return True
    if isinstance(exc, AIProviderResponseError):
        # HTTP 429 rate limit or 5xx server errors are retryable
        if exc.status_code == 429 or (500 <= exc.status_code < 600):
            return True
        return False
    return False


class AIProviderRouter:
    """Router for executing AI requests across an ordered fallback provider chain."""

    def __init__(self, provider_chain: list[str] | None = None) -> None:
        configured_chain = getattr(settings, "AI_PROVIDER_CHAIN", ["huggingface", "gemini", "ollama"])
        if isinstance(configured_chain, str):
            configured_chain = [p.strip().lower() for p in configured_chain.split(",") if p.strip()]
        self.provider_chain = provider_chain or configured_chain

    def generate(
        self,
        prompt: str,
        system_prompt: str = "",
        model: str | None = None,
        **kwargs: Any,
    ) -> AIResponse:
        """Attempt AI generation sequentially across provider chain with automatic fallback on retryable errors."""
        logger.info("AI provider chain execution started: %s", " -> ".join(self.provider_chain))

        last_error: Exception | None = None
        for i, provider_name in enumerate(self.provider_chain):
            logger.info("AI provider attempt: %s", provider_name)
            try:
                provider = get_provider(provider_name=provider_name)
                response = provider.generate(prompt=prompt, system_prompt=system_prompt, model=model, **kwargs)
                logger.info("AI provider succeeded: %s", provider_name)
                return response
            except Exception as exc:
                status_code = getattr(exc, "status_code", None)
                status_suffix = f" ({status_code})" if status_code else ""
                logger.warning("AI provider failed: %s%s - %s", provider_name, status_suffix, exc)

                if not is_retryable_provider_error(exc):
                    logger.error("Non-retryable error encountered on provider '%s'. Aborting chain fallback.", provider_name)
                    raise exc

                last_error = exc
                if i < len(self.provider_chain) - 1:
                    next_provider = self.provider_chain[i + 1]
                    logger.info("AI provider fallback: %s", next_provider)

        if last_error:
            raise last_error
        raise AIProviderConnectionError("All AI providers in fallback chain failed.")
