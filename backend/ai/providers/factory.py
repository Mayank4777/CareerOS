from __future__ import annotations

import logging
from typing import Type

from django.conf import settings

from .base import AIProviderConfigError, BaseAIProvider
from .gemini import GeminiProvider
from .huggingface import HuggingFaceProvider
from .ollama import OllamaProvider

logger = logging.getLogger(__name__)

_PROVIDER_REGISTRY: dict[str, Type[BaseAIProvider]] = {
    "huggingface": HuggingFaceProvider,
    "gemini": GeminiProvider,
    "ollama": OllamaProvider,
}


def get_provider(provider_name: str | None = None, **kwargs) -> BaseAIProvider:
    """Return configured or requested AI provider instance."""
    name = (provider_name or getattr(settings, "AI_PROVIDER", "huggingface")).strip().lower()

    provider_cls = _PROVIDER_REGISTRY.get(name)
    if not provider_cls:
        valid_providers = ", ".join(_PROVIDER_REGISTRY.keys())
        raise AIProviderConfigError(
            f"Unsupported AI provider '{name}'. Configured providers: {valid_providers}."
        )

    if name == "huggingface":
        hf_token = kwargs.get("api_token") or getattr(settings, "HF_API_TOKEN", "")
        if not hf_token:
            raise AIProviderConfigError(
                "Hugging Face API token (HF_API_TOKEN) is not configured. "
                "Set HF_API_TOKEN in environment settings or switch AI_PROVIDER."
            )
    elif name == "gemini":
        gemini_key = kwargs.get("api_key") or getattr(settings, "GEMINI_API_KEY", "")
        if not gemini_key:
            raise AIProviderConfigError(
                "Gemini API key (GEMINI_API_KEY) is not configured. "
                "Set GEMINI_API_KEY in environment settings."
            )

    return provider_cls(**kwargs)
