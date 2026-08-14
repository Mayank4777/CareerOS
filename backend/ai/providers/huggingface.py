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


class HuggingFaceProvider(BaseAIProvider):
    """Provider adapter for Hugging Face Inference Providers (OpenAI-compatible router)."""

    ENDPOINT = "https://router.huggingface.co/v1/chat/completions"

    def __init__(
        self,
        api_token: str | None = None,
        model: str | None = None,
        timeout: int | None = None,
    ) -> None:
        self.api_token = getattr(settings, "HF_API_TOKEN", "") if api_token is None else api_token
        raw_model = model or getattr(settings, "HF_MODEL", getattr(settings, "AI_MODEL", "Qwen/Qwen2.5-7B-Instruct"))
        selected_model = self._apply_model_policy(raw_model)
        super().__init__(model=selected_model, timeout=timeout)

    @staticmethod
    def _apply_model_policy(model_name: str) -> str:
        """Applies default ':fastest' routing policy suffix if no explicit policy suffix is provided."""
        if not model_name:
            return "Qwen/Qwen2.5-7B-Instruct:fastest"
        if ":" not in model_name:
            return f"{model_name}:fastest"
        return model_name

    def generate(self, prompt: str, system_prompt: str = "", model: str | None = None, **kwargs: Any) -> AIResponse:
        if not self.api_token:
            logger.error("Hugging Face API token is missing.")
            raise AIProviderConfigError(
                "Hugging Face API token (HF_API_TOKEN) is not configured. Set HF_API_TOKEN in environment settings."
            )

        active_model = self._apply_model_policy(model) if model else self.model
        headers = {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json",
        }

        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": active_model,
            "messages": messages,
            "max_tokens": kwargs.get("max_tokens", 1024),
        }
        if "temperature" in kwargs:
            payload["temperature"] = kwargs["temperature"]

        try:
            logger.info("Sending request to Hugging Face Inference API: %s (model: %s)", self.ENDPOINT, active_model)
            response = requests.post(self.ENDPOINT, json=payload, headers=headers, timeout=self.timeout)
        except requests.exceptions.Timeout as exc:
            logger.error("Hugging Face API request timed out: %s", exc)
            raise AIProviderTimeoutError("Hugging Face API request timed out.") from exc
        except requests.exceptions.ConnectionError as exc:
            logger.error("Failed to connect to Hugging Face API: %s", exc)
            raise AIProviderConnectionError("Failed to connect to Hugging Face API service.") from exc
        except requests.exceptions.RequestException as exc:
            logger.error("Hugging Face API HTTP error: %s", exc)
            raise AIProviderConnectionError(f"Hugging Face API communication error: {exc}") from exc

        if response.status_code in (401, 403):
            logger.error("Hugging Face authentication failed: status %s", response.status_code)
            raise AIProviderAuthError("Invalid Hugging Face API token or unauthorized access.")

        if response.status_code == 429:
            logger.error("Hugging Face rate limit exceeded: status 429")
            raise AIProviderRateLimitError("Hugging Face API rate limit exceeded.")

        if response.status_code != 200:
            logger.error("Hugging Face API returned HTTP status %s: %s", response.status_code, response.text)
            raise AIProviderResponseError(f"Hugging Face API returned error status {response.status_code}.", status_code=response.status_code)

        try:
            data = response.json()
        except ValueError as exc:
            logger.error("Failed to parse JSON response from Hugging Face: %s", exc)
            raise AIProviderResponseError("Hugging Face API response was not valid JSON.") from exc

        if not isinstance(data, dict):
            logger.error("Hugging Face response is not a dict: %s", data)
            raise AIProviderResponseError("Hugging Face API response structure was invalid.")

        choices = data.get("choices")
        if not choices or not isinstance(choices, list) or not isinstance(choices[0], dict):
            logger.error("Hugging Face response missing valid choices array: %s", data)
            raise AIProviderResponseError("Hugging Face API response structure was invalid.")

        message = choices[0].get("message")
        if not isinstance(message, dict) or "content" not in message or message["content"] is None:
            logger.error("Hugging Face response choice missing message content: %s", data)
            raise AIProviderResponseError("Hugging Face API response structure was invalid.")

        text_output = str(message["content"]).strip()

        # Token usage extraction
        usage = data.get("usage", {}) if isinstance(data.get("usage"), dict) else {}
        prompt_tokens = usage.get("prompt_tokens")
        completion_tokens = usage.get("completion_tokens")
        total_tokens = usage.get("total_tokens")

        if prompt_tokens is None:
            prompt_tokens = len(prompt.split()) + (len(system_prompt.split()) if system_prompt else 0)
        if completion_tokens is None:
            completion_tokens = len(text_output.split())
        if total_tokens is None:
            total_tokens = prompt_tokens + completion_tokens

        # Provider metadata extraction
        response_model = data.get("model")
        model_name = str(response_model) if response_model else str(active_model)

        return AIResponse(
            content=text_output,
            provider_name="huggingface",
            model_name=model_name,
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            total_tokens=total_tokens,
            raw_response=data,
        )
