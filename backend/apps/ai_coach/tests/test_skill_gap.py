from __future__ import annotations

import uuid
from unittest.mock import MagicMock, patch

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from ai.providers import AIResponse
from ai.providers.base import AIProviderError
from apps.ai_coach.models import AIHistory
from apps.career_profile.models import CareerProfile
from apps.jobs.models import SavedJob, SkillGapAnalysis
from apps.jobs.skill_gap import extract_job_skills, normalize_skill, perform_deterministic_skill_comparison
from apps.skills.models import Skill

User = get_user_model()


class ContextualSkillGapTestCase(APITestCase):
    def setUp(self) -> None:
        self.user1 = User.objects.create_user(email="user1_sg@example.com", password="Password123!")
        self.profile1 = CareerProfile.objects.create(
            user=self.user1,
            first_name="Alice",
            last_name="Engineer",
            headline="Backend Developer",
            summary="Experienced Python and Django developer.",
        )
        Skill.objects.create(career_profile=self.profile1, name="Python", category="Backend", proficiency_level="expert")
        Skill.objects.create(career_profile=self.profile1, name="Django", category="Backend", proficiency_level="intermediate")
        Skill.objects.create(career_profile=self.profile1, name="React.js", category="Frontend", proficiency_level="intermediate")

        self.job1 = SavedJob.objects.create(
            career_profile=self.profile1,
            title="Senior Backend Engineer",
            company="CloudTech",
            description="Looking for Python, Django, AWS, and Docker experience.",
        )

        self.user2 = User.objects.create_user(email="user2_sg@example.com", password="Password123!")
        self.profile2 = CareerProfile.objects.create(user=self.user2, first_name="Bob", last_name="Dev")
        self.job2 = SavedJob.objects.create(
            career_profile=self.profile2,
            title="Bob Target Job",
            company="Acme",
            description="Java and Spring Boot developer.",
        )

        self.client.force_authenticate(user=self.user1)

    def test_deterministic_skill_matching_and_alias_normalization(self) -> None:
        user_skills = ["python", "django", "React.js", "postgres"]
        required = ["Python", "Django", "React", "PostgreSQL", "AWS", "Docker"]

        matched, unmatched = perform_deterministic_skill_comparison(user_skills, required)
        self.assertEqual(matched, ["Python", "Django", "React", "PostgreSQL"])
        self.assertEqual(unmatched, ["AWS", "Docker"])

    def test_ambiguous_and_contextual_skill_extraction(self) -> None:
        # 1. "Go above and beyond" -> does not extract Go
        res1 = extract_job_skills("Go above and beyond to deliver excellent products", "Software Engineer")
        self.assertNotIn("Go", res1)

        # 2. "Go programming experience required" -> extracts Go
        res2 = extract_job_skills("Go programming experience required", "Software Engineer")
        self.assertIn("Go", res2)

        # 3. "Git version control experience" -> extracts Git
        res3 = extract_job_skills("Git version control experience required", "Software Engineer")
        self.assertIn("Git", res3)

        # 4. Ordinary prose containing "git" incidentally
        res4 = extract_job_skills("Seeking a legitimate candidate with high digital literacy", "Analyst")
        self.assertNotIn("Git", res4)

        # 5. Existing Python/Django/AWS/Docker extraction
        res5 = extract_job_skills("Looking for Python, Django, AWS, and Docker experience.", "Backend Engineer")
        self.assertEqual(res5, ["Python", "Django", "AWS", "Docker"])

        # 6. Case-insensitive extraction
        res6 = extract_job_skills("python and django developer", "Backend Engineer")
        self.assertEqual(res6, ["Python", "Django"])

        # 7. Duplicate skills remain deduplicated
        res7 = extract_job_skills("Python developer with Python, Django, and Python skills", "Backend Engineer")
        self.assertEqual(res7, ["Python", "Django"])


    @patch("ai.orchestrator.orchestrator.AIOrchestrator.generate")
    def test_skill_gap_analysis_success_and_persistence(self, mock_generate: MagicMock) -> None:
        ai_payload = {
            "matched_skills": ["Python", "Django"],
            "missing_skills": [
                {
                    "skill": "AWS",
                    "importance": "high",
                    "reason": "Primary cloud provider used for production infrastructure.",
                    "recommendation": "Learn AWS core services: EC2, S3, and IAM.",
                }
            ],
            "partial_skills": [
                {
                    "skill": "Docker",
                    "reason": "Basic containerization knowledge present, but production experience is missing.",
                    "recommendation": "Practice containerizing Django REST APIs using Docker Compose.",
                }
            ],
        }

        mock_generate.return_value = AIResponse(
            content=str(ai_payload),
            provider_name="huggingface",
            model_name="Qwen/Qwen2.5-7B-Instruct:fastest",
            raw_response={"parsed": ai_payload},
        )

        payload = {"job_id": str(self.job1.id)}
        response = self.client.post("/api/v1/ai/skill-gap/", payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        data = response.data["data"]

        self.assertEqual(data["job_id"], str(self.job1.id))
        self.assertIn("Python", data["matched_skills"])
        self.assertIn("Django", data["matched_skills"])
        self.assertEqual(len(data["missing_skills"]), 1)
        self.assertEqual(data["missing_skills"][0]["skill"], "AWS")
        self.assertEqual(data["missing_skills"][0]["importance"], "high")
        self.assertEqual(len(data["partial_skills"]), 1)
        self.assertEqual(data["partial_skills"][0]["skill"], "Docker")
        self.assertTrue(len(data["recommendations"]) >= 2)

        # Database persistence check
        analysis = SkillGapAnalysis.objects.get(job=self.job1)
        self.assertEqual(analysis.career_profile, self.profile1)
        self.assertEqual(analysis.matched_skills, data["matched_skills"])
        self.assertEqual(analysis.missing_skills, data["missing_skills"])

        # History check
        self.assertEqual(AIHistory.objects.filter(user=self.user1, feature="skill_gap").count(), 1)

    def test_job_ownership_isolation(self) -> None:
        # User 1 attempting to analyze User 2's job
        payload = {"job_id": str(self.job2.id)}
        response = self.client.post("/api/v1/ai/skill-gap/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_nonexistent_job_id(self) -> None:
        payload = {"job_id": str(uuid.uuid4())}
        response = self.client.post("/api/v1/ai/skill-gap/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_missing_job_id(self) -> None:
        payload = {}
        response = self.client.post("/api/v1/ai/skill-gap/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_uuid_job_id(self) -> None:
        payload = {"job_id": "not-a-valid-uuid"}
        response = self.client.post("/api/v1/ai/skill-gap/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch("ai.orchestrator.orchestrator.AIOrchestrator.generate")
    def test_invalid_ai_schema_rejection(self, mock_generate: MagicMock) -> None:
        invalid_payloads = [
            # Missing missing_skills key
            {"matched_skills": ["Python"], "partial_skills": []},
            # Invalid importance
            {
                "matched_skills": ["Python"],
                "missing_skills": [{"skill": "AWS", "importance": "critical", "reason": "r", "recommendation": "rec"}],
                "partial_skills": [],
            },
            # Malformed string instead of array
            {"matched_skills": "Python, Django", "missing_skills": [], "partial_skills": []},
        ]

        for inv in invalid_payloads:
            mock_generate.return_value = AIResponse(
                content=str(inv),
                provider_name="ollama",
                model_name="phi3:latest",
                raw_response={"parsed": inv},
            )
            count_before = SkillGapAnalysis.objects.count()
            payload = {"job_id": str(self.job1.id)}
            response = self.client.post("/api/v1/ai/skill-gap/", payload, format="json")
            self.assertNotEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(SkillGapAnalysis.objects.count(), count_before)

    @patch("ai.orchestrator.orchestrator.AIOrchestrator.generate")
    def test_ai_provider_failure_handling(self, mock_generate: MagicMock) -> None:
        mock_generate.side_effect = AIProviderError("Service down", status_code=503)
        payload = {"job_id": str(self.job1.id)}
        response = self.client.post("/api/v1/ai/skill-gap/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
        self.assertFalse(response.data["success"])
