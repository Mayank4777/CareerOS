from __future__ import annotations

from datetime import date

from django.test import TestCase
from rest_framework.exceptions import NotFound

from apps.accounts.models import User
from apps.career_profile.models import CareerProfile

from ..models import Experience
from ..services import ExperienceService


class ExperienceServiceTests(TestCase):
    def setUp(self) -> None:
        self.service = ExperienceService()
        self.user = User.objects.create_user(email="service@example.com", password="strong-password")
        self.other_user = User.objects.create_user(email="other@example.com", password="strong-password")
        self.profile = CareerProfile.objects.create(user=self.user)
        self.other_profile = CareerProfile.objects.create(user=self.other_user)

    def test_create_experience(self) -> None:
        experience = self.service.create_experience(
            user=self.user,
            data={
                "designation": "Software Engineer",
                "employment_type": "full_time",
                "company": "Example Inc",
                "location": "Remote",
                "location_type": "remote",
                "start_date": date(2022, 1, 1),
                "end_date": date(2024, 1, 1),
                "currently_working": False,
                "description": "Built APIs",
                "display_order": 1,
            },
        )

        self.assertIsInstance(experience, Experience)
        self.assertEqual(experience.career_profile, self.profile)

    def test_list_experiences_returns_owner_records(self) -> None:
        own_experience = Experience.objects.create(
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

        records = self.service.list_experiences(user=self.user)

        self.assertEqual(records.count(), 1)
        self.assertEqual(records.first(), own_experience)

    def test_retrieve_experience(self) -> None:
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

        fetched = self.service.retrieve_experience(user=self.user, experience_id=experience.id)

        self.assertEqual(fetched, experience)

    def test_update_experience(self) -> None:
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

        updated = self.service.update_experience(
            user=self.user,
            experience_id=experience.id,
            data={"designation": "Senior Software Engineer"},
        )

        self.assertEqual(updated.designation, "Senior Software Engineer")
        self.assertIsNotNone(updated.updated_at)

    def test_delete_experience(self) -> None:
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

        self.service.delete_experience(user=self.user, experience_id=experience.id)

        self.assertFalse(Experience.objects.filter(id=experience.id).exists())

    def test_missing_experience_raises_not_found(self) -> None:
        with self.assertRaises(NotFound):
            self.service.retrieve_experience(user=self.user, experience_id="00000000-0000-0000-0000-000000000000")
