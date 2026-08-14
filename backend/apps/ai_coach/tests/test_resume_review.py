from __future__ import annotations

import uuid
from unittest.mock import MagicMock, patch

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from ai.providers import AIResponse
from apps.ai_coach.models import AIHistory
from apps.career_profile.models import CareerProfile
from apps.resumes.models import Resume, ResumeAnalysis

User = get_user_model()


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
        mock_generate.return_value = AIResponse(
            content='{"score": 85, "strengths": ["Strong Python background"], "weaknesses": ["Lacks cloud certs"], "recommendations": ["Add AWS credentials"]}',
            provider_name="huggingface",
            model_name="Qwen/Qwen2.5-7B-Instruct-Turbo",
            raw_response={
                "parsed": {
                    "score": 85,
                    "strengths": ["Strong Python background"],
                    "weaknesses": ["Lacks cloud certs"],
                    "recommendations": ["Add AWS credentials"],
                }
            },
        )

        payload = {"resume_id": str(self.resume1.id)}
        response = self.client.post("/api/v1/ai/resume-review/", payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        data = response.data["data"]
        self.assertEqual(data["resume_id"], str(self.resume1.id))
        self.assertEqual(data["score"], 85)
        self.assertEqual(data["strengths"], ["Strong Python background"])
        self.assertEqual(data["weaknesses"], ["Lacks cloud certs"])
        self.assertEqual(data["recommendations"], ["Add AWS credentials"])

        # Verify database persistence
        self.assertEqual(ResumeAnalysis.objects.filter(resume=self.resume1).count(), 1)
        analysis = ResumeAnalysis.objects.get(resume=self.resume1)
        self.assertEqual(analysis.score, 85)
        self.assertEqual(analysis.strengths, ["Strong Python background"])

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
    def test_resume_review_invalid_scores(self, mock_generate: MagicMock) -> None:
        invalid_scores = [-5, 105, "85", "excellent", None]
        for invalid_score in invalid_scores:
            parsed_dict = {
                "score": invalid_score,
                "strengths": [],
                "weaknesses": [],
                "recommendations": [],
            }
            mock_generate.return_value = AIResponse(
                content=str(parsed_dict),
                provider_name="ollama",
                model_name="phi3:latest",
                raw_response={"parsed": parsed_dict},
            )
            payload = {"resume_id": str(self.resume1.id)}
            count_before = ResumeAnalysis.objects.count()
            response = self.client.post("/api/v1/ai/resume-review/", payload, format="json")
            self.assertNotEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(ResumeAnalysis.objects.count(), count_before)
