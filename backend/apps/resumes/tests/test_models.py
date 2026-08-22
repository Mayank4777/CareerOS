from __future__ import annotations

from django.test import TestCase
from django.utils import timezone

from apps.accounts.models import User
from apps.career_profile.models import CareerProfile

from ..models import Resume, ResumeAnalysis, ResumeStatus


class ResumeModelTests(TestCase):
    def setUp(self) -> None:
        self.user = User.objects.create_user(email="resume@example.com", password="strong-password")
        self.profile = CareerProfile.objects.create(user=self.user)

    def test_string_representation_uses_title(self) -> None:
        resume = Resume.objects.create(career_profile=self.profile, title="Backend Resume")

        self.assertEqual(str(resume), "Backend Resume")

    def test_resume_belongs_to_career_profile(self) -> None:
        Resume.objects.create(career_profile=self.profile, title="Backend Resume")

        self.assertEqual(self.profile.resumes.count(), 1)

    def test_audit_timestamps_are_populated(self) -> None:
        resume = Resume.objects.create(career_profile=self.profile, title="Backend Resume")

        self.assertIsNotNone(resume.created_at)
        self.assertIsNotNone(resume.updated_at)
        self.assertLessEqual(resume.created_at, timezone.now())
        self.assertLessEqual(resume.updated_at, timezone.now())

    def test_default_status_is_draft(self) -> None:
        resume = Resume.objects.create(career_profile=self.profile, title="Backend Resume")

        self.assertEqual(resume.status, ResumeStatus.DRAFT)

    def test_create_resume_analysis(self) -> None:
        resume = Resume.objects.create(career_profile=self.profile, title="Backend Resume")
        analysis = ResumeAnalysis.objects.create(
            resume=resume,
            score=85,
            strengths=["Clear summary", "Good skill list"],
            weaknesses=["Missing metrics in bullet points"],
            recommendations=["Add quantitative results"],
        )
        self.assertEqual(resume.analyses.count(), 1)
        self.assertEqual(analysis.score, 85)
        self.assertIn("Clear summary", analysis.strengths)
        self.assertTrue(str(analysis).startswith("Analysis for Backend Resume"))


