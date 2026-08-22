from __future__ import annotations

import logging
from typing import Any

from ai.parsers.base import BaseResponseParser
from ai.providers.base import AIResponse
from ai.providers.factory import get_provider
from ai.providers.router import AIProviderRouter

logger = logging.getLogger(__name__)


class AIOrchestrator:
    """Central Orchestrator for processing AI requests across fallback provider chains and response parsers."""

    def __init__(self, router: AIProviderRouter | None = None) -> None:
        self.router = router or AIProviderRouter()

    def generate(
        self,
        prompt: str,
        system_prompt: str = "",
        provider_name: str | None = None,
        model: str | None = None,
        parser: BaseResponseParser | None = None,
        **kwargs: Any,
    ) -> AIResponse:
        """Execute text generation through explicitly requested provider or router chain, then run optional parser."""
        if provider_name:
            logger.info("Explicit AI provider requested: %s", provider_name)
            provider = get_provider(provider_name=provider_name)
            response = provider.generate(prompt=prompt, system_prompt=system_prompt, model=model, **kwargs)
        else:
            response = self.router.generate(prompt=prompt, system_prompt=system_prompt, model=model, **kwargs)

        if parser is not None:
            parsed_result = parser.parse(response.content)
            response.raw_response = {"raw": response.raw_response, "parsed": parsed_result}

        return response
