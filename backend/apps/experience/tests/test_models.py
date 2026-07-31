from __future__ import annotations

from datetime import date

from django.test import TestCase
from django.utils import timezone

from apps.accounts.models import User
from apps.career_profile.models import CareerProfile

from ..models import Experience


class ExperienceModelTests(TestCase):
    def setUp(self) -> None:
        self.user = User.objects.create_user(email="experience@example.com", password="strong-password")
        self.profile = CareerProfile.objects.create(user=self.user)

    def test_string_representation_uses_designation_and_company(self) -> None:
        experience = Experience.objects.create(
            career_profile=self.profile,
            designation="Software Engineer",
            employment_type="full_time",
            company="Example Inc",
            location="Remote",
            location_type="remote",
            start_date=date(2022, 1, 1),
            end_date=date(2024, 1, 1),
            currently_working=False,
            description="Built APIs",
        )

        self.assertEqual(str(experience), "Software Engineer at Example Inc")

    def test_experience_belongs_to_career_profile(self) -> None:
        Experience.objects.create(
            career_profile=self.profile,
            designation="Software Engineer",
            employment_type="full_time",
            company="Example Inc",
            location="Remote",
            location_type="remote",
            start_date=date(2022, 1, 1),
            end_date=date(2024, 1, 1),
            currently_working=False,
            description="Built APIs",
        )

        self.assertEqual(self.profile.experiences.count(), 1)

    def test_audit_timestamps_are_populated(self) -> None:
        experience = Experience.objects.create(
            career_profile=self.profile,
            designation="Software Engineer",
            employment_type="full_time",
            company="Example Inc",
            location="Remote",
            location_type="remote",
            start_date=date(2022, 1, 1),
            end_date=date(2024, 1, 1),
            currently_working=False,
            description="Built APIs",
        )

        self.assertIsNotNone(experience.created_at)
        self.assertIsNotNone(experience.updated_at)
        self.assertLessEqual(experience.created_at, timezone.now())
        self.assertLessEqual(experience.updated_at, timezone.now())
