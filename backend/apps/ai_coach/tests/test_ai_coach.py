from __future__ import annotations

from unittest.mock import patch

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from apps.ai_coach.models import AIHistory

User = get_user_model()


class AICoachAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="aicoachuser@example.com",
            password="Password123!",
        )
        self.client.force_authenticate(user=self.user)

    @patch("apps.ai_coach.client.OllamaClient.generate")
    def test_generate_cover_letter(self, mock_generate):
        mock_generate.return_value = {
            "response": "Dear Hiring Manager at Google, I am writing to express my interest in the Staff Software Engineer position.",
            "model": "phi3:latest",
            "prompt_tokens": 100,
            "completion_tokens": 150,
            "total_tokens": 250,
        }

        payload = {
            "company_name": "Google",
            "job_title": "Staff Software Engineer",
            "job_description": "Architect scalable backend services using Python and Go.",
            "tone": "professional",
        }
        response = self.client.post("/api/v1/ai/cover-letter/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("Google", response.data["data"]["response"])
        self.assertEqual(AIHistory.objects.filter(user=self.user, feature="cover_letter").count(), 1)

    @patch("apps.ai_coach.client.OllamaClient.generate")
    def test_skill_gap_analysis(self, mock_generate):
        mock_generate.return_value = {
            "response": "Readiness Score: 85%. Missing skills: Kubernetes, GraphQL.",
            "model": "phi3:latest",
            "prompt_tokens": 80,
            "completion_tokens": 120,
            "total_tokens": 200,
        }

        payload = {
            "target_role": "Backend Lead",
            "required_skills": ["Python", "Kubernetes", "GraphQL"],
        }
        response = self.client.post("/api/v1/ai/skill-gap/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["feature"], "ats_review")

    @patch("apps.ai_coach.client.OllamaClient.generate")
    def test_career_advice(self, mock_generate):
        mock_generate.return_value = {
            "response": "Focus on high-scale architecture and team leadership.",
            "model": "phi3:latest",
            "prompt_tokens": 70,
            "completion_tokens": 110,
            "total_tokens": 180,
        }

        payload = {
            "target_role": "Engineering Manager",
            "industry": "Fintech",
        }
        response = self.client.post("/api/v1/ai/career-advice/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("architecture", response.data["data"]["response"])

    @patch("apps.ai_coach.client.OllamaClient.generate")
    def test_job_match(self, mock_generate):
        mock_generate.return_value = {
            "response": "High match score of 90% for Stripe Fullstack Engineer position.",
            "model": "phi3:latest",
            "prompt_tokens": 90,
            "completion_tokens": 130,
            "total_tokens": 220,
        }

        payload = {
            "job_title": "Fullstack Engineer",
            "company_name": "Stripe",
        }
        response = self.client.post("/api/v1/ai/job-match/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["feature"], "job_match")
