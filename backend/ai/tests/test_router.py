from __future__ import annotations

from unittest.mock import MagicMock, patch
from django.test import TestCase, override_settings

from ai.orchestrator import AIOrchestrator
from ai.providers import (
    AIProviderAuthError,
    AIProviderConfigError,
    AIProviderConnectionError,
    AIProviderRateLimitError,
    AIProviderResponseError,
    AIProviderRouter,
    AIResponse,
)


class AIProviderRouterTests(TestCase):
    def setUp(self) -> None:
        self.router = AIProviderRouter(provider_chain=["huggingface", "gemini", "ollama"])
        self.orchestrator = AIOrchestrator(router=self.router)

    @patch("ai.providers.router.get_provider")
    def test_primary_provider_success(self, mock_get_provider: MagicMock) -> None:
        mock_hf = MagicMock()
        mock_hf.generate.return_value = AIResponse(
            content="HF Answer",
            provider_name="huggingface",
            model_name="Qwen/Qwen2.5-7B-Instruct",
        )
        mock_get_provider.return_value = mock_hf

        res = self.router.generate("Test prompt")

        self.assertEqual(res.content, "HF Answer")
        self.assertEqual(res.provider_name, "huggingface")
        self.assertEqual(res.model_name, "Qwen/Qwen2.5-7B-Instruct")
        mock_get_provider.assert_called_once_with(provider_name="huggingface")

    @patch("ai.providers.router.get_provider")
    def test_primary_failure_fallback_to_secondary(self, mock_get_provider: MagicMock) -> None:
        mock_hf = MagicMock()
        mock_hf.generate.side_effect = AIProviderRateLimitError("429 Too Many Requests")

        mock_gemini = MagicMock()
        mock_gemini.generate.return_value = AIResponse(
            content="Gemini Answer",
            provider_name="gemini",
            model_name="gemini-3.5-flash",
        )

        def side_effect(provider_name: str, **kwargs):
            if provider_name == "huggingface":
                return mock_hf
            if provider_name == "gemini":
                return mock_gemini
            raise ValueError(f"Unexpected provider {provider_name}")

        mock_get_provider.side_effect = side_effect

        res = self.router.generate("Test prompt")

        self.assertEqual(res.content, "Gemini Answer")
        self.assertEqual(res.provider_name, "gemini")
        self.assertEqual(res.model_name, "gemini-3.5-flash")
        self.assertEqual(mock_get_provider.call_count, 2)

    @patch("ai.providers.router.get_provider")
    def test_multiple_failures_fallback_to_tertiary(self, mock_get_provider: MagicMock) -> None:
        mock_hf = MagicMock()
        mock_hf.generate.side_effect = AIProviderRateLimitError("429 Too Many Requests")

        mock_gemini = MagicMock()
        mock_gemini.generate.side_effect = AIProviderResponseError("503 Service Unavailable", status_code=503)

        mock_ollama = MagicMock()
        mock_ollama.generate.return_value = AIResponse(
            content="Ollama Answer",
            provider_name="ollama",
            model_name="phi3:latest",
        )

        def side_effect(provider_name: str, **kwargs):
            if provider_name == "huggingface":
                return mock_hf
            if provider_name == "gemini":
                return mock_gemini
            if provider_name == "ollama":
                return mock_ollama
            raise ValueError(f"Unexpected provider {provider_name}")

        mock_get_provider.side_effect = side_effect

        res = self.router.generate("Test prompt")

        self.assertEqual(res.content, "Ollama Answer")
        self.assertEqual(res.provider_name, "ollama")
        self.assertEqual(res.model_name, "phi3:latest")
        self.assertEqual(mock_get_provider.call_count, 3)

    @patch("ai.providers.router.get_provider")
    def test_all_providers_fail_raises_typed_error(self, mock_get_provider: MagicMock) -> None:
        mock_provider = MagicMock()
        mock_provider.generate.side_effect = AIProviderConnectionError("Connection refused")
        mock_get_provider.return_value = mock_provider

        with self.assertRaises(AIProviderConnectionError):
            self.router.generate("Test prompt")

    @patch("ai.providers.router.get_provider")
    def test_provider_auth_or_response_error_falls_back(self, mock_get_provider: MagicMock) -> None:
        mock_hf = MagicMock()
        mock_hf.generate.side_effect = AIProviderResponseError("400 Bad Request: model_not_supported", status_code=400)

        mock_gemini = MagicMock()
        mock_gemini.generate.return_value = AIResponse(
            content="Gemini Fallback Answer",
            provider_name="gemini",
            model_name="gemini-3.5-flash",
        )

        def side_effect(provider_name: str, **kwargs):
            if provider_name == "huggingface":
                return mock_hf
            if provider_name == "gemini":
                return mock_gemini
            raise ValueError(f"Unexpected provider {provider_name}")

        mock_get_provider.side_effect = side_effect

        res = self.router.generate("Test prompt")

        self.assertEqual(res.content, "Gemini Fallback Answer")
        self.assertEqual(res.provider_name, "gemini")
        self.assertEqual(mock_get_provider.call_count, 2)

    @patch("ai.providers.router.get_provider")
    def test_non_provider_unexpected_error_aborts_fallback(self, mock_get_provider: MagicMock) -> None:
        mock_hf = MagicMock()
        mock_hf.generate.side_effect = RuntimeError("Unexpected system error")
        mock_get_provider.return_value = mock_hf

        with self.assertRaises(RuntimeError):
            self.router.generate("Test prompt")

        mock_get_provider.assert_called_once_with(provider_name="huggingface")

    @patch("ai.orchestrator.orchestrator.get_provider")
    def test_explicit_provider_bypasses_router_chain(self, mock_get_provider: MagicMock) -> None:
        mock_ollama = MagicMock()
        mock_ollama.generate.return_value = AIResponse(
            content="Explicit Ollama Answer",
            provider_name="ollama",
            model_name="phi3:latest",
        )
        mock_get_provider.return_value = mock_ollama

        res = self.orchestrator.generate("Test prompt", provider_name="ollama")

        self.assertEqual(res.content, "Explicit Ollama Answer")
        self.assertEqual(res.provider_name, "ollama")
        mock_get_provider.assert_called_once_with(provider_name="ollama")
