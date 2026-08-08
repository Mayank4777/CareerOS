from __future__ import annotations

from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.urls import reverse
import requests
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class OllamaAIBackendTestCase(APITestCase):
    def setUp(self) -> None:
        self.user = User.objects.create_user(
            email="ollama_test@example.com",
            password="testpassword123",
            first_name="Ollama",
            last_name="Tester",
        )
        self.client.force_authenticate(user=self.user)
        self.chat_url = reverse("ai_chat")

    @patch("requests.post")
    def test_chat_success(self, mock_post) -> None:
        mock_post.return_value.status_code = 200
        mock_post.return_value.json.return_value = {
            "model": "phi3:latest",
            "response": "To improve your resume, add quantifiable metrics to your bullet points.",
            "prompt_eval_count": 45,
            "eval_count": 80,
        }

        response = self.client.post(
            self.chat_url,
            {"feature": "career_chat", "prompt": "How can I improve my resume?"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["data"]["feature"], "career_chat")
        self.assertEqual(response.data["data"]["model"], "phi3:latest")
        self.assertIn("quantifiable metrics", response.data["data"]["response"])

    @patch("requests.post")
    def test_ollama_unavailable(self, mock_post) -> None:
        mock_post.side_effect = requests.exceptions.ConnectionError("Failed to connect")

        response = self.client.post(
            self.chat_url,
            {"feature": "career_chat", "prompt": "Test prompt"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
        self.assertFalse(response.data["success"])
        self.assertIn("Could not connect to local Ollama server", response.data["message"])

    def test_invalid_request(self) -> None:
        response = self.client.post(
            self.chat_url,
            {"feature": "career_chat", "prompt": ""},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch("requests.post")
    def test_timeout(self, mock_post) -> None:
        mock_post.side_effect = requests.exceptions.Timeout("Read timed out")

        response = self.client.post(
            self.chat_url,
            {"feature": "career_chat", "prompt": "Test timeout"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_504_GATEWAY_TIMEOUT)
        self.assertFalse(response.data["success"])
        self.assertIn("timed out", response.data["message"])

    @patch("requests.post")
    def test_malformed_response(self, mock_post) -> None:
        mock_post.return_value.status_code = 200
        mock_post.return_value.json.side_effect = ValueError("Invalid JSON")

        response = self.client.post(
            self.chat_url,
            {"feature": "career_chat", "prompt": "Test malformed"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_502_BAD_GATEWAY)
        self.assertFalse(response.data["success"])
        self.assertIn("not valid JSON", response.data["message"])
