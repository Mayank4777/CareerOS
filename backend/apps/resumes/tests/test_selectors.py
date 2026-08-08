from __future__ import annotations

from django.test import TestCase

from apps.accounts.models import User
from apps.career_profile.models import CareerProfile

from ..models import Resume
from ..selectors import get_resume, list_resumes


class ResumeSelectorTests(TestCase):
    def setUp(self) -> None:
        self.user = User.objects.create_user(email="selector@example.com", password="strong-password")
        self.other_user = User.objects.create_user(email="other@example.com", password="strong-password")
        self.profile = CareerProfile.objects.create(user=self.user)
        self.other_profile = CareerProfile.objects.create(user=self.other_user)
        self.resume = Resume.objects.create(
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

    def test_list_resumes_returns_only_owner_records(self) -> None:
        records = list_resumes(user=self.user)

        self.assertEqual(records.count(), 1)
        self.assertEqual(records.first(), self.resume)

    def test_get_resume_returns_owner_record(self) -> None:
        record = get_resume(user=self.user, resume_id=self.resume.id)

        self.assertEqual(record, self.resume)

    def test_get_resume_returns_none_for_other_users_record(self) -> None:
        record = get_resume(user=self.user, resume_id=self.other_profile.resumes.first().id)

        self.assertIsNone(record)

