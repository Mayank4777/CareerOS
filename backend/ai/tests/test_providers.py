from __future__ import annotations

from unittest.mock import MagicMock, patch
from django.test import TestCase, override_settings
import requests

from ai.providers import (
    AIProviderAuthError,
    AIProviderConfigError,
    AIProviderConnectionError,
    AIProviderResponseError,
    AIProviderTimeoutError,
    GeminiProvider,
    HuggingFaceProvider,
    OllamaProvider,
)


class HuggingFaceProviderTests(TestCase):
    def test_missing_api_token_raises_config_error(self) -> None:
        provider = HuggingFaceProvider(api_token="", model="test-model")
        with self.assertRaises(AIProviderConfigError):
            provider.generate("Test prompt")

    @patch("requests.post")
    def test_huggingface_success(self, mock_post: MagicMock) -> None:
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = [{"generated_text": "Hugging Face response text"}]
        mock_post.return_value = mock_response

        provider = HuggingFaceProvider(api_token="valid-token", model="meta-llama/Llama-3.2-3B-Instruct")
        res = provider.generate(prompt="Hello", system_prompt="System instructions")

        self.assertEqual(res.content, "Hugging Face response text")
        self.assertEqual(res.provider_name, "huggingface")
        self.assertEqual(res.model_name, "meta-llama/Llama-3.2-3B-Instruct")
        self.assertGreater(res.total_tokens, 0)
        mock_post.assert_called_once()

    @patch("requests.post")
    def test_huggingface_auth_failure(self, mock_post: MagicMock) -> None:
        mock_response = MagicMock()
        mock_response.status_code = 401
        mock_post.return_value = mock_response

        provider = HuggingFaceProvider(api_token="invalid-token")
        with self.assertRaises(AIProviderAuthError):
            provider.generate("Test prompt")

    @patch("requests.post")
    def test_huggingface_server_error(self, mock_post: MagicMock) -> None:
        mock_response = MagicMock()
        mock_response.status_code = 500
        mock_response.text = "Internal Server Error"
        mock_post.return_value = mock_response

        provider = HuggingFaceProvider(api_token="valid-token")
        with self.assertRaises(AIProviderResponseError):
            provider.generate("Test prompt")

    @patch("requests.post")
    def test_huggingface_timeout(self, mock_post: MagicMock) -> None:
        mock_post.side_effect = requests.exceptions.Timeout("Request timed out")
        provider = HuggingFaceProvider(api_token="valid-token")
        with self.assertRaises(AIProviderTimeoutError):
            provider.generate("Test prompt")


class OllamaProviderTests(TestCase):
    @patch("requests.post")
    def test_ollama_success(self, mock_post: MagicMock) -> None:
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "response": "Ollama generated content",
            "model": "phi3:latest",
            "prompt_eval_count": 10,
            "eval_count": 20,
        }
        mock_post.return_value = mock_response

        provider = OllamaProvider(url="http://localhost:11434", model="phi3:latest")
        res = provider.generate("Test prompt")

        self.assertEqual(res.content, "Ollama generated content")
        self.assertEqual(res.provider_name, "ollama")
        self.assertEqual(res.prompt_tokens, 10)
        self.assertEqual(res.completion_tokens, 20)

    @patch("requests.post")
    def test_ollama_connection_error(self, mock_post: MagicMock) -> None:
        mock_post.side_effect = requests.exceptions.ConnectionError("Connection refused")
        provider = OllamaProvider()
        with self.assertRaises(AIProviderConnectionError):
            provider.generate("Test prompt")


class GeminiProviderTests(TestCase):
    def test_missing_api_key_raises_config_error(self) -> None:
        provider = GeminiProvider(api_key="", model="gemini-3.5-flash")
        with self.assertRaises(AIProviderConfigError):
            provider.generate("Test prompt")

    @patch("requests.post")
    def test_gemini_success(self, mock_post: MagicMock) -> None:
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "candidates": [
                {
                    "content": {
                        "parts": [
                            {"text": "Gemini generated text"}
                        ]
                    }
                }
            ],
            "usageMetadata": {
                "promptTokenCount": 15,
                "candidatesTokenCount": 25,
            },
        }
        mock_post.return_value = mock_response

        provider = GeminiProvider(api_key="valid-key", model="gemini-3.5-flash")
        res = provider.generate(prompt="Hello Gemini", system_prompt="System instructions")

        self.assertEqual(res.content, "Gemini generated text")
        self.assertEqual(res.provider_name, "gemini")
        self.assertEqual(res.model_name, "gemini-3.5-flash")
        self.assertEqual(res.prompt_tokens, 15)
        self.assertEqual(res.completion_tokens, 25)

    @patch("requests.post")
    def test_gemini_auth_failure(self, mock_post: MagicMock) -> None:
        mock_response = MagicMock()
        mock_response.status_code = 401
        mock_post.return_value = mock_response

        provider = GeminiProvider(api_key="invalid-key")
        with self.assertRaises(AIProviderAuthError):
            provider.generate("Test prompt")

