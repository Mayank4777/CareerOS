from __future__ import annotations

import uuid
from typing import Any
from unittest.mock import MagicMock, patch

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from ai.providers import AIResponse
from apps.ai_coach.models import AIHistory
from apps.career_profile.models import CareerProfile
from apps.resumes.models import Resume, ResumeAnalysis
from apps.resumes.quality_signals import evaluate_deterministic_resume_quality_signals, merge_feedback_items


User = get_user_model()


def make_qualitative_response(**kwargs: Any) -> dict[str, Any]:
    """Helper to build raw LLM qualitative evaluation dictionary."""
    payload = {
        "strengths": ["Clear section headers", "Relevant target role keywords"],
        "weaknesses": ["Thin experience details", "Missing measurable outcomes"],
        "recommendations": ["Expand work experience bullets", "Include concrete performance metrics"],
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

    def test_resume_review_success_deterministic_by_default(self) -> None:
        payload = {"resume_id": str(self.resume1.id)}
        response = self.client.post("/api/v1/ai/resume-review/", payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        data = response.data["data"]
        self.assertEqual(data["resume_id"], str(self.resume1.id))
        self.assertTrue(0 <= data["score"] <= 100)
        self.assertNotIn("dimensions", data)  # Verify dimensions NOT exposed
        self.assertTrue(len(data["strengths"]) > 0)
        self.assertTrue(len(data["weaknesses"]) > 0)
        self.assertTrue(len(data["recommendations"]) > 0)

        # Database persistence check
        self.assertEqual(ResumeAnalysis.objects.filter(resume=self.resume1).count(), 1)
        analysis = ResumeAnalysis.objects.get(resume=self.resume1)
        self.assertEqual(analysis.score, data["score"])

        # Verify 0 AIHistory entries created on default deterministic runs
        self.assertEqual(AIHistory.objects.filter(user=self.user1, feature="resume_review").count(), 0)

    @patch("ai.orchestrator.orchestrator.AIOrchestrator.generate")
    def test_resume_review_success_ai_enhanced(self, mock_generate: MagicMock) -> None:
        raw_payload = make_qualitative_response()
        mock_generate.return_value = AIResponse(
            content=str(raw_payload),
            provider_name="huggingface",
            model_name="Qwen/Qwen2.5-7B-Instruct-Turbo",
            raw_response={"parsed": raw_payload},
        )

        payload = {"resume_id": str(self.resume1.id), "enhance_with_ai": True}
        response = self.client.post("/api/v1/ai/resume-review/", payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        data = response.data["data"]
        self.assertEqual(data["resume_id"], str(self.resume1.id))
        self.assertIn("Clear section headers", data["strengths"])

        # Exactly 1 LLM call was executed when explicitly requested
        self.assertEqual(mock_generate.call_count, 1)

        # Verify AIHistory recorded AI provider
        history = AIHistory.objects.filter(user=self.user1, feature="resume_review").latest("created_at")
        self.assertEqual(history.provider, "huggingface")
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
    def test_llm_cannot_override_deterministic_score(self, mock_generate: MagicMock) -> None:
        # LLM attempts to pass top-level "score": 99, but deterministic score wins
        raw_payload = make_qualitative_response(score=99)
        mock_generate.return_value = AIResponse(
            content=str(raw_payload),
            provider_name="huggingface",
            model_name="Qwen/Qwen2.5-7B-Instruct:fastest",
            raw_response={"parsed": raw_payload},
        )
        payload = {"resume_id": str(self.resume1.id)}
        response = self.client.post("/api/v1/ai/resume-review/", payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Score MUST come from deterministic document quality evaluation, ignoring LLM 99
        expected = evaluate_deterministic_resume_quality_signals(self.user1, self.resume1)["completeness_score"]
        self.assertEqual(response.data["data"]["score"], expected)

    @patch("ai.orchestrator.orchestrator.AIOrchestrator.generate")
    def test_dimensions_no_longer_required(self, mock_generate: MagicMock) -> None:
        # Response WITHOUT any 'dimensions' field passes schema validation
        raw_payload = {
            "strengths": ["Strong technical summary"],
            "weaknesses": ["Lacks soft skills presentation"],
            "recommendations": ["Add a soft skills bullet point"],
        }
        mock_generate.return_value = AIResponse(
            content=str(raw_payload),
            provider_name="gemini",
            model_name="gemini-3.5-flash",
            raw_response={"parsed": raw_payload},
        )
        payload = {"resume_id": str(self.resume1.id)}
        response = self.client.post("/api/v1/ai/resume-review/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    @patch("ai.orchestrator.orchestrator.AIOrchestrator.generate")
    def test_deterministic_missing_signals_and_llm_merging_deduplication(self, mock_generate: MagicMock) -> None:
        # Resume 1 is missing phone and linkedin link in content_data
        raw_payload = {
            "strengths": ["Good headline"],
            "weaknesses": [
                "Professional profile links (LinkedIn or GitHub) are missing.",  # Duplicate of deterministic
                "Work experience bullets need more action verbs.",
            ],
            "recommendations": [
                "Add your LinkedIn and GitHub profile links to make your professional work easier to verify.",  # Duplicate
                "Use strong action verbs like Spearheaded, Engineered, and Architected.",
            ],
        }
        mock_generate.return_value = AIResponse(
            content=str(raw_payload),
            provider_name="huggingface",
            model_name="Qwen/Qwen2.5-7B-Instruct:fastest",
            raw_response={"parsed": raw_payload},
        )

        response = self.client.post("/api/v1/ai/resume-review/", {"resume_id": str(self.resume1.id), "enhance_with_ai": True}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data["data"]

        # Deterministic missing signals MUST appear in weaknesses & recommendations
        weaknesses_text = " ".join(data["weaknesses"])
        recommendations_text = " ".join(data["recommendations"])

        self.assertIn("Contact phone number is missing", weaknesses_text)
        self.assertIn("Professional profile links (LinkedIn or GitHub) are missing", weaknesses_text)
        self.assertIn("Add a reachable contact phone number", recommendations_text)

        # Unique LLM feedback preserved
        self.assertIn("Work experience bullets need more action verbs.", data["weaknesses"])

        # No duplicate items in final merged array
        self.assertEqual(len(data["weaknesses"]), len(set(data["weaknesses"])))
        self.assertEqual(len(data["recommendations"]), len(set(data["recommendations"])))

    @patch("ai.orchestrator.orchestrator.AIOrchestrator.generate")
    def test_sparse_resume_cannot_receive_inflated_score(self, mock_generate: MagicMock) -> None:
        weak_resume = Resume.objects.create(
            career_profile=self.profile1,
            title="Empty Sparse Resume",
            target_role="Senior Staff Engineer",
            job_description="Seeking a Senior Staff Engineer.",
            content_data={},
        )

        calibrated_weak_payload = {
            "strengths": ["Basic resume object created"],
            "weaknesses": ["Very sparse resume content"],
            "recommendations": ["Add work experience and contact details"],
        }
        mock_generate.return_value = AIResponse(
            content=str(calibrated_weak_payload),
            provider_name="huggingface",
            model_name="Qwen/Qwen2.5-7B-Instruct:fastest",
            raw_response={"parsed": calibrated_weak_payload},
        )

        payload = {"resume_id": str(weak_resume.id)}
        response = self.client.post("/api/v1/ai/resume-review/", payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data["data"]
        # Score must be very low (<= 15) and NOT inflated by LLM or CareerOS profile
        self.assertTrue(data["score"] <= 15)

    def test_feedback_deduplication_helper(self) -> None:
        det = ["Contact phone number is missing.", "Professional profile links (LinkedIn or GitHub) are missing."]
        llm = [
            "Contact phone number is missing.",  # Exact duplicate
            "Add your LinkedIn profile link.",  # Near duplicate with "linkedin" key term
            "Qualitative improvement: Highlight system architecture experience.",  # Unique LLM item
        ]
        merged = merge_feedback_items(det, llm)
        self.assertEqual(len(merged), 3)
        self.assertEqual(merged[0], "Contact phone number is missing.")
        self.assertEqual(merged[1], "Professional profile links (LinkedIn or GitHub) are missing.")
        self.assertEqual(merged[2], "Qualitative improvement: Highlight system architecture experience.")

    @patch("ai.orchestrator.orchestrator.AIOrchestrator.generate")
    def test_skill_heavy_no_experience_score_capped(self, mock_generate: MagicMock) -> None:
        skill_heavy_resume = Resume.objects.create(
            career_profile=self.profile1,
            title="Skill Dump Resume",
            target_role="Full Stack Dev",
            content_data={
                "sections": [
                    {
                        "title": "Skills",
                        "items": [{"skills": ["Python", "Django", "Flask", "React", "Node.js", "Docker", "AWS", "PostgreSQL", "Git", "JavaScript"]}],
                    }
                ]
            },
        )
        mock_generate.return_value = AIResponse(
            content="{}",
            provider_name="huggingface",
            model_name="Qwen",
            raw_response={"parsed": {"strengths": ["Lots of skills"], "weaknesses": [], "recommendations": []}},
        )
        response = self.client.post("/api/v1/ai/resume-review/", {"resume_id": str(skill_heavy_resume.id)}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Skills capped at 15 pts max; overall score stays low (< 40)
        self.assertTrue(response.data["data"]["score"] < 40)

    @patch("ai.orchestrator.orchestrator.AIOrchestrator.generate")
    def test_llm_cannot_erase_deterministic_weaknesses(self, mock_generate: MagicMock) -> None:
        # LLM returns empty weaknesses and recommendations
        mock_generate.return_value = AIResponse(
            content="{}",
            provider_name="huggingface",
            model_name="Qwen",
            raw_response={"parsed": {"strengths": ["Great presentation"], "weaknesses": [], "recommendations": []}},
        )
        response = self.client.post("/api/v1/ai/resume-review/", {"resume_id": str(self.resume1.id), "enhance_with_ai": True}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data["data"]
        # Deterministic missing signals (phone, contact links) MUST still be present!
        self.assertTrue(len(data["weaknesses"]) >= 1)
        self.assertTrue(len(data["recommendations"]) >= 1)
        self.assertTrue(any("Contact phone number is missing" in w for w in data["weaknesses"]))

    @patch("ai.orchestrator.orchestrator.AIOrchestrator.generate")
    def test_llm_failure_behavior(self, mock_generate: MagicMock) -> None:
        from ai.providers.base import AIProviderError
        mock_generate.side_effect = AIProviderError("Provider unavailable", status_code=503)

        payload = {"resume_id": str(self.resume1.id), "enhance_with_ai": True}
        response = self.client.post("/api/v1/ai/resume-review/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
        # Verify no database analysis record was persisted on error
        self.assertEqual(ResumeAnalysis.objects.filter(resume=self.resume1).count(), 0)

    def test_repeated_requests_idempotency_and_no_duplication(self) -> None:
        """Verifies running deterministic review 5 times yields identical results with zero duplicate items."""
        initial_res = self.client.post("/api/v1/ai/resume-review/", {"resume_id": str(self.resume1.id)}, format="json").data["data"]
        for _ in range(4):
            rep_res = self.client.post("/api/v1/ai/resume-review/", {"resume_id": str(self.resume1.id)}, format="json").data["data"]
            self.assertEqual(rep_res["score"], initial_res["score"])
            self.assertEqual(rep_res["strengths"], initial_res["strengths"])
            self.assertEqual(rep_res["weaknesses"], initial_res["weaknesses"])
            self.assertEqual(rep_res["recommendations"], initial_res["recommendations"])

    # =========================================================================
    # Phase 14 — Deterministic Evidence-Based Quality Score Tests (All 15 Scenarios)
    # =========================================================================

    def test_1_empty_resume_score_range(self) -> None:
        empty_resume = Resume.objects.create(career_profile=self.profile1, title="Empty", content_data={})
        res = evaluate_deterministic_resume_quality_signals(self.user1, empty_resume)
        self.assertTrue(0 <= res["completeness_score"] <= 10)

    def test_2_name_email_only_score_range(self) -> None:
        ne_resume = Resume.objects.create(
            career_profile=self.profile1,
            title="Name Only",
            content_data={"personal_info": {"first_name": "Jane", "last_name": "Doe", "email": "jane@example.com"}},
        )
        res = evaluate_deterministic_resume_quality_signals(self.user1, ne_resume)
        self.assertTrue(0 <= res["completeness_score"] <= 10)

    def test_3_skills_only_resume_score_range(self) -> None:
        skills_resume = Resume.objects.create(
            career_profile=self.profile1,
            title="Skills Only",
            content_data={"sections": [{"title": "Skills", "items": ["Python", "Django", "React"]}]},
        )
        res = evaluate_deterministic_resume_quality_signals(self.user1, skills_resume)
        self.assertTrue(5 <= res["completeness_score"] <= 30)

    def test_4_section_heavy_content_empty_score_range(self) -> None:
        sec_resume = Resume.objects.create(
            career_profile=self.profile1,
            title="Empty Sections",
            content_data={
                "sections": [
                    {"title": "Experience", "items": []},
                    {"title": "Education", "items": []},
                    {"title": "Skills", "items": []},
                ]
            },
        )
        res = evaluate_deterministic_resume_quality_signals(self.user1, sec_resume)
        self.assertTrue(0 <= res["completeness_score"] <= 20)

    def test_5_weak_one_line_experience_scoring(self) -> None:
        weak_exp = Resume.objects.create(
            career_profile=self.profile1,
            title="Weak Exp",
            content_data={
                "sections": [
                    {
                        "title": "Experience",
                        "items": [{"title": "Dev", "company": "Corp", "description": "Did stuff."}],
                    }
                ]
            },
        )
        res = evaluate_deterministic_resume_quality_signals(self.user1, weak_exp)
        self.assertTrue(5 <= res["completeness_score"] <= 30)

    def test_6_strong_experience_with_measurable_achievements_scoring(self) -> None:
        strong_exp = Resume.objects.create(
            career_profile=self.profile1,
            title="Strong Exp",
            target_role="Senior Python Engineer",
            content_data={
                "personal_info": {"phone": "555-0199", "github_url": "https://github.com/alice"},
                "summary": "Experienced Senior Python Engineer with 8+ years building cloud services.",
                "sections": [
                    {
                        "title": "Experience",
                        "items": [
                            {
                                "title": "Senior Python Engineer",
                                "company": "Tech Corp",
                                "description": "Spearheaded distributed backend services.",
                                "bullets": [
                                    "Architected microservices using Python and Flask, reducing response latency by 35%.",
                                    "Engineered PostgreSQL database query optimization, saving $50k in annual cloud costs.",
                                ],
                            }
                        ],
                    }
                ],
            },
        )
        res = evaluate_deterministic_resume_quality_signals(self.user1, strong_exp)
        self.assertTrue(res["completeness_score"] >= 50)

    def test_7_weak_project_scoring(self) -> None:
        weak_proj = Resume.objects.create(
            career_profile=self.profile1,
            title="Weak Proj",
            content_data={"sections": [{"title": "Projects", "items": [{"title": "Site", "description": "Built website."}]}]},
        )
        res = evaluate_deterministic_resume_quality_signals(self.user1, weak_proj)
        self.assertTrue(res["completeness_score"] <= 25)

    def test_8_strong_project_scoring(self) -> None:
        strong_proj = Resume.objects.create(
            career_profile=self.profile1,
            title="Strong Proj",
            content_data={
                "sections": [
                    {
                        "title": "Projects",
                        "items": [
                            {
                                "title": "CareerOS AI Platform",
                                "description": "Full stack career portal featuring AI resume reviews and automated job matching.",
                                "skills": ["Python", "Django", "React", "Docker"],
                                "link": "https://github.com/org/careeros",
                            }
                        ],
                    }
                ]
            },
        )
        res = evaluate_deterministic_resume_quality_signals(self.user1, strong_proj)
        self.assertTrue(res["completeness_score"] >= 12)

    def test_9_skill_dump_non_evidence_scoring(self) -> None:
        dump_resume = Resume.objects.create(
            career_profile=self.profile1,
            title="Skill Dump",
            content_data={
                "sections": [
                    {
                        "title": "Skills",
                        "items": ["Python", "Java", "C++", "Go", "Rust", "TypeScript", "React", "Vue", "AWS", "GCP", "Docker", "Kubernetes"],
                    }
                ]
            },
        )
        res = evaluate_deterministic_resume_quality_signals(self.user1, dump_resume)
        # Capped at 5 pts for unverified skill dump
        self.assertTrue(res["completeness_score"] <= 30)

    def test_10_fake_generic_numbers_scoring(self) -> None:
        generic_num_resume = Resume.objects.create(
            career_profile=self.profile1,
            title="Generic Numbers",
            content_data={
                "sections": [
                    {
                        "title": "Experience",
                        "items": [
                            {
                                "title": "Developer",
                                "company": "Corp",
                                "bullets": ["Worked for 2 years in team of 3."],
                            }
                        ],
                    }
                ]
            },
        )
        res = evaluate_deterministic_resume_quality_signals(self.user1, generic_num_resume)
        # Generic numbers do NOT award 15 pts metric score (awards 3 pts max)
        self.assertEqual(res["metric_bullets_count"], 0)
        self.assertEqual(res["generic_number_bullets_count"], 1)

    def test_11_meaningful_achievement_metrics_scoring(self) -> None:
        metric_resume = Resume.objects.create(
            career_profile=self.profile1,
            title="Meaningful Metrics",
            content_data={
                "sections": [
                    {
                        "title": "Experience",
                        "items": [
                            {
                                "title": "Senior Engineer",
                                "company": "Acme",
                                "bullets": [
                                    "Optimized query performance, reducing latency by 45%.",
                                    "Scaled distributed pipeline to process over 10M events daily.",
                                ],
                            }
                        ],
                    }
                ]
            },
        )
        res = evaluate_deterministic_resume_quality_signals(self.user1, metric_resume)
        self.assertEqual(res["metric_bullets_count"], 2)

    def test_12_strong_complete_resume_scoring_range(self) -> None:
        strong_resume = Resume.objects.create(
            career_profile=self.profile1,
            title="Complete Elite Resume",
            target_role="Senior Full Stack Engineer",
            job_description="Seeking Python and React developer.",
            content_data={
                "personal_info": {"phone": "+1-555-0199", "linkedin_url": "https://linkedin.com/in/alicedev", "github_url": "https://github.com/alicedev"},
                "summary": "Senior Full Stack Engineer with 7+ years of experience engineering distributed systems and modern web applications.",
                "sections": [
                    {
                        "title": "Experience",
                        "items": [
                            {
                                "title": "Senior Staff Engineer",
                                "company": "Acme Systems",
                                "description": "Led backend architecture for high-throughput cloud microservices.",
                                "bullets": [
                                    "Spearheaded redesign of real-time messaging pipeline, reducing server latency by 40%.",
                                    "Engineered automated CI/CD deployment pipelines using Docker and Kubernetes, saving 15 hours weekly.",
                                    "Architected high-availability PostgreSQL database cluster across 3 cloud regions, achieving 99.99% uptime.",
                                ],
                            }
                        ],
                    },
                    {
                        "title": "Projects",
                        "items": [
                            {
                                "title": "CareerOS Intelligence Platform",
                                "description": "Architected end-to-end career management engine in Python, Django, and React.",
                                "skills": ["Python", "Django", "React", "Docker"],
                                "link": "https://github.com/alicedev/careeros",
                            }
                        ],
                    },
                    {
                        "title": "Education",
                        "items": [{"title": "B.S. Computer Science", "company": "MIT"}],
                    },
                    {
                        "title": "Skills",
                        "items": ["Python", "Django", "React", "Docker", "PostgreSQL", "Kubernetes", "Redis", "TypeScript"],
                    },
                ],
            },
        )
        res = evaluate_deterministic_resume_quality_signals(self.user1, strong_resume)
        self.assertTrue(80 <= res["completeness_score"] <= 100)

    def test_13_profile_isolation(self) -> None:
        sparse_resume = Resume.objects.create(career_profile=self.profile1, title="Sparse Profile User", content_data={})
        res = evaluate_deterministic_resume_quality_signals(self.user1, sparse_resume)
        self.assertTrue(res["completeness_score"] <= 10)

    def test_14_reproducibility(self) -> None:
        res1 = evaluate_deterministic_resume_quality_signals(self.user1, self.resume1)
        res2 = evaluate_deterministic_resume_quality_signals(self.user1, self.resume1)
        self.assertEqual(res1["completeness_score"], res2["completeness_score"])

    @patch("ai.orchestrator.orchestrator.AIOrchestrator.generate")
    def test_15_llm_score_override_protection(self, mock_generate: MagicMock) -> None:
        mock_generate.return_value = AIResponse(
            content="{}",
            provider_name="huggingface",
            model_name="Qwen",
            raw_response={"parsed": {"score": 99, "strengths": ["Great"], "weaknesses": [], "recommendations": []}},
        )
        response = self.client.post("/api/v1/ai/resume-review/", {"resume_id": str(self.resume1.id)}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        expected = evaluate_deterministic_resume_quality_signals(self.user1, self.resume1)["completeness_score"]
        self.assertEqual(response.data["data"]["score"], expected)
