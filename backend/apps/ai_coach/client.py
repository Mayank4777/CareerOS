from __future__ import annotations

import logging
from typing import Any

from django.conf import settings
import requests

from .exceptions import (
    OllamaConnectionError,
    OllamaInvalidResponseError,
    OllamaModelNotFoundError,
    OllamaTimeoutError,
)

logger = logging.getLogger(__name__)


class OllamaClient:
    """Client for communicating with local Ollama REST API."""

    def __init__(self, url: str | None = None, model: str | None = None, timeout: int | None = None) -> None:
        self.url = (url or getattr(settings, "OLLAMA_URL", "http://127.0.0.1:11434")).rstrip("/")
        self.model = model or getattr(settings, "OLLAMA_MODEL", "phi3:latest")
        self.timeout = timeout or getattr(settings, "OLLAMA_TIMEOUT", 300)

    def generate(self, prompt: str, system: str = "") -> dict[str, Any]:
        """Send a prompt generation request to Ollama and return the response."""
        endpoint = f"{self.url}/api/generate"
        payload = {
            "model": self.model,
            "prompt": prompt,
            "system": system,
            "stream": False,
        }

        try:
            logger.info("Sending request to Ollama: %s (model: %s)", endpoint, self.model)
            response = requests.post(endpoint, json=payload, timeout=self.timeout)
        except requests.exceptions.Timeout as exc:
            logger.error("Ollama request timed out after %ss: %s", self.timeout, exc)
            raise OllamaTimeoutError(
                f"Ollama request timed out after {self.timeout} seconds."
            ) from exc
        except requests.exceptions.ConnectionError as exc:
            logger.error("Failed to connect to Ollama at %s: %s", self.url, exc)
            raise OllamaConnectionError(
                f"Could not connect to local Ollama server at {self.url}. Ensure Ollama is running."
            ) from exc
        except requests.exceptions.RequestException as exc:
            logger.error("Ollama HTTP request error: %s", exc)
            raise OllamaConnectionError(f"Ollama communication error: {exc}") from exc

        if response.status_code == 404:
            logger.error("Ollama model '%s' not found on server", self.model)
            raise OllamaModelNotFoundError(
                f"Model '{self.model}' was not found on local Ollama server. Run 'ollama pull {self.model}'."
            )

        if response.status_code != 200:
            logger.error("Ollama returned HTTP error status %s: %s", response.status_code, response.text)
            raise OllamaInvalidResponseError(
                f"Ollama server returned error status {response.status_code}."
            )

        try:
            data = response.json()
        except ValueError as exc:
            logger.error("Failed to parse JSON response from Ollama: %s", exc)
            raise OllamaInvalidResponseError("Ollama response was not valid JSON.") from exc

        if not isinstance(data, dict) or "response" not in data:
            logger.error("Ollama response missing required 'response' field: %s", data)
            raise OllamaInvalidResponseError("Ollama response structure was invalid.")

        prompt_eval_count = data.get("prompt_eval_count", 0) or 0
        eval_count = data.get("eval_count", 0) or 0

        return {
            "response": data["response"].strip(),
            "model": data.get("model", self.model),
            "prompt_tokens": prompt_eval_count,
            "completion_tokens": eval_count,
            "total_tokens": prompt_eval_count + eval_count,
        }
