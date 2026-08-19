from __future__ import annotations

from typing import Any
from unittest.mock import MagicMock, patch

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from ai.providers import AIResponse
from apps.ai_coach.models import AIHistory
from apps.career_profile.models import CareerProfile
from apps.jobs.models import SavedJob
from apps.resumes.models import Resume


User = get_user_model()


class AIBoundaryArchitectureTestCase(APITestCase):
    """Phase 18 Comprehensive AI Boundary & LLM Call Count Architecture Test Suite."""

    def setUp(self) -> None:
        self.user = User.objects.create_user(email="boundary_user@example.com", password="Password123!")
        self.profile = CareerProfile.objects.create(
            user=self.user,
            first_name="Boundary",
            last_name="Tester",
            headline="Backend Engineer",
            summary="Python developer.",
        )
        self.resume = Resume.objects.create(
            career_profile=self.profile,
            title="Boundary Resume",
            target_role="Python Developer",
            content_data={"summary": "Engineered Python microservices."},
        )
        self.job = SavedJob.objects.create(
            career_profile=self.profile,
            title="Senior Python Developer",
            company="Tech Corp",
            description="Looking for Python, Django, PostgreSQL, and Docker skills.",
        )
        self.client.force_authenticate(user=self.user)

    def make_mock_response(self, content_dict: dict[str, Any]) -> AIResponse:
        return AIResponse(
            content=str(content_dict),
            provider_name="huggingface",
            model_name="Qwen/Qwen2.5-7B-Instruct:fastest",
            raw_response={"parsed": content_dict},
        )

    # 1. Skill Gap Analysis -> EXACTLY 0 LLM Calls
    @patch("ai.orchestrator.orchestrator.AIOrchestrator.generate")
    def test_1_skill_gap_executes_zero_llm_calls(self, mock_generate: MagicMock) -> None:
        response = self.client.post("/api/v1/ai/skill-gap/", {"job_id": str(self.job.id)}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(mock_generate.call_count, 0)
        self.assertEqual(AIHistory.objects.filter(user=self.user, feature="skill_gap").count(), 0)

    # 2. Career Roadmap -> EXACTLY 0 LLM Calls
    @patch("ai.orchestrator.orchestrator.AIOrchestrator.generate")
    def test_2_roadmap_executes_zero_llm_calls(self, mock_generate: MagicMock) -> None:
        response = self.client.post("/api/v1/ai/roadmap/", {"title": "Python Developer Roadmap", "target_role": "Python Developer"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(mock_generate.call_count, 0)
        self.assertEqual(AIHistory.objects.filter(user=self.user, feature="roadmap").count(), 0)

    # 3. Resume Review Default -> EXACTLY 0 LLM Calls
    @patch("ai.orchestrator.orchestrator.AIOrchestrator.generate")
    def test_3_resume_review_default_executes_zero_llm_calls(self, mock_generate: MagicMock) -> None:
        response = self.client.post("/api/v1/ai/resume-review/", {"resume_id": str(self.resume.id)}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(mock_generate.call_count, 0)
        self.assertEqual(AIHistory.objects.filter(user=self.user, feature="resume_review").count(), 0)

    # 4. Resume Review Enhanced -> EXACTLY 1 LLM Call
    @patch("ai.orchestrator.orchestrator.AIOrchestrator.generate")
    def test_4_resume_review_enhanced_executes_exactly_one_llm_call(self, mock_generate: MagicMock) -> None:
        mock_generate.return_value = self.make_mock_response({
            "strengths": ["Clear technical focus"],
            "weaknesses": ["Thin education section"],
            "recommendations": ["Elaborate on degree"],
        })
        response = self.client.post("/api/v1/ai/resume-review/", {"resume_id": str(self.resume.id), "enhance_with_ai": True}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(mock_generate.call_count, 1)
        self.assertEqual(AIHistory.objects.filter(user=self.user, feature="resume_review").count(), 1)

    # 5. Job Match -> EXACTLY 1 LLM Call & Deterministic Score Override Protection
    @patch("ai.orchestrator.orchestrator.AIOrchestrator.generate")
    def test_5_job_match_executes_exactly_one_llm_call_and_protects_score(self, mock_generate: MagicMock) -> None:
        # LLM returns fake score 99 and hallucinated missing skills
        mock_generate.return_value = self.make_mock_response({
            "match_score": 99,
            "strengths": ["Python expertise matches"],
            "missing_skills": ["HallucinatedSkill"],
            "gaps": ["Lacks Docker"],
            "recommendations": ["Learn Docker"],
        })
        response = self.client.post("/api/v1/ai/job-match/", {"job_id": str(self.job.id), "resume_id": str(self.resume.id)}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(mock_generate.call_count, 1)

        data = response.data["data"]
        # Score and missing skills MUST be protected by Python deterministic calculations
        self.assertNotEqual(data["match_score"], 99)
        self.assertNotIn("HallucinatedSkill", data["missing_skills"])

    # 6. Cover Letter -> EXACTLY 1 LLM Call
    @patch("ai.orchestrator.orchestrator.AIOrchestrator.generate")
    def test_6_cover_letter_executes_exactly_one_llm_call(self, mock_generate: MagicMock) -> None:
        mock_generate.return_value = AIResponse(
            content="Dear Hiring Manager, I am excited to apply...",
            provider_name="huggingface",
            model_name="Qwen",
            raw_response={"content": "Dear Hiring Manager..."},
        )
        response = self.client.post(
            "/api/v1/ai/cover-letter/",
            {"company_name": "Acme", "job_title": "Developer", "job_description": "Python dev position", "tone": "professional"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(mock_generate.call_count, 1)

    # 7. Career Advice -> EXACTLY 1 LLM Call
    @patch("ai.orchestrator.orchestrator.AIOrchestrator.generate")
    def test_7_career_advice_executes_exactly_one_llm_call(self, mock_generate: MagicMock) -> None:
        mock_generate.return_value = AIResponse(
            content="Focus on backend system design and cloud certifications...",
            provider_name="huggingface",
            model_name="Qwen",
            raw_response={"content": "Focus on backend..."},
        )
        response = self.client.post("/api/v1/ai/career-advice/", {"target_role": "Staff Engineer", "industry": "Cloud"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(mock_generate.call_count, 1)

    # 8. AI Chat -> EXACTLY 1 LLM Call per User Message
    @patch("ai.orchestrator.orchestrator.AIOrchestrator.generate")
    def test_8_ai_chat_executes_exactly_one_llm_call(self, mock_generate: MagicMock) -> None:
        mock_generate.return_value = AIResponse(
            content="Hello! How can I help with your Python career journey?",
            provider_name="huggingface",
            model_name="Qwen",
            raw_response={"content": "Hello!..."},
        )
        response = self.client.post("/api/v1/ai/chat/", {"feature": "career_chat", "prompt": "How do I prepare for Senior Python interviews?"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(mock_generate.call_count, 1)

    # Security & Ownership Isolation Checks
    def test_unauthorized_job_match_isolation(self) -> None:
        user2 = User.objects.create_user(email="other_user@example.com", password="Password123!")
        self.client.force_authenticate(user=user2)
        response = self.client.post("/api/v1/ai/job-match/", {"job_id": str(self.job.id), "resume_id": str(self.resume.id)}, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
