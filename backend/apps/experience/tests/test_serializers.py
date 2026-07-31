from __future__ import annotations

from datetime import date

from django.test import TestCase

from apps.accounts.models import User
from apps.career_profile.models import CareerProfile

from ..models import Experience
from ..serializers import ExperienceSerializer


class ExperienceSerializerTests(TestCase):
    def setUp(self) -> None:
        self.user = User.objects.create_user(email="serializer@example.com", password="strong-password")
        self.profile = CareerProfile.objects.create(user=self.user)

    def test_serializer_strips_text_fields(self) -> None:
        serializer = ExperienceSerializer(
            data={
                "designation": " Software Engineer ",
                "employment_type": "full_time",
                "company": " Example Inc ",
                "location": " Remote ",
                "location_type": "remote",
                "start_date": "2022-01-01",
                "end_date": "2024-01-01",
                "currently_working": False,
                "description": " Built APIs ",
                "display_order": 1,
            }
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(serializer.validated_data["designation"], "Software Engineer")
        self.assertEqual(serializer.validated_data["company"], "Example Inc")
        self.assertEqual(serializer.validated_data["location"], "Remote")
        self.assertEqual(serializer.validated_data["description"], "Built APIs")

    def test_serializer_represents_experience(self) -> None:
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

        serializer = ExperienceSerializer(experience)

        self.assertEqual(serializer.data["designation"], "Software Engineer")
        self.assertEqual(serializer.data["user"], self.user.id)

    def test_currently_working_requires_null_end_date(self) -> None:
        serializer = ExperienceSerializer(
            data={
                "designation": "Software Engineer",
                "employment_type": "full_time",
                "company": "Example Inc",
                "location": "Remote",
                "location_type": "remote",
                "start_date": "2022-01-01",
                "end_date": "2024-01-01",
                "currently_working": True,
                "description": "Built APIs",
            }
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("end_date", serializer.errors)

    def test_end_date_required_when_not_currently_working(self) -> None:
        serializer = ExperienceSerializer(
            data={
                "designation": "Software Engineer",
                "employment_type": "full_time",
                "company": "Example Inc",
                "location": "Remote",
                "location_type": "remote",
                "start_date": "2022-01-01",
                "currently_working": False,
                "description": "Built APIs",
            }
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("end_date", serializer.errors)

    def test_start_date_cannot_be_after_end_date(self) -> None:
        serializer = ExperienceSerializer(
            data={
                "designation": "Software Engineer",
                "employment_type": "full_time",
                "company": "Example Inc",
                "location": "Remote",
                "location_type": "remote",
                "start_date": "2024-01-01",
                "end_date": "2022-01-01",
                "currently_working": False,
                "description": "Built APIs",
            }
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("end_date", serializer.errors)
