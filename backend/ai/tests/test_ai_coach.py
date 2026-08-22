from __future__ import annotations

from unittest.mock import MagicMock, patch
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from ai.providers import AIResponse
from apps.career_profile.models import CareerProfile

User = get_user_model()


class AICoachServiceRefactorTests(APITestCase):
    def setUp(self) -> None:
        self.user = User.objects.create_user(email="coachuser@example.com", password="Password123!")
        self.profile = CareerProfile.objects.create(user=self.user, first_name="Dev", last_name="User")
        self.client.force_authenticate(user=self.user)

    @patch("ai.orchestrator.orchestrator.AIOrchestrator.generate")
    def test_ai_coach_delegates_through_orchestrator(self, mock_generate: MagicMock) -> None:
        mock_generate.return_value = AIResponse(
            content="Delegated AI response text",
            provider_name="huggingface",
            model_name="meta-llama/Llama-3.2-3B-Instruct",
            prompt_tokens=15,
            completion_tokens=25,
            total_tokens=40,
        )

        payload = {"feature": "career_chat", "prompt": "How to improve Python skills?"}
        response = self.client.post("/api/v1/ai/chat/", payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["response"], "Delegated AI response text")
        self.assertEqual(response.data["data"]["model"], "meta-llama/Llama-3.2-3B-Instruct")
        mock_generate.assert_called_once()
