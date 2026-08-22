from __future__ import annotations

from unittest.mock import MagicMock, patch
from django.test import TestCase, override_settings
import requests

from ai.providers import (
    AIProviderAuthError,
    AIProviderConfigError,
    AIProviderConnectionError,
    AIProviderRateLimitError,
    AIProviderResponseError,
    AIProviderTimeoutError,
    GeminiProvider,
    HuggingFaceProvider,
    OllamaProvider,
)


class HuggingFaceProviderTests(TestCase):
    def test_missing_api_token_raises_config_error(self) -> None:
        provider = HuggingFaceProvider(api_token="", model="Qwen/Qwen2.5-7B-Instruct")
        with self.assertRaises(AIProviderConfigError):
            provider.generate("Test prompt")

    @patch("requests.post")
    def test_huggingface_successful_chat_completion(self, mock_post: MagicMock) -> None:
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "id": "chatcmpl-123",
            "object": "chat.completion",
            "model": "Qwen/Qwen2.5-7B-Instruct:fastest",
            "choices": [
                {
                    "index": 0,
                    "message": {
                        "role": "assistant",
                        "content": "Hugging Face router response text",
                    },
                    "finish_reason": "stop",
                }
            ],
            "usage": {
                "prompt_tokens": 10,
                "completion_tokens": 20,
                "total_tokens": 30,
            },
        }
        mock_post.return_value = mock_response

        provider = HuggingFaceProvider(api_token="valid-token", model="Qwen/Qwen2.5-7B-Instruct")
        res = provider.generate(prompt="Hello", system_prompt="System instructions")

        self.assertEqual(res.content, "Hugging Face router response text")
        self.assertEqual(res.provider_name, "huggingface")
        self.assertEqual(res.model_name, "Qwen/Qwen2.5-7B-Instruct:fastest")
        self.assertEqual(res.prompt_tokens, 10)
        self.assertEqual(res.completion_tokens, 20)
        self.assertEqual(res.total_tokens, 30)

        mock_post.assert_called_once()
        args, kwargs = mock_post.call_args
        self.assertEqual(args[0], "https://router.huggingface.co/v1/chat/completions")
        self.assertEqual(kwargs["headers"]["Authorization"], "Bearer valid-token")
        self.assertEqual(kwargs["json"]["model"], "Qwen/Qwen2.5-7B-Instruct:fastest")
        self.assertEqual(
            kwargs["json"]["messages"],
            [
                {"role": "system", "content": "System instructions"},
                {"role": "user", "content": "Hello"},
            ],
        )

    @patch("requests.post")
    def test_huggingface_auth_failure_401(self, mock_post: MagicMock) -> None:
        mock_response = MagicMock()
        mock_response.status_code = 401
        mock_post.return_value = mock_response

        provider = HuggingFaceProvider(api_token="invalid-token")
        with self.assertRaises(AIProviderAuthError):
            provider.generate("Test prompt")

    @patch("requests.post")
    def test_huggingface_auth_failure_403(self, mock_post: MagicMock) -> None:
        mock_response = MagicMock()
        mock_response.status_code = 403
        mock_post.return_value = mock_response

        provider = HuggingFaceProvider(api_token="forbidden-token")
        with self.assertRaises(AIProviderAuthError):
            provider.generate("Test prompt")

    @patch("requests.post")
    def test_huggingface_rate_limit_429(self, mock_post: MagicMock) -> None:
        mock_response = MagicMock()
        mock_response.status_code = 429
        mock_post.return_value = mock_response

        provider = HuggingFaceProvider(api_token="valid-token")
        with self.assertRaises(AIProviderRateLimitError):
            provider.generate("Test prompt")

    @patch("requests.post")
    def test_huggingface_server_error_5xx(self, mock_post: MagicMock) -> None:
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

    @patch("requests.post")
    def test_huggingface_malformed_response(self, mock_post: MagicMock) -> None:
        # 1. Non-JSON string
        mock_response_text = MagicMock()
        mock_response_text.status_code = 200
        mock_response_text.json.side_effect = ValueError("Invalid JSON")
        mock_post.return_value = mock_response_text

        provider = HuggingFaceProvider(api_token="valid-token")
        with self.assertRaises(AIProviderResponseError):
            provider.generate("Test prompt")

        # 2. Missing choices field
        mock_response_no_choices = MagicMock()
        mock_response_no_choices.status_code = 200
        mock_response_no_choices.json.return_value = {"id": "123"}
        mock_post.return_value = mock_response_no_choices
        with self.assertRaises(AIProviderResponseError):
            provider.generate("Test prompt")

        # 3. Choice missing message content
        mock_response_no_content = MagicMock()
        mock_response_no_content.status_code = 200
        mock_response_no_content.json.return_value = {"choices": [{"message": {}}]}
        mock_post.return_value = mock_response_no_content
        with self.assertRaises(AIProviderResponseError):
            provider.generate("Test prompt")

    @patch("requests.post")
    def test_huggingface_response_normalization(self, mock_post: MagicMock) -> None:
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "model": "Qwen/Qwen2.5-7B-Instruct:fastest",
            "choices": [{"message": {"role": "assistant", "content": "Word1 Word2 Word3"}}],
        }
        mock_post.return_value = mock_response

        provider = HuggingFaceProvider(api_token="valid-token", model="Qwen/Qwen2.5-7B-Instruct")
        res = provider.generate(prompt="User prompt here", system_prompt="System prompt")

        self.assertEqual(res.content, "Word1 Word2 Word3")
        self.assertEqual(res.prompt_tokens, 5)
        self.assertEqual(res.completion_tokens, 3)
        self.assertEqual(res.total_tokens, 8)
        self.assertEqual(res.model_name, "Qwen/Qwen2.5-7B-Instruct:fastest")

    def test_huggingface_model_policy_suffix(self) -> None:
        p1 = HuggingFaceProvider(api_token="valid-token", model="Qwen/Qwen2.5-7B-Instruct")
        self.assertEqual(p1.model, "Qwen/Qwen2.5-7B-Instruct:fastest")

        p2 = HuggingFaceProvider(api_token="valid-token", model="Qwen/Qwen2.5-7B-Instruct:cheapest")
        self.assertEqual(p2.model, "Qwen/Qwen2.5-7B-Instruct:cheapest")


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
