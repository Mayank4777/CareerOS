from __future__ import annotations

import logging
from typing import Any

from django.conf import settings
import requests

from .base import (
    AIProviderAuthError,
    AIProviderConfigError,
    AIProviderConnectionError,
    AIProviderResponseError,
    AIProviderTimeoutError,
    AIResponse,
    BaseAIProvider,
)

logger = logging.getLogger(__name__)


class HuggingFaceProvider(BaseAIProvider):
    """Provider adapter for Hugging Face Inference API."""

    def __init__(
        self,
        api_token: str | None = None,
        model: str | None = None,
        timeout: int | None = None,
    ) -> None:
        self.api_token = api_token or getattr(settings, "HF_API_TOKEN", "")
        selected_model = model or getattr(settings, "HF_MODEL", getattr(settings, "AI_MODEL", "meta-llama/Llama-3.2-3B-Instruct"))
        super().__init__(model=selected_model, timeout=timeout)

    def generate(self, prompt: str, system_prompt: str = "", model: str | None = None, **kwargs: Any) -> AIResponse:
        if not self.api_token:
            logger.error("Hugging Face API token is missing.")
            raise AIProviderConfigError(
                "Hugging Face API token (HF_API_TOKEN) is not configured. Set HF_API_TOKEN in environment settings."
            )

        active_model = model or self.model
        endpoint = f"https://api-inference.huggingface.co/models/{active_model}"
        headers = {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json",
        }

        full_prompt = f"{system_prompt}\n\n{prompt}".strip() if system_prompt else prompt

        payload = {
            "inputs": full_prompt,
            "parameters": {
                "max_new_tokens": kwargs.get("max_tokens", 1024),
                "return_full_text": False,
            },
        }

        try:
            logger.info("Sending request to Hugging Face Inference API: %s (model: %s)", endpoint, active_model)
            response = requests.post(endpoint, json=payload, headers=headers, timeout=self.timeout)
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

        if response.status_code != 200:
            logger.error("Hugging Face API returned HTTP status %s: %s", response.status_code, response.text)
            raise AIProviderResponseError(f"Hugging Face API returned error status {response.status_code}.", status_code=response.status_code)

        try:
            data = response.json()
        except ValueError as exc:
            logger.error("Failed to parse JSON response from Hugging Face: %s", exc)
            raise AIProviderResponseError("Hugging Face API response was not valid JSON.") from exc

        text_output = ""
        if isinstance(data, list) and len(data) > 0 and isinstance(data[0], dict):
            text_output = data[0].get("generated_text", "").strip()
        elif isinstance(data, dict) and "generated_text" in data:
            text_output = str(data["generated_text"]).strip()
        elif isinstance(data, dict) and "choices" in data:
            choices = data.get("choices", [])
            if choices and isinstance(choices[0], dict):
                msg = choices[0].get("message", {})
                text_output = str(msg.get("content", "")).strip()
        else:
            logger.error("Hugging Face response format unrecognized: %s", data)
            raise AIProviderResponseError("Hugging Face API response structure was invalid.")

        prompt_tokens = len(full_prompt.split())
        completion_tokens = len(text_output.split())

        return AIResponse(
            content=text_output,
            provider_name="huggingface",
            model_name=str(active_model),
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            total_tokens=prompt_tokens + completion_tokens,
            raw_response=data,
        )
