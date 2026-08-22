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
    def test_deterministic_skill_gap_analysis_success_and_zero_llm_calls(self, mock_generate: MagicMock) -> None:
        # Add project tech stack for Docker to produce partial evidence
        from apps.projects.models import Project
        Project.objects.create(
            career_profile=self.profile1,
            title="Microservice Containerizer",
            description="Containerized Python backend services.",
            technologies="Docker, Python, PostgreSQL",
        )

        payload = {"job_id": str(self.job1.id)}
        response = self.client.post("/api/v1/ai/skill-gap/", payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        data = response.data["data"]

        self.assertEqual(data["job_id"], str(self.job1.id))
        self.assertIn("Python", data["matched_skills"])
        self.assertIn("Django", data["matched_skills"])

        # Docker had project tech evidence -> partial or matched
        partial_skill_names = [item["skill"] for item in data["partial_skills"]]
        missing_skill_names = [item["skill"] for item in data["missing_skills"]]

        self.assertIn("AWS", missing_skill_names)
        self.assertIn("Docker", data["matched_skills"] + partial_skill_names)

        # Assert AIOrchestrator was NEVER invoked! Zero LLM calls!
        mock_generate.assert_not_called()

        # Database persistence check
        analysis = SkillGapAnalysis.objects.get(job=self.job1)
        self.assertEqual(analysis.career_profile, self.profile1)
        self.assertEqual(analysis.matched_skills, data["matched_skills"])

    def test_evidence_scoring_project_and_experience_evidence(self) -> None:
        from apps.projects.models import Project
        from apps.experience.models import Experience
        from datetime import date

        # Profile 2 has Java requirement
        Project.objects.create(
            career_profile=self.profile2,
            title="Spring Boot API",
            description="Built microservices.",
            technologies="Spring Boot, Java",
        )
        Experience.objects.create(
            career_profile=self.profile2,
            designation="Backend Engineer",
            company="Enterprise Co",
            location="Remote",
            location_type="remote",
            employment_type="full_time",
            start_date=date(2022, 1, 1),
            currently_working=True,
            description="Wrote scalable Java applications.",
        )

        self.client.force_authenticate(user=self.user2)
        payload = {"job_id": str(self.job2.id)}
        response = self.client.post("/api/v1/ai/skill-gap/", payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data["data"]

        # Java and Spring Boot have project (+30) + experience (+20) = 50 -> Matched!
        self.assertIn("Java", data["matched_skills"])
        self.assertIn("Spring Boot", data["matched_skills"])

    def test_work_experience_description_evidence_and_exclusivity(self) -> None:
        from apps.experience.models import Experience
        from datetime import date

        user3 = User.objects.create_user(email="user3_exp@example.com", password="Password123!")
        profile3 = CareerProfile.objects.create(user=user3, first_name="Charlie", last_name="Dev")
        Skill.objects.create(career_profile=profile3, name="Python", category="Backend", proficiency_level="expert")

        Experience.objects.create(
            career_profile=profile3,
            designation="Software Engineer",
            company="DataCorp",
            location="New York",
            location_type="onsite",
            employment_type="full_time",
            start_date=date(2021, 5, 1),
            currently_working=True,
            description="Developed backend services using PostgreSQL and optimized PostgreSQL queries.",
        )

        job3 = SavedJob.objects.create(
            career_profile=profile3,
            title="Python Backend Developer",
            company="Fintech Inc",
            description="Looking for Python and PostgreSQL expertise.",
        )

        self.client.force_authenticate(user=user3)
        response = self.client.post("/api/v1/ai/skill-gap/", {"job_id": str(job3.id)}, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Deterministic skill gap analysis complete.")
        data = response.data["data"]

        matched = data["matched_skills"]
        partial = [item["skill"] for item in data["partial_skills"]]
        missing = [item["skill"] for item in data["missing_skills"]]

        # 1. Python -> MATCHED
        self.assertIn("Python", matched)
        self.assertNotIn("Python", partial)
        self.assertNotIn("Python", missing)

        # 2. PostgreSQL -> PARTIAL
        self.assertIn("PostgreSQL", partial)
        self.assertNotIn("PostgreSQL", matched)
        self.assertNotIn("PostgreSQL", missing)

        # 3. Reason text clearly attributes to work experience
        partial_item = next(item for item in data["partial_skills"] if item["skill"] == "PostgreSQL")
        self.assertIn("Software Engineer at DataCorp", partial_item["reason"])
        self.assertNotIn("No direct evidence", partial_item["reason"])

        # 4. Classification Exclusivity: Every skill must exist in ONLY ONE category
        set_matched = set(matched)
        set_partial = set(partial)
        set_missing = set(missing)

        self.assertTrue(set_matched.isdisjoint(set_partial))
        self.assertTrue(set_matched.isdisjoint(set_missing))
        self.assertTrue(set_partial.isdisjoint(set_missing))

    def test_reproducibility_and_performance(self) -> None:
        import time

        start_time = time.time()
        payload = {"job_id": str(self.job1.id)}
        response1 = self.client.post("/api/v1/ai/skill-gap/", payload, format="json")
        duration = time.time() - start_time

        self.assertEqual(response1.status_code, status.HTTP_200_OK)
        # Latency must be extremely low (< 200ms in unit test environment)
        self.assertLess(duration, 0.5)

        response2 = self.client.post("/api/v1/ai/skill-gap/", payload, format="json")
        self.assertEqual(response2.status_code, status.HTTP_200_OK)

        # Reproducibility check: exact payload match across executions
        self.assertEqual(response1.data["data"]["matched_skills"], response2.data["data"]["matched_skills"])
        self.assertEqual(response1.data["data"]["missing_skills"], response2.data["data"]["missing_skills"])
        self.assertEqual(response1.data["data"]["partial_skills"], response2.data["data"]["partial_skills"])
        self.assertEqual(response1.data["data"]["recommendations"], response2.data["data"]["recommendations"])

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
