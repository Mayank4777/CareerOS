from __future__ import annotations

from django.test import TestCase
from django.utils import timezone

from apps.accounts.models import User
from apps.career_profile.models import CareerProfile

from ..models import Skill


class SkillModelTests(TestCase):
    def setUp(self) -> None:
        self.user = User.objects.create_user(email="skill@example.com", password="strong-password")
        self.profile = CareerProfile.objects.create(user=self.user)

    def test_string_representation_uses_name(self) -> None:
        skill = Skill.objects.create(
            career_profile=self.profile,
            name="Python",
            category="Programming",
            proficiency_level="expert",
            years_of_experience=5,
            display_order=1,
        )

        self.assertEqual(str(skill), "Python")

    def test_skill_belongs_to_career_profile(self) -> None:
        Skill.objects.create(
            career_profile=self.profile,
            name="Python",
            category="Programming",
            proficiency_level="expert",
            years_of_experience=5,
            display_order=1,
        )

        self.assertEqual(self.profile.skills.count(), 1)

    def test_audit_timestamps_are_populated(self) -> None:
        skill = Skill.objects.create(
            career_profile=self.profile,
            name="Python",
            category="Programming",
            proficiency_level="expert",
            years_of_experience=5,
            display_order=1,
        )

        self.assertIsNotNone(skill.created_at)
        self.assertIsNotNone(skill.updated_at)
        self.assertLessEqual(skill.created_at, timezone.now())
        self.assertLessEqual(skill.updated_at, timezone.now())
