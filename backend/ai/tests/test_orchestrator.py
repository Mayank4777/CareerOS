from __future__ import annotations

from unittest.mock import MagicMock, patch
from django.test import TestCase

from ai.orchestrator import AIOrchestrator
from ai.parsers import JSONResponseParser
from ai.providers import AIResponse


class AIOrchestratorTests(TestCase):
    def setUp(self) -> None:
        self.orchestrator = AIOrchestrator()

    @patch("ai.orchestrator.orchestrator.get_provider")
    def test_orchestrator_delegates_to_explicit_provider(self, mock_get_provider: MagicMock) -> None:
        mock_provider = MagicMock()
        mock_provider.generate.return_value = AIResponse(
            content="Generated answer",
            provider_name="huggingface",
            model_name="test-model",
            prompt_tokens=5,
            completion_tokens=10,
            total_tokens=15,
        )
        mock_get_provider.return_value = mock_provider

        res = self.orchestrator.generate(prompt="Test prompt", system_prompt="Sys prompt", provider_name="huggingface")

        self.assertEqual(res.content, "Generated answer")
        self.assertEqual(res.provider_name, "huggingface")
        mock_provider.generate.assert_called_once_with(
            prompt="Test prompt",
            system_prompt="Sys prompt",
            model=None,
        )

    @patch("ai.providers.router.AIProviderRouter.generate")
    def test_orchestrator_with_response_parser(self, mock_router_generate: MagicMock) -> None:
        mock_router_generate.return_value = AIResponse(
            content='{"score": 90, "status": "ok"}',
            provider_name="ollama",
            model_name="phi3:latest",
        )

        parser = JSONResponseParser(required_fields=["score", "status"])
        res = self.orchestrator.generate(prompt="Test", parser=parser)

        self.assertEqual(res.raw_response["parsed"]["score"], 90)
        self.assertEqual(res.raw_response["parsed"]["status"], "ok")
