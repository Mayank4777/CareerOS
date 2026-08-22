from __future__ import annotations

from django.test import TestCase
from rest_framework.exceptions import NotFound

from apps.accounts.models import User
from apps.career_profile.models import CareerProfile

from ..models import Resume
from ..services import ResumeService


class ResumeServiceTests(TestCase):
    def setUp(self) -> None:
        self.service = ResumeService()
        self.user = User.objects.create_user(email="service@example.com", password="strong-password")
        self.other_user = User.objects.create_user(email="other@example.com", password="strong-password")
        self.profile = CareerProfile.objects.create(user=self.user)
        self.other_profile = CareerProfile.objects.create(user=self.other_user)

    def test_create_resume(self) -> None:
        resume = self.service.create_resume(
            user=self.user,
            data={
                "title": "Backend Resume",
                "template": "Minimal",
                "status": "draft",
            },
        )

        self.assertIsInstance(resume, Resume)
        self.assertEqual(resume.career_profile, self.profile)

    def test_list_resumes_returns_owner_records(self) -> None:
        own_resume = Resume.objects.create(
            career_profile=self.profile,
            title="Backend Resume",
            template="Minimal",
            status="draft",
        )
        Resume.objects.create(
            career_profile=self.other_profile,
            title="Product Resume",
            template="Classic",
            status="approved",
        )

        records = self.service.list_resumes(user=self.user)

        self.assertEqual(records.count(), 1)
        self.assertEqual(records.first(), own_resume)

    def test_retrieve_resume(self) -> None:
        resume = Resume.objects.create(
            career_profile=self.profile,
            title="Backend Resume",
            template="Minimal",
            status="draft",
        )

        fetched = self.service.retrieve_resume(user=self.user, resume_id=resume.id)

        self.assertEqual(fetched, resume)

    def test_update_resume(self) -> None:
        resume = Resume.objects.create(
            career_profile=self.profile,
            title="Backend Resume",
            template="Minimal",
            status="draft",
        )

        updated = self.service.update_resume(
            user=self.user,
            resume_id=resume.id,
            data={"title": "Senior Backend Resume", "status": "approved"},
        )

        self.assertEqual(updated.title, "Senior Backend Resume")
        self.assertEqual(updated.status, "approved")

    def test_delete_resume(self) -> None:
        resume = Resume.objects.create(
            career_profile=self.profile,
            title="Backend Resume",
            template="Minimal",
            status="draft",
        )

        self.service.delete_resume(user=self.user, resume_id=resume.id)

        self.assertFalse(Resume.objects.filter(id=resume.id).exists())

    def test_missing_resume_raises_not_found(self) -> None:
        with self.assertRaises(NotFound):
            self.service.retrieve_resume(user=self.user, resume_id="00000000-0000-0000-0000-000000000000")

