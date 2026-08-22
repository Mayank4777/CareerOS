from __future__ import annotations

import uuid
from unittest.mock import MagicMock, patch
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from ai.providers import AIResponse
from apps.career_profile.models import CareerProfile
from apps.jobs.models import JobMatchAnalysis, SavedJob
from apps.resumes.models import Resume

User = get_user_model()


class JobMatchFeatureTestCase(APITestCase):
    def setUp(self) -> None:
        self.user1 = User.objects.create_user(email="user1_jm@example.com", password="Password123!")
        self.profile1 = CareerProfile.objects.create(
            user=self.user1,
            first_name="Alice",
            last_name="Engineer",
            headline="Senior Backend Engineer",
        )
        self.job1 = SavedJob.objects.create(
            career_profile=self.profile1,
            title="Senior Python Developer",
            company="Acme Corp",
            description="Looking for Python, Django, PostgreSQL, and AWS expertise.",
        )
        self.resume1 = Resume.objects.create(
            career_profile=self.profile1,
            title="Alice Technical Resume",
            target_role="Python Developer",
            content_data={"summary": "Experienced Python Engineer"},
        )

        from apps.skills.models import Skill
        Skill.objects.create(career_profile=self.profile1, name="Python", proficiency_level="advanced")
        Skill.objects.create(career_profile=self.profile1, name="Django", proficiency_level="advanced")
        Skill.objects.create(career_profile=self.profile1, name="PostgreSQL", proficiency_level="intermediate")

        self.user2 = User.objects.create_user(email="user2_jm@example.com", password="Password123!")
        self.profile2 = CareerProfile.objects.create(user=self.user2, first_name="Bob", last_name="Dev")
        self.job2 = SavedJob.objects.create(career_profile=self.profile2, title="Other Job", company="Other Corp")
        self.resume2 = Resume.objects.create(career_profile=self.profile2, title="Bob Resume")

        self.client.force_authenticate(user=self.user1)

    @patch("ai.orchestrator.orchestrator.AIOrchestrator.generate")
    def test_job_match_success(self, mock_generate: MagicMock) -> None:
        mock_generate.return_value = AIResponse(
            content='{"match_score": 88, "strengths": ["Strong Python background"], "missing_skills": ["AWS"], "gaps": ["No Kubernetes"], "recommendations": ["Learn AWS Core services"]}',
            provider_name="huggingface",
            model_name="meta-llama/Llama-3.2-3B-Instruct",
            raw_response={
                "parsed": {
                    "match_score": 88,
                    "strengths": ["Strong Python background"],
                    "missing_skills": ["AWS"],
                    "gaps": ["No Kubernetes"],
                    "recommendations": ["Learn AWS Core services"],
                }
            },
        )

        payload = {
            "job_id": str(self.job1.id),
            "resume_id": str(self.resume1.id),
        }
        response = self.client.post("/api/v1/ai/job-match/", payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        data = response.data["data"]
        self.assertEqual(data["job_id"], str(self.job1.id))
        self.assertEqual(data["resume_id"], str(self.resume1.id))
        self.assertEqual(data["match_score"], 75)
        self.assertEqual(data["strengths"], ["Strong Python background"])
        self.assertEqual(data["missing_skills"], ["AWS"])
        self.assertEqual(data["gaps"], ["No Kubernetes"])
        self.assertEqual(data["recommendations"], ["Learn AWS Core services"])

        # Check database persistence
        self.assertEqual(JobMatchAnalysis.objects.filter(job=self.job1, resume=self.resume1).count(), 1)
        analysis = JobMatchAnalysis.objects.get(job=self.job1)
        self.assertEqual(analysis.match_score, 75)

    def test_job_match_unauthorized_job(self) -> None:
        payload = {
            "job_id": str(self.job2.id),  # Belongs to user2
            "resume_id": str(self.resume1.id),
        }
        response = self.client.post("/api/v1/ai/job-match/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_job_match_unauthorized_resume(self) -> None:
        payload = {
            "job_id": str(self.job1.id),
            "resume_id": str(self.resume2.id),  # Belongs to user2
        }
        response = self.client.post("/api/v1/ai/job-match/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_job_match_missing_fields(self) -> None:
        payload = {"job_id": str(self.job1.id)}  # Missing resume_id
        response = self.client.post("/api/v1/ai/job-match/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_job_match_nonexistent_uuid(self) -> None:
        payload = {
            "job_id": str(uuid.uuid4()),
            "resume_id": str(self.resume1.id),
        }
        response = self.client.post("/api/v1/ai/job-match/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    @patch("ai.orchestrator.orchestrator.AIOrchestrator.generate")
    def test_job_match_valid_boundary_scores_and_empty_arrays(self, mock_generate: MagicMock) -> None:
        for valid_score in [0, 50, 100]:
            mock_generate.return_value = AIResponse(
                content=f'{{"match_score": {valid_score}, "strengths": [], "missing_skills": [], "gaps": [], "recommendations": []}}',
                provider_name="ollama",
                model_name="phi3:latest",
                raw_response={
                    "parsed": {
                        "match_score": valid_score,
                        "strengths": [],
                        "missing_skills": [],
                        "gaps": [],
                        "recommendations": [],
                    }
                },
            )
            payload = {"job_id": str(self.job1.id), "resume_id": str(self.resume1.id)}
            response = self.client.post("/api/v1/ai/job-match/", payload, format="json")
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(response.data["data"]["match_score"], 75)

    @patch("ai.orchestrator.orchestrator.AIOrchestrator.generate")
    def test_job_match_invalid_scores(self, mock_generate: MagicMock) -> None:
        invalid_scores = [-1, 101, "88", "excellent", None]
        for invalid_score in invalid_scores:
            parsed_dict = {
                "match_score": invalid_score,
                "strengths": [],
                "missing_skills": [],
                "gaps": [],
                "recommendations": [],
            }
            mock_generate.return_value = AIResponse(
                content=str(parsed_dict),
                provider_name="ollama",
                model_name="phi3:latest",
                raw_response={"parsed": parsed_dict},
            )
            payload = {"job_id": str(self.job1.id), "resume_id": str(self.resume1.id)}
            count_before = JobMatchAnalysis.objects.count()
            response = self.client.post("/api/v1/ai/job-match/", payload, format="json")
            self.assertNotEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(JobMatchAnalysis.objects.count(), count_before)

    @patch("ai.orchestrator.orchestrator.AIOrchestrator.generate")
    def test_job_match_invalid_array_fields(self, mock_generate: MagicMock) -> None:
        invalid_payloads = [
            {"strengths": "Python"},
            {"missing_skills": "AWS"},
            {"gaps": "No cloud experience"},
            {"recommendations": "Learn AWS"},
            {"strengths": None},
            {"missing_skills": None},
            {"gaps": None},
            {"recommendations": None},
        ]
        for invalid_field_override in invalid_payloads:
            parsed_dict = {
                "match_score": 75,
                "strengths": ["Good skill"],
                "missing_skills": ["Some skill"],
                "gaps": ["Some gap"],
                "recommendations": ["Some rec"],
            }
            parsed_dict.update(invalid_field_override)
            mock_generate.return_value = AIResponse(
                content=str(parsed_dict),
                provider_name="ollama",
                model_name="phi3:latest",
                raw_response={"parsed": parsed_dict},
            )
            payload = {"job_id": str(self.job1.id), "resume_id": str(self.resume1.id)}
            count_before = JobMatchAnalysis.objects.count()
            response = self.client.post("/api/v1/ai/job-match/", payload, format="json")
            self.assertNotEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(JobMatchAnalysis.objects.count(), count_before)

    @patch("ai.orchestrator.orchestrator.AIOrchestrator.generate")
    def test_deterministic_job_match_score_override(self, mock_generate: MagicMock) -> None:
        # Candidate has 0 skills, Job requires Python, Django, AWS, Docker
        mock_generate.return_value = AIResponse(
            content='{"match_score": 95, "strengths": ["Fabricated strength"], "missing_skills": [], "gaps": [], "recommendations": []}',
            provider_name="huggingface",
            model_name="qwen",
            raw_response={
                "parsed": {
                    "match_score": 95,
                    "strengths": ["Fabricated strength"],
                    "missing_skills": [],
                    "gaps": [],
                    "recommendations": [],
                }
            },
        )
        payload = {"job_id": str(self.job1.id), "resume_id": str(self.resume1.id)}
        response = self.client.post("/api/v1/ai/job-match/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Deterministic score 75 wins over AI 95
        self.assertEqual(response.data["data"]["match_score"], 75)
        # Deterministic missing skills win over AI empty list
        self.assertIn("AWS", response.data["data"]["missing_skills"])

    def test_reproducible_job_match_score(self) -> None:
        from apps.jobs.skill_gap import calculate_deterministic_job_match

        res1 = calculate_deterministic_job_match(["Python", "Django"], "Looking for Python, Django, AWS, Docker", "Engineer")
        res2 = calculate_deterministic_job_match(["Python", "Django"], "Looking for Python, Django, AWS, Docker", "Engineer")
        self.assertEqual(res1["baseline_score"], res2["baseline_score"])
        self.assertEqual(res1["baseline_score"], 50)

    def test_job_match_coverage_100_and_0(self) -> None:
        from apps.jobs.skill_gap import calculate_deterministic_job_match

        full_match = calculate_deterministic_job_match(["Python", "Django"], "Python Django Developer", "Dev")
        self.assertEqual(full_match["coverage_percentage"], 100)
        self.assertEqual(full_match["baseline_score"], 100)

        zero_match = calculate_deterministic_job_match([], "Python Django Developer", "Dev")
        self.assertEqual(zero_match["coverage_percentage"], 0)
        self.assertEqual(zero_match["baseline_score"], 0)
