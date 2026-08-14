from __future__ import annotations

from unittest.mock import patch

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from ai.providers import AIResponse
from apps.ai_coach.models import AIHistory

User = get_user_model()


class AICoachAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="aicoachuser@example.com",
            password="Password123!",
        )
        self.client.force_authenticate(user=self.user)

    @patch("ai.orchestrator.orchestrator.AIOrchestrator.generate")
    def test_generate_cover_letter(self, mock_generate):
        mock_generate.return_value = AIResponse(
            content="Dear Hiring Manager at Google, I am writing to express my interest in the Staff Software Engineer position.",
            provider_name="ollama",
            model_name="phi3:latest",
            prompt_tokens=100,
            completion_tokens=150,
            total_tokens=250,
        )

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

    @patch("ai.orchestrator.orchestrator.AIOrchestrator.generate")
    def test_skill_gap_analysis(self, mock_generate):
        from apps.career_profile.models import CareerProfile
        from apps.jobs.models import SavedJob

        profile = CareerProfile.objects.create(user=self.user, first_name="Test", last_name="User")
        job = SavedJob.objects.create(career_profile=profile, title="Backend Lead", company="Stripe", description="Python and AWS")

        ai_payload = {
            "matched_skills": ["Python"],
            "missing_skills": [{"skill": "AWS", "importance": "high", "reason": "Cloud infra", "recommendation": "Learn AWS"}],
            "partial_skills": [],
        }

        mock_generate.return_value = AIResponse(
            content=str(ai_payload),
            provider_name="ollama",
            model_name="phi3:latest",
            prompt_tokens=80,
            completion_tokens=120,
            total_tokens=200,
            raw_response={"parsed": ai_payload},
        )

        payload = {
            "job_id": str(job.id),
        }
        response = self.client.post("/api/v1/ai/skill-gap/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["job_id"], str(job.id))


    @patch("ai.orchestrator.orchestrator.AIOrchestrator.generate")
    def test_career_advice(self, mock_generate):
        mock_generate.return_value = AIResponse(
            content="Focus on high-scale architecture and team leadership.",
            provider_name="ollama",
            model_name="phi3:latest",
            prompt_tokens=70,
            completion_tokens=110,
            total_tokens=180,
        )

        payload = {
            "target_role": "Engineering Manager",
            "industry": "Fintech",
        }
        response = self.client.post("/api/v1/ai/career-advice/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("architecture", response.data["data"]["response"])

    @patch("ai.orchestrator.orchestrator.AIOrchestrator.generate")
    def test_job_match(self, mock_generate):
        from apps.career_profile.models import CareerProfile
        from apps.jobs.models import SavedJob
        from apps.resumes.models import Resume

        profile = CareerProfile.objects.create(user=self.user, first_name="Test", last_name="User")
        job = SavedJob.objects.create(career_profile=profile, title="Fullstack Engineer", company="Stripe")
        resume = Resume.objects.create(career_profile=profile, title="Main Resume")

        mock_generate.return_value = AIResponse(
            content='{"match_score": 90, "strengths": ["Fullstack"], "missing_skills": [], "gaps": [], "recommendations": []}',
            provider_name="ollama",
            model_name="phi3:latest",
            prompt_tokens=90,
            completion_tokens=130,
            total_tokens=220,
            raw_response={
                "parsed": {
                    "match_score": 90,
                    "strengths": ["Fullstack"],
                    "missing_skills": [],
                    "gaps": [],
                    "recommendations": [],
                }
            },
        )

        payload = {
            "job_id": str(job.id),
            "resume_id": str(resume.id),
        }
        response = self.client.post("/api/v1/ai/job-match/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["match_score"], 90)
