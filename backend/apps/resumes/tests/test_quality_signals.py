from __future__ import annotations

from django.contrib.auth import get_user_model
from django.test import TestCase

from apps.career_profile.models import CareerProfile
from apps.resumes.models import Resume
from apps.resumes.quality_signals import evaluate_deterministic_resume_quality_signals

User = get_user_model()


class ResumeQualitySignalsTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="signal_user@example.com",
            password="Password123!",
        )
        self.profile = CareerProfile.objects.create(
            user=self.user,
            first_name="Jane",
            last_name="Developer",
            phone="555-0199",
            linkedin_url="https://linkedin.com/in/janedev",
        )
        self.resume = Resume.objects.create(
            career_profile=self.profile,
            title="Senior Developer Resume",
            target_role="Lead Software Engineer",
            job_description="Looking for Python and React lead.",
            content_data={
                "summary": "Experienced Lead Engineer with 6+ years in full-stack web applications.",
                "sections": [
                    {
                        "title": "Work Experience",
                        "items": [
                            {
                                "title": "Senior Engineer",
                                "company": "Tech Corp",
                                "bullets": [
                                    "Engineered high-performance REST APIs improving throughput by 40%.",
                                    "Architected microservices using Python, Django, and Docker.",
                                ],
                            }
                        ],
                    }
                ],
            },
        )

    def test_quality_signals_evaluation(self):
        signals = evaluate_deterministic_resume_quality_signals(self.user, self.resume)

        self.assertTrue(signals["has_phone"])
        self.assertTrue(signals["has_linkedin"])
        self.assertTrue(signals["has_summary"])
        self.assertTrue(signals["has_target_role"])
        self.assertEqual(signals["experience_count"], 1)
        self.assertEqual(signals["total_bullets"], 2)
        self.assertEqual(signals["metric_bullets_count"], 1)
        self.assertTrue(signals["action_verbs_count"] >= 2)
        self.assertTrue(0 <= signals["completeness_score"] <= 100)

    def test_empty_resume_score(self):
        empty_resume = Resume.objects.create(career_profile=self.profile, title="Empty Resume", content_data={})
        signals = evaluate_deterministic_resume_quality_signals(self.user, empty_resume)
        self.assertTrue(signals["completeness_score"] <= 10)

    def test_skill_heavy_without_experience(self):
        skill_resume = Resume.objects.create(
            career_profile=self.profile,
            title="Skill Dump",
            content_data={
                "sections": [
                    {
                        "title": "Skills",
                        "items": [{"skills": ["Python", "Django", "React", "Docker", "AWS", "SQL", "Git", "Redis"]}],
                    }
                ]
            },
        )
        signals = evaluate_deterministic_resume_quality_signals(self.user, skill_resume)
        # Skills are capped at 15 pts max; lack of experience/education keeps score low (< 40)
        self.assertTrue(signals["completeness_score"] < 40)

    def test_profile_context_does_not_inflate_resume_score(self) -> None:
        from apps.skills.models import Skill
        Skill.objects.create(career_profile=self.profile, name="Kubernetes", proficiency_level="expert")
        Skill.objects.create(career_profile=self.profile, name="Kafka", proficiency_level="expert")

        sparse_resume = Resume.objects.create(career_profile=self.profile, title="Sparse", content_data={})
        signals = evaluate_deterministic_resume_quality_signals(self.user, sparse_resume)
        # Profile skills must NOT inflate the resume score
        self.assertTrue(signals["completeness_score"] <= 10)

    def test_reproducible_resume_score(self) -> None:
        sig1 = evaluate_deterministic_resume_quality_signals(self.user, self.resume)
        sig2 = evaluate_deterministic_resume_quality_signals(self.user, self.resume)
        self.assertEqual(sig1["completeness_score"], sig2["completeness_score"])

