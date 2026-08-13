from __future__ import annotations

import logging
from typing import Any

from ai.parsers.base import BaseResponseParser
from ai.providers.base import AIResponse
from ai.providers.factory import get_provider

logger = logging.getLogger(__name__)


class AIOrchestrator:
    """Central Orchestrator for processing AI requests across providers and response parsers."""

    def generate(
        self,
        prompt: str,
        system_prompt: str = "",
        provider_name: str | None = None,
        model: str | None = None,
        parser: BaseResponseParser | None = None,
        **kwargs: Any,
    ) -> AIResponse:
        """Execute text generation through configured provider and run optional response parser."""
        provider = get_provider(provider_name=provider_name)
        logger.info("Executing AI generate request using provider adapter: %s", provider.__class__.__name__)

        response = provider.generate(prompt=prompt, system_prompt=system_prompt, model=model, **kwargs)

        if parser is not None:
            parsed_result = parser.parse(response.content)
            response.raw_response = {"raw": response.raw_response, "parsed": parsed_result}

        return response
