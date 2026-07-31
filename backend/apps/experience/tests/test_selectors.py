from __future__ import annotations

from datetime import date

from django.test import TestCase

from apps.accounts.models import User
from apps.career_profile.models import CareerProfile

from ..models import Experience
from ..selectors import get_experience, list_experiences


class ExperienceSelectorTests(TestCase):
    def setUp(self) -> None:
        self.user = User.objects.create_user(email="selector@example.com", password="strong-password")
        self.other_user = User.objects.create_user(email="other@example.com", password="strong-password")
        self.profile = CareerProfile.objects.create(user=self.user)
        self.other_profile = CareerProfile.objects.create(user=self.other_user)
        self.experience = Experience.objects.create(
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
            display_order=1,
        )
        Experience.objects.create(
            career_profile=self.other_profile,
            designation="Senior Engineer",
            employment_type="contract",
            company="Other Inc",
            location="Hybrid",
            location_type="hybrid",
            start_date=date(2021, 1, 1),
            end_date=date(2023, 1, 1),
            currently_working=False,
            description="Built platforms",
            display_order=0,
        )

    def test_list_experiences_returns_only_owner_records(self) -> None:
        records = list_experiences(user=self.user)

        self.assertEqual(records.count(), 1)
        self.assertEqual(records.first(), self.experience)

    def test_get_experience_returns_owner_record(self) -> None:
        record = get_experience(user=self.user, experience_id=self.experience.id)

        self.assertEqual(record, self.experience)

    def test_get_experience_returns_none_for_other_users_record(self) -> None:
        record = get_experience(user=self.user, experience_id=self.other_profile.experiences.first().id)

        self.assertIsNone(record)
