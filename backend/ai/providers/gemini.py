from __future__ import annotations

import logging
from typing import Any

from django.conf import settings
import requests

from .base import (
    AIProviderAuthError,
    AIProviderConfigError,
    AIProviderConnectionError,
    AIProviderRateLimitError,
    AIProviderResponseError,
    AIProviderTimeoutError,
    AIResponse,
    BaseAIProvider,
)

logger = logging.getLogger(__name__)


class GeminiProvider(BaseAIProvider):
    """Provider adapter for Google Gemini REST API."""

    def __init__(
        self,
        api_key: str | None = None,
        model: str | None = None,
        timeout: int | None = None,
    ) -> None:
        self.api_key = getattr(settings, "GEMINI_API_KEY", "") if api_key is None else api_key
        selected_model = model or getattr(settings, "GEMINI_MODEL", "gemini-3.5-flash")
        super().__init__(model=selected_model, timeout=timeout)

    def generate(self, prompt: str, system_prompt: str = "", model: str | None = None, **kwargs: Any) -> AIResponse:
        if not self.api_key:
            logger.error("Gemini API key is missing.")
            raise AIProviderConfigError(
                "Gemini API key (GEMINI_API_KEY) is not configured. Set GEMINI_API_KEY in environment settings."
            )

        active_model = model or self.model
        endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{active_model}:generateContent?key={self.api_key}"
        headers = {"Content-Type": "application/json"}

        full_prompt = f"{system_prompt}\n\n{prompt}".strip() if system_prompt else prompt

        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": full_prompt}
                    ]
                }
            ]
        }

        try:
            logger.info("Sending request to Gemini API (model: %s)", active_model)
            response = requests.post(endpoint, json=payload, headers=headers, timeout=self.timeout)
        except requests.exceptions.Timeout as exc:
            logger.error("Gemini API request timed out: %s", exc)
            raise AIProviderTimeoutError("Gemini API request timed out.") from exc
        except requests.exceptions.ConnectionError as exc:
            logger.error("Failed to connect to Gemini API: %s", exc)
            raise AIProviderConnectionError("Failed to connect to Gemini API service.") from exc
        except requests.exceptions.RequestException as exc:
            logger.error("Gemini API HTTP error: %s", exc)
            raise AIProviderConnectionError(f"Gemini API communication error: {exc}") from exc

        if response.status_code in (401, 403):
            logger.error("Gemini authentication failed: status %s", response.status_code)
            raise AIProviderAuthError("Invalid Gemini API key or unauthorized access.")

        if response.status_code == 429:
            logger.error("Gemini rate limit exceeded: status 429")
            raise AIProviderRateLimitError("Gemini API rate limit exceeded.")

        if response.status_code != 200:
            logger.error("Gemini API returned HTTP status %s: %s", response.status_code, response.text)
            raise AIProviderResponseError(f"Gemini API returned error status {response.status_code}.", status_code=response.status_code)

        try:
            data = response.json()
        except ValueError as exc:
            logger.error("Failed to parse JSON response from Gemini: %s", exc)
            raise AIProviderResponseError("Gemini API response was not valid JSON.") from exc

        text_output = ""
        if isinstance(data, dict) and "candidates" in data:
            candidates = data.get("candidates", [])
            if candidates and isinstance(candidates[0], dict):
                content = candidates[0].get("content", {})
                parts = content.get("parts", [])
                if parts and isinstance(parts[0], dict):
                    text_output = str(parts[0].get("text", "")).strip()

        if not text_output:
            logger.error("Gemini response format unrecognized or empty: %s", data)
            raise AIProviderResponseError("Gemini API response structure was invalid.")

        usage = data.get("usageMetadata", {})
        prompt_tokens = usage.get("promptTokenCount", len(full_prompt.split()))
        completion_tokens = usage.get("candidatesTokenCount", len(text_output.split()))

        return AIResponse(
            content=text_output,
            provider_name="gemini",
            model_name=str(active_model),
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            total_tokens=prompt_tokens + completion_tokens,
            raw_response=data,
        )
