from __future__ import annotations

import uuid
from typing import Any
from unittest.mock import MagicMock, patch

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from ai.providers import AIResponse
from apps.ai_coach.models import AIHistory
from apps.ai_coach.serializers import calculate_resume_review_score
from apps.career_profile.models import CareerProfile
from apps.resumes.models import Resume, ResumeAnalysis


User = get_user_model()


def make_raw_dimensional_response(dim_scores: dict[str, int], **kwargs: Any) -> dict[str, Any]:
    """Helper to build raw LLM dimensional evaluation dictionary."""
    all_dims = [
        "completeness",
        "content_quality",
        "experience_quality",
        "projects_achievements",
        "skills_presentation",
        "target_role_relevance",
        "professional_presentation",
    ]
    dims = {}
    for d in all_dims:
        score = dim_scores.get(d, 5)
        dims[d] = {"score": score, "evidence": f"Sample evidence for {d}"}

    payload = {
        "dimensions": dims,
        "strengths": ["Clear section headers", "Relevant target role keywords"],
        "weaknesses": ["Thin experience details", "Missing measurable outcomes"],
        "recommendations": ["Expand work experience bullets", "Add GitHub/LinkedIn links"],
    }
    payload.update(kwargs)
    return payload


class ResumeReviewFeatureTestCase(APITestCase):
    def setUp(self) -> None:
        self.user1 = User.objects.create_user(email="user1_rr@example.com", password="Password123!")
        self.profile1 = CareerProfile.objects.create(
            user=self.user1,
            first_name="Alice",
            last_name="Developer",
            headline="Full Stack Engineer",
            summary="Experienced Python and React developer.",
        )
        self.resume1 = Resume.objects.create(
            career_profile=self.profile1,
            title="Alice Primary Resume",
            target_role="Senior Full Stack Engineer",
            job_description="Looking for Python, Django, and React expertise.",
            content_data={"summary": "Engineered scalable web applications."},
        )

        self.user2 = User.objects.create_user(email="user2_rr@example.com", password="Password123!")
        self.profile2 = CareerProfile.objects.create(user=self.user2, first_name="Bob", last_name="Dev")
        self.resume2 = Resume.objects.create(career_profile=self.profile2, title="Bob Resume")

        self.client.force_authenticate(user=self.user1)

    @patch("ai.orchestrator.orchestrator.AIOrchestrator.generate")
    def test_resume_review_success(self, mock_generate: MagicMock) -> None:
        raw_payload = make_raw_dimensional_response(
            {
                "completeness": 9,
                "content_quality": 8,
                "experience_quality": 9,
                "projects_achievements": 8,
                "skills_presentation": 9,
                "target_role_relevance": 8,
                "professional_presentation": 8,
            }
        )
        # 0.20*9 + 0.20*8 + 0.15*9 + 0.15*8 + 0.10*9 + 0.10*8 + 0.10*8 = 1.8 + 1.6 + 1.35 + 1.2 + 0.9 + 0.8 + 0.8 = 8.45 -> round(84.5) = 85
        mock_generate.return_value = AIResponse(
            content=str(raw_payload),
            provider_name="huggingface",
            model_name="Qwen/Qwen2.5-7B-Instruct-Turbo",
            raw_response={"parsed": raw_payload},
        )

        payload = {"resume_id": str(self.resume1.id)}
        response = self.client.post("/api/v1/ai/resume-review/", payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        data = response.data["data"]
        self.assertEqual(data["resume_id"], str(self.resume1.id))
        self.assertEqual(data["score"], 85)
        self.assertNotIn("dimensions", data)  # Verify dimensions NOT exposed in API output
        self.assertEqual(data["strengths"], raw_payload["strengths"])
        self.assertEqual(data["weaknesses"], raw_payload["weaknesses"])
        self.assertEqual(data["recommendations"], raw_payload["recommendations"])

        # Verify database persistence
        self.assertEqual(ResumeAnalysis.objects.filter(resume=self.resume1).count(), 1)
        analysis = ResumeAnalysis.objects.get(resume=self.resume1)
        self.assertEqual(analysis.score, 85)

        # Verify AIHistory entry
        self.assertEqual(AIHistory.objects.filter(user=self.user1, feature="resume_review").count(), 1)

    def test_resume_review_unauthorized_resume(self) -> None:
        payload = {"resume_id": str(self.resume2.id)}  # Belongs to user2
        response = self.client.post("/api/v1/ai/resume-review/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_resume_review_missing_resume_id(self) -> None:
        payload = {}
        response = self.client.post("/api/v1/ai/resume-review/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_resume_review_nonexistent_uuid(self) -> None:
        payload = {"resume_id": str(uuid.uuid4())}
        response = self.client.post("/api/v1/ai/resume-review/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    @patch("ai.orchestrator.orchestrator.AIOrchestrator.generate")
    def test_weak_dimension_set_produces_low_score(self, mock_generate: MagicMock) -> None:
        raw_payload = make_raw_dimensional_response(
            {
                "completeness": 4,
                "content_quality": 3,
                "experience_quality": 4,
                "projects_achievements": 3,
                "skills_presentation": 3,
                "target_role_relevance": 4,
                "professional_presentation": 5,
            }
        )
        # 0.20*4 + 0.20*3 + 0.15*4 + 0.15*3 + 0.10*3 + 0.10*4 + 0.10*5 = 0.80 + 0.60 + 0.60 + 0.45 + 0.30 + 0.40 + 0.50 = 3.65 -> 37
        mock_generate.return_value = AIResponse(
            content=str(raw_payload),
            provider_name="ollama",
            model_name="phi3:latest",
            raw_response={"parsed": raw_payload},
        )
        payload = {"resume_id": str(self.resume1.id)}
        response = self.client.post("/api/v1/ai/resume-review/", payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["score"], 37)

    @patch("ai.orchestrator.orchestrator.AIOrchestrator.generate")
    def test_strong_dimension_set_produces_high_score(self, mock_generate: MagicMock) -> None:
        raw_payload = make_raw_dimensional_response({d: 9 for d in [
            "completeness", "content_quality", "experience_quality",
            "projects_achievements", "skills_presentation",
            "target_role_relevance", "professional_presentation"
        ]})
        # 9.0 * 10 = 90
        mock_generate.return_value = AIResponse(
            content=str(raw_payload),
            provider_name="huggingface",
            model_name="Qwen/Qwen2.5-7B-Instruct:fastest",
            raw_response={"parsed": raw_payload},
        )
        payload = {"resume_id": str(self.resume1.id)}
        response = self.client.post("/api/v1/ai/resume-review/", payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["score"], 90)

    @patch("ai.orchestrator.orchestrator.AIOrchestrator.generate")
    def test_llm_cannot_override_calculated_score(self, mock_generate: MagicMock) -> None:
        # LLM passes top-level "score": 99, but dimension scores are all 3s (30)
        raw_payload = make_raw_dimensional_response(
            {d: 3 for d in [
                "completeness", "content_quality", "experience_quality",
                "projects_achievements", "skills_presentation",
                "target_role_relevance", "professional_presentation"
            ]},
            score=99,
        )
        mock_generate.return_value = AIResponse(
            content=str(raw_payload),
            provider_name="huggingface",
            model_name="Qwen/Qwen2.5-7B-Instruct:fastest",
            raw_response={"parsed": raw_payload},
        )
        payload = {"resume_id": str(self.resume1.id)}
        response = self.client.post("/api/v1/ai/resume-review/", payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Score MUST be 30 (from dimensions), ignoring the top-level 99
        self.assertEqual(response.data["data"]["score"], 30)

    @patch("ai.orchestrator.orchestrator.AIOrchestrator.generate")
    def test_out_of_bounds_dimension_score_rejected(self, mock_generate: MagicMock) -> None:
        invalid_scores = [-1, 11]
        for inv in invalid_scores:
            raw_payload = make_raw_dimensional_response({"completeness": inv})
            mock_generate.return_value = AIResponse(
                content=str(raw_payload),
                provider_name="ollama",
                model_name="phi3:latest",
                raw_response={"parsed": raw_payload},
            )
            payload = {"resume_id": str(self.resume1.id)}
            count_before = ResumeAnalysis.objects.count()
            response = self.client.post("/api/v1/ai/resume-review/", payload, format="json")
            self.assertNotEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(ResumeAnalysis.objects.count(), count_before)

    @patch("ai.orchestrator.orchestrator.AIOrchestrator.generate")
    def test_missing_dimension_rejected(self, mock_generate: MagicMock) -> None:
        raw_payload = make_raw_dimensional_response({})
        del raw_payload["dimensions"]["experience_quality"]
        mock_generate.return_value = AIResponse(
            content=str(raw_payload),
            provider_name="ollama",
            model_name="phi3:latest",
            raw_response={"parsed": raw_payload},
        )
        payload = {"resume_id": str(self.resume1.id)}
        count_before = ResumeAnalysis.objects.count()
        response = self.client.post("/api/v1/ai/resume-review/", payload, format="json")
        self.assertNotEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(ResumeAnalysis.objects.count(), count_before)

    @patch("ai.orchestrator.orchestrator.AIOrchestrator.generate")
    def test_non_integer_dimension_score_rejected(self, mock_generate: MagicMock) -> None:
        non_integers = [7.5, "8", True, None]
        for non_int in non_integers:
            raw_payload = make_raw_dimensional_response({})
            raw_payload["dimensions"]["completeness"]["score"] = non_int
            mock_generate.return_value = AIResponse(
                content=str(raw_payload),
                provider_name="ollama",
                model_name="phi3:latest",
                raw_response={"parsed": raw_payload},
            )
            payload = {"resume_id": str(self.resume1.id)}
            count_before = ResumeAnalysis.objects.count()
            response = self.client.post("/api/v1/ai/resume-review/", payload, format="json")
            self.assertNotEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(ResumeAnalysis.objects.count(), count_before)

    @patch("ai.orchestrator.orchestrator.AIOrchestrator.generate")
    def test_weak_resume_calibration_regression(self, mock_generate: MagicMock) -> None:
        weak_resume = Resume.objects.create(
            career_profile=self.profile1,
            title="Weak Sparse Resume",
            target_role="Senior Staff Engineer",
            job_description="Seeking a Senior Staff Engineer with deep distributed systems expertise.",
            content_data={
                "summary": "Passionate worker looking for job.",
                "contact": {"email": "user@example.com"},
                "sections": [
                    {
                        "title": "Experience",
                        "items": [
                            {
                                "title": "Developer",
                                "company": "Corp",
                                "description": "Worked at Corp. Did stuff.",
                            }
                        ],
                    },
                    {"title": "Skills", "items": ["Python"]},
                    {"title": "Projects", "items": [{"title": "Project X", "description": "Thin app."}]},
                    {"title": "Achievements", "items": ["Employee of the month"]},
                ],
            },
        )

        calibrated_weak_payload = {
            "dimensions": {
                "completeness": {"score": 4, "evidence": "Basic sections present but experience and skills are minimal."},
                "content_quality": {"score": 3, "evidence": "Work experience uses generic phrasing ('Did stuff')."},
                "experience_quality": {"score": 4, "evidence": "Single experience entry lacking details and achievements."},
                "projects_achievements": {"score": 3, "evidence": "Only one thin project listed with no metrics."},
                "skills_presentation": {"score": 3, "evidence": "Only one skill listed (Python)."},
                "target_role_relevance": {"score": 4, "evidence": "Lacks distributed systems depth for Senior Staff Engineer."},
                "professional_presentation": {"score": 5, "evidence": "Clean formatting but missing GitHub/LinkedIn links."},
            },
            "strengths": ["Includes basic work experience and project sections"],
            "weaknesses": [
                "The work experience entry contains almost no responsibilities, technologies, or measurable contributions.",
                "Only one project is listed and its description provides little technical detail or measurable outcome.",
                "Skills presentation is weak with only one skill listed, lacking target-role alignment for Senior Staff Engineer.",
                "Missing professional links such as LinkedIn and GitHub in contact header.",
            ],
            "recommendations": [
                "Expand the Corp experience with 3-5 bullets covering backend responsibilities, technologies used, and measurable outcomes.",
                "Expand Project X with architecture, tech stack, key features, and measurable impact.",
                "Add relevant technical skills aligned with Senior Staff Engineer requirements.",
                "Add GitHub and LinkedIn links to the contact header.",
            ],
        }
        # Score calculation: 0.20*4 + 0.20*3 + 0.15*4 + 0.15*3 + 0.10*3 + 0.10*4 + 0.10*5 = 3.65 -> 37

        mock_generate.return_value = AIResponse(
            content=str(calibrated_weak_payload),
            provider_name="huggingface",
            model_name="Qwen/Qwen2.5-7B-Instruct:fastest",
            raw_response={"parsed": calibrated_weak_payload},
        )

        payload = {"resume_id": str(weak_resume.id)}
        response = self.client.post("/api/v1/ai/resume-review/", payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        data = response.data["data"]
        expected_score = calculate_resume_review_score(calibrated_weak_payload["dimensions"])
        self.assertEqual(data["score"], expected_score)
        self.assertEqual(data["score"], 37)
        self.assertTrue(30 <= data["score"] <= 59)
        self.assertTrue(len(data["weaknesses"]) >= 3)
        self.assertTrue(len(data["recommendations"]) >= 3)
