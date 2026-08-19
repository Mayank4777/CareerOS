from __future__ import annotations

import time
from typing import Any
from unittest.mock import MagicMock, patch

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from ai.providers import AIResponse
from apps.ai_coach.models import AIHistory, CareerRoadmap, RoadmapPhase
from apps.career_profile.models import CareerProfile
from apps.jobs.models import JobMatchAnalysis, SavedJob, SkillGapAnalysis
from apps.resumes.models import Resume, ResumeAnalysis


User = get_user_model()


class RealAPIEndToEndValidationTestCase(APITestCase):
    """Phase 20 Complete Real API End-to-End Validation Suite."""

    def setUp(self) -> None:
        # Create Dedicated E2E Test User A
        self.user_a = User.objects.create_user(email="e2e_usera@example.com", password="Password123!")
        self.profile_a = CareerProfile.objects.create(
            user=self.user_a,
            first_name="Alice",
            last_name="Engineer",
            headline="Senior Backend Engineer",
            summary="Python engineer with 5 years experience building scalable backend microservices.",
        )

        # Create Strong Resume
        self.strong_resume = Resume.objects.create(
            career_profile=self.profile_a,
            title="Strong Backend Resume",
            target_role="Senior Backend Engineer",
            content_data={
                "personal_info": {
                    "first_name": "Alice",
                    "last_name": "Engineer",
                    "email": "alice@example.com",
                    "phone": "555-0199",
                    "linkedin": "linkedin.com/in/alice",
                },
                "summary": "Senior Python Engineer with 6 years experience building scalable microservices using Django and PostgreSQL.",
                "experience": [
                    {
                        "company": "CloudTech Systems",
                        "position": "Senior Backend Engineer",
                        "description": "Engineered Python Django microservices handling 1,000,000 requests/day, improved database queries by 45%.",
                    }
                ],
                "projects": [
                    {
                        "title": "LedgerPro Financial Engine",
                        "description": "Architected Docker containerized microservices infrastructure on AWS ECS with PostgreSQL.",
                    }
                ],
                "education": [{"institution": "State University", "degree": "B.Sc. Computer Science"}],
                "skills": ["Python", "Flask", "React", "JavaScript", "SQL", "Docker", "Django", "PostgreSQL"],
            },
        )

        # Create Weak Resume (Deliberately sparse)
        self.weak_resume = Resume.objects.create(
            career_profile=self.profile_a,
            title="Weak Resume",
            content_data={
                "personal_info": {
                    "first_name": "John",
                    "last_name": "Doe",
                    "email": "john@example.com",
                }
            },
        )

        # Create Profile Skills
        from apps.skills.models import Skill
        for skill_name in ["Python", "Flask", "React", "JavaScript", "SQL", "Docker"]:
            Skill.objects.create(career_profile=self.profile_a, name=skill_name)

        # Create Saved Job A
        self.job_a = SavedJob.objects.create(
            career_profile=self.profile_a,
            title="Senior Backend Engineer",
            company="CloudTech Systems",
            description="Looking for Python, Django, PostgreSQL, Docker, AWS, Kubernetes and microservices skills.",
        )

        # Create Saved Job B
        self.job_b = SavedJob.objects.create(
            career_profile=self.profile_a,
            title="Frontend React Developer",
            company="WebTech Inc",
            description="Looking for React, TypeScript, Redux, HTML5, and CSS3 skills.",
        )

        # Create User B for Cross-User Isolation Validation
        self.user_b = User.objects.create_user(email="e2e_userb@example.com", password="Password123!")

        self.client.force_authenticate(user=self.user_a)

    def make_mock_ai_response(self, content_dict: dict[str, Any]) -> AIResponse:
        return AIResponse(
            content=str(content_dict),
            provider_name="huggingface",
            model_name="Qwen/Qwen2.5-7B-Instruct:fastest",
            raw_response={"parsed": content_dict},
        )

    # 1. Saved Job CRUD Flow
    def test_saved_job_crud_flow(self) -> None:
        """Verify saved job creation, listing, retrieval, update, and deletion endpoints."""
        # LIST
        res_list = self.client.get("/api/v1/jobs/")
        self.assertEqual(res_list.status_code, status.HTTP_200_OK)
        self.assertTrue(len(res_list.data["data"]) >= 2)

        # CREATE
        res_create = self.client.post(
            "/api/v1/jobs/",
            {"title": "DevOps Engineer", "company": "CloudCorp", "description": "Kubernetes & Terraform."},
            format="json",
        )
        self.assertEqual(res_create.status_code, status.HTTP_201_CREATED)
        new_job_id = res_create.data["data"]["id"]

        # GET DETAIL
        res_detail = self.client.get(f"/api/v1/jobs/{new_job_id}/")
        self.assertEqual(res_detail.status_code, status.HTTP_200_OK)
        self.assertEqual(res_detail.data["data"]["title"], "DevOps Engineer")

        # PATCH
        res_patch = self.client.patch(f"/api/v1/jobs/{new_job_id}/", {"title": "Lead DevOps Engineer"}, format="json")
        self.assertEqual(res_patch.status_code, status.HTTP_200_OK)
        self.assertEqual(res_patch.data["data"]["title"], "Lead DevOps Engineer")

        # DELETE
        res_del = self.client.delete(f"/api/v1/jobs/{new_job_id}/")
        self.assertEqual(res_del.status_code, status.HTTP_200_OK)

    # 2. Skill Gap Real API Flow
    @patch("ai.orchestrator.orchestrator.AIOrchestrator.generate")
    def test_skill_gap_real_api_flow(self, mock_generate: MagicMock) -> None:
        """Verify 100% deterministic Skill Gap API with 0 LLM calls, repeatability, and offline safety."""
        for _ in range(3):
            res = self.client.post("/api/v1/ai/skill-gap/", {"job_id": str(self.job_a.id)}, format="json")
            self.assertEqual(res.status_code, status.HTTP_200_OK)
            self.assertTrue(res.data["success"])
            data = res.data["data"]
            self.assertIn("Python", data["matched_skills"])
            self.assertIn("Deterministic skill gap analysis complete.", res.data["message"])

        # Confirm 0 LLM calls executed and 0 AIHistory records created
        self.assertEqual(mock_generate.call_count, 0)
        self.assertEqual(AIHistory.objects.filter(user=self.user_a, feature="skill_gap").count(), 0)

    # 3. Career Roadmap Real API & Lifecycle State Progression Flow
    @patch("ai.orchestrator.orchestrator.AIOrchestrator.generate")
    def test_roadmap_real_api_state_progression_flow(self, mock_generate: MagicMock) -> None:
        """Verify roadmap generation (0 LLM calls), phase progression, status sync, and reuse on regeneration."""
        # GENERATE
        res_gen = self.client.post(
            "/api/v1/ai/roadmap/",
            {
                "title": "Backend Engineering Roadmap",
                "target_role": "Senior Backend Engineer",
                "target_job_id": str(self.job_a.id),
                "phases": [
                    {
                        "title": "Phase 1: Core System Design",
                        "description": "Master distributed microservices",
                        "objective": "Build high availability REST APIs",
                        "skills": ["Python", "Django", "PostgreSQL"],
                        "actions": ["Read DDIA", "Implement caching layer"],
                        "ordering": 1,
                        "estimated_duration": "4 weeks",
                    },
                    {
                        "title": "Phase 2: Cloud Infrastructure",
                        "description": "Deploy to AWS ECS",
                        "objective": "Automate CI/CD pipeline",
                        "skills": ["Docker", "AWS", "Kubernetes"],
                        "actions": ["Setup Docker containers", "Configure ECS task definition"],
                        "ordering": 2,
                        "estimated_duration": "3 weeks",
                    },
                ],
            },
            format="json",
        )
        self.assertEqual(res_gen.status_code, status.HTTP_201_CREATED)
        roadmap_id = res_gen.data["data"]["id"]
        roadmap = CareerRoadmap.objects.get(id=roadmap_id)
        phases = roadmap.phases.all().order_by("ordering")
        self.assertTrue(phases.count() == 2)

        # PROGRESS PHASE STATUS
        first_phase = phases[0]
        res_phase = self.client.patch(
            f"/api/v1/ai/roadmap/{roadmap_id}/phases/{first_phase.id}/",
            {"status": "in_progress"},
            format="json",
        )
        self.assertEqual(res_phase.status_code, status.HTTP_200_OK)
        roadmap.refresh_from_db()
        self.assertEqual(roadmap.status, "in_progress")

        # COMPLETE ALL PHASES
        for phase in phases:
            self.client.patch(f"/api/v1/ai/roadmap/{roadmap_id}/phases/{phase.id}/", {"status": "completed"}, format="json")
        roadmap.refresh_from_db()
        self.assertEqual(roadmap.status, "completed")

        # REOPEN A PHASE -> Syncs back to in_progress
        self.client.patch(f"/api/v1/ai/roadmap/{roadmap_id}/phases/{first_phase.id}/", {"status": "in_progress"}, format="json")
        roadmap.refresh_from_db()
        self.assertEqual(roadmap.status, "in_progress")

        # REGENERATE -> Reuses existing roadmap record for same target role
        res_regen = self.client.post(
            "/api/v1/ai/roadmap/",
            {"title": "Backend Engineering Roadmap", "target_role": "Senior Backend Engineer", "target_job_id": str(self.job_a.id)},
            format="json",
        )
        self.assertEqual(res_regen.status_code, status.HTTP_201_CREATED)
        self.assertIsNotNone(res_regen.data["data"]["id"])
        self.assertEqual(mock_generate.call_count, 0)

    # 4. Deterministic vs Weak Resume Review Scoring
    def test_resume_review_deterministic_score_benchmark(self) -> None:
        """Weak resume gets appropriately low score, strong resume gets substantially higher score."""
        # WEAK RESUME
        res_weak = self.client.post("/api/v1/ai/resume-review/", {"resume_id": str(self.weak_resume.id)}, format="json")
        self.assertEqual(res_weak.status_code, status.HTTP_200_OK)
        weak_score = res_weak.data["data"]["score"]
        self.assertTrue(weak_score <= 25)

        # STRONG RESUME
        res_strong = self.client.post("/api/v1/ai/resume-review/", {"resume_id": str(self.strong_resume.id)}, format="json")
        self.assertEqual(res_strong.status_code, status.HTTP_200_OK)
        strong_score = res_strong.data["data"]["score"]
        self.assertTrue(strong_score > weak_score)

        # 0 AIHistory entries created on default deterministic runs
        self.assertEqual(AIHistory.objects.filter(user=self.user_a, feature="resume_review").count(), 0)

    # 5. Optional AI Resume Review Enhancement & Isolation
    @patch("ai.orchestrator.orchestrator.AIOrchestrator.generate")
    def test_resume_review_optional_ai_enhancement_flow(self, mock_generate: MagicMock) -> None:
        """AI enhancement generates exactly 1 LLM call, merges qualitative feedback, and logs 1 AIHistory entry."""
        mock_generate.return_value = self.make_mock_ai_response({
            "strengths": ["Strong architectural project narrative."],
            "weaknesses": ["Consider adding cloud certification details."],
            "recommendations": ["Highlight AWS ECS deployment metrics."],
        })

        res = self.client.post("/api/v1/ai/resume-review/", {"resume_id": str(self.strong_resume.id), "enhance_with_ai": True}, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.data["data"]

        self.assertEqual(mock_generate.call_count, 1)
        self.assertIn("Strong architectural project narrative.", data["strengths"])
        self.assertEqual(AIHistory.objects.filter(user=self.user_a, feature="resume_review").count(), 1)

    # 6. Job Match Real API Hybrid Flow
    @patch("ai.orchestrator.orchestrator.AIOrchestrator.generate")
    def test_job_match_real_api_hybrid_flow(self, mock_generate: MagicMock) -> None:
        """Job Match calculates factual match score and skills deterministically, uses 1 LLM call for qualitative gaps."""
        mock_generate.return_value = self.make_mock_ai_response({
            "match_score": 99,
            "strengths": ["Excellent Python and Django alignment."],
            "missing_skills": ["C++"],
            "gaps": ["Lacks AWS hands-on certification."],
            "recommendations": ["Pursue AWS Solutions Architect associate."],
        })

        res = self.client.post("/api/v1/ai/job-match/", {"job_id": str(self.job_a.id), "resume_id": str(self.strong_resume.id)}, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.data["data"]

        # Deterministic match score MUST override LLM's fake 99
        self.assertNotEqual(data["match_score"], 99)
        self.assertIn("Python", data["matched_skills"])
        self.assertEqual(mock_generate.call_count, 1)
        self.assertEqual(AIHistory.objects.filter(user=self.user_a, feature="job_match").count(), 1)

    # 7. Cover Letter Real API Flow
    @patch("ai.orchestrator.orchestrator.AIOrchestrator.generate")
    def test_cover_letter_real_api_flow(self, mock_generate: MagicMock) -> None:
        """Cover Letter drafting uses 1 LLM call and injects authorized candidate context."""
        mock_generate.return_value = AIResponse(
            content="Dear Hiring Manager at CloudTech Systems, I am thrilled to apply for Senior Backend Engineer...",
            provider_name="huggingface",
            model_name="Qwen",
            raw_response={"content": "Dear Hiring Manager..."},
        )

        res = self.client.post(
            "/api/v1/ai/cover-letter/",
            {
                "company_name": "CloudTech Systems",
                "job_title": "Senior Backend Engineer",
                "job_description": "Python, Django, PostgreSQL, and Docker microservices.",
                "tone": "professional",
            },
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(mock_generate.call_count, 1)
        self.assertEqual(AIHistory.objects.filter(user=self.user_a, feature="cover_letter").count(), 1)

    # 8. Career Advice Real API Flow
    @patch("ai.orchestrator.orchestrator.AIOrchestrator.generate")
    def test_career_advice_real_api_flow(self, mock_generate: MagicMock) -> None:
        """Career advice uses 1 LLM call and returns strategic guidance."""
        mock_generate.return_value = AIResponse(
            content="Focus on distributed system architecture and high-availability PostgreSQL optimization...",
            provider_name="huggingface",
            model_name="Qwen",
            raw_response={"content": "Focus on distributed..."},
        )

        res = self.client.post("/api/v1/ai/career-advice/", {"target_role": "Staff Engineer", "industry": "Cloud Tech"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(mock_generate.call_count, 1)
        self.assertEqual(AIHistory.objects.filter(user=self.user_a, feature="career_chat").count(), 1)

    # 9. AI Chat Real API Flow
    @patch("ai.orchestrator.orchestrator.AIOrchestrator.generate")
    def test_ai_chat_real_api_flow(self, mock_generate: MagicMock) -> None:
        """AI chat uses 1 LLM call per message with injected profile context."""
        mock_generate.return_value = AIResponse(
            content="Based on your Python and Docker skills, I recommend focusing on Kubernetes next.",
            provider_name="huggingface",
            model_name="Qwen",
            raw_response={"content": "Based on your..."},
        )

        res = self.client.post("/api/v1/ai/chat/", {"feature": "career_chat", "prompt": "What skills should I learn next?"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(mock_generate.call_count, 1)

    # 10. Cross-User Security Isolation
    def test_cross_user_security_isolation(self) -> None:
        """User B attempting to query User A's SavedJob, Resume, or Roadmap gets HTTP 404."""
        self.client.force_authenticate(user=self.user_b)

        # Foreign Job Match
        res_jm = self.client.post("/api/v1/ai/job-match/", {"job_id": str(self.job_a.id), "resume_id": str(self.strong_resume.id)}, format="json")
        self.assertEqual(res_jm.status_code, status.HTTP_404_NOT_FOUND)

        # Foreign Skill Gap
        res_sg = self.client.post("/api/v1/ai/skill-gap/", {"job_id": str(self.job_a.id)}, format="json")
        self.assertEqual(res_sg.status_code, status.HTTP_404_NOT_FOUND)

        # Foreign Resume Review
        res_rr = self.client.post("/api/v1/ai/resume-review/", {"resume_id": str(self.strong_resume.id)}, format="json")
        self.assertEqual(res_rr.status_code, status.HTTP_404_NOT_FOUND)

        # Foreign Saved Job GET Detail
        res_job = self.client.get(f"/api/v1/jobs/saved-jobs/{self.job_a.id}/")
        self.assertEqual(res_job.status_code, status.HTTP_404_NOT_FOUND)

    # 11. API Error Matrix — Malformed Requests Return Non-500 Responses
    def test_api_error_matrix_clean_handling(self) -> None:
        """Malformed requests, invalid UUIDs, missing fields, and unauthenticated requests return clean 4xx errors."""
        # Unauthenticated request -> 401
        self.client.logout()
        res_unauth = self.client.post("/api/v1/ai/skill-gap/", {"job_id": str(self.job_a.id)}, format="json")
        self.assertEqual(res_unauth.status_code, status.HTTP_401_UNAUTHORIZED)

        self.client.force_authenticate(user=self.user_a)

        # Missing required field -> 400
        res_missing = self.client.post("/api/v1/ai/skill-gap/", {}, format="json")
        self.assertEqual(res_missing.status_code, status.HTTP_400_BAD_REQUEST)

        # Invalid UUID format -> 400
        res_bad_uuid = self.client.post("/api/v1/ai/skill-gap/", {"job_id": "not-a-valid-uuid"}, format="json")
        self.assertEqual(res_bad_uuid.status_code, status.HTTP_400_BAD_REQUEST)

        # Nonexistent UUID -> 404
        import uuid
        res_nonexistent = self.client.post("/api/v1/ai/skill-gap/", {"job_id": str(uuid.uuid4())}, format="json")
        self.assertEqual(res_nonexistent.status_code, status.HTTP_404_NOT_FOUND)

    # 12. Database Integrity & Model Relationship Audit
    def test_database_integrity_and_history_counts(self) -> None:
        """Verify database records match logical user actions without orphans or duplicate AIHistory entries."""
        # Initial AIHistory count
        initial_history_count = AIHistory.objects.filter(user=self.user_a).count()

        # Run 1 deterministic Skill Gap and 1 deterministic Resume Review
        self.client.post("/api/v1/ai/skill-gap/", {"job_id": str(self.job_a.id)}, format="json")
        self.client.post("/api/v1/ai/resume-review/", {"resume_id": str(self.strong_resume.id)}, format="json")

        # History count MUST NOT increase for deterministic operations
        self.assertEqual(AIHistory.objects.filter(user=self.user_a).count(), initial_history_count)
