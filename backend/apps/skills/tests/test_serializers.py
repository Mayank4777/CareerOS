from __future__ import annotations

from django.test import TestCase

from apps.accounts.models import User
from apps.career_profile.models import CareerProfile

from ..models import Skill
from ..serializers import SkillSerializer


class SkillSerializerTests(TestCase):
    def setUp(self) -> None:
        self.user = User.objects.create_user(email="serializer@example.com", password="strong-password")
        self.profile = CareerProfile.objects.create(user=self.user)

    def test_serializer_validates_required_and_optional_fields(self) -> None:
        serializer = SkillSerializer(
            data={
                "name": " Python ",
                "category": " Backend ",
                "proficiency_level": "expert",
                "years_of_experience": 5,
                "display_order": 1,
            }
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(serializer.validated_data["name"], "Python")
        self.assertEqual(serializer.validated_data["category"], "Backend")

    def test_serializer_represents_skill(self) -> None:
        skill = Skill.objects.create(
            career_profile=self.profile,
            name="Python",
            category="Backend",
            proficiency_level="expert",
            years_of_experience=5,
            display_order=1,
        )

        serializer = SkillSerializer(skill)

        self.assertEqual(serializer.data["name"], "Python")
        self.assertEqual(serializer.data["user"], self.user.id)

    def test_years_of_experience_cannot_be_negative(self) -> None:
        serializer = SkillSerializer(
            data={
                "name": "Python",
                "category": "Backend",
                "proficiency_level": "expert",
                "years_of_experience": -1,
                "display_order": 1,
            }
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("years_of_experience", serializer.errors)

    def test_name_is_required(self) -> None:
        serializer = SkillSerializer(
            data={
                "category": "Backend",
                "proficiency_level": "expert",
                "years_of_experience": 5,
                "display_order": 1,
            }
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("name", serializer.errors)
