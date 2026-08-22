from __future__ import annotations

from datetime import date

from django.test import TestCase
from django.utils import timezone

from apps.accounts.models import User
from apps.career_profile.models import CareerProfile

from ..models import Achievement


class AchievementModelTests(TestCase):
    def test_string_representation_and_timestamps(self) -> None:
        user = User.objects.create_user(email="ach@example.com", password="strong-password")
        profile = CareerProfile.objects.create(user=user)
        achievement = Achievement.objects.create(
            career_profile=profile,
            title="Dean's List",
            description="Recognized for academic excellence",
            achievement_date=date(2024, 1, 1),
        )

        self.assertEqual(str(achievement), "Dean's List")
        self.assertEqual(profile.achievements.count(), 1)
        self.assertIsNotNone(achievement.created_at)
        self.assertIsNotNone(achievement.updated_at)
        self.assertLessEqual(achievement.created_at, timezone.now())
