from __future__ import annotations

from django.test import TestCase, override_settings

from ai.providers import (
    AIProviderConfigError,
    GeminiProvider,
    HuggingFaceProvider,
    OllamaProvider,
    get_provider,
)


class ProviderFactoryTests(TestCase):
    @override_settings(AI_PROVIDER="huggingface", HF_API_TOKEN="secret-token")
    def test_configured_huggingface_provider(self) -> None:
        provider = get_provider()
        self.assertIsInstance(provider, HuggingFaceProvider)

    @override_settings(AI_PROVIDER="gemini", GEMINI_API_KEY="secret-key")
    def test_configured_gemini_provider(self) -> None:
        provider = get_provider()
        self.assertIsInstance(provider, GeminiProvider)

    @override_settings(AI_PROVIDER="ollama")
    def test_configured_ollama_provider(self) -> None:
        provider = get_provider()
        self.assertIsInstance(provider, OllamaProvider)

    @override_settings(AI_PROVIDER="huggingface", HF_API_TOKEN="")
    def test_huggingface_missing_token_raises_config_error(self) -> None:
        with self.assertRaises(AIProviderConfigError):
            get_provider()

    @override_settings(AI_PROVIDER="gemini", GEMINI_API_KEY="")
    def test_gemini_missing_key_raises_config_error(self) -> None:
        with self.assertRaises(AIProviderConfigError):
            get_provider()

    def test_unsupported_provider_raises_config_error(self) -> None:
        with self.assertRaises(AIProviderConfigError):
            get_provider(provider_name="unsupported_vendor")
