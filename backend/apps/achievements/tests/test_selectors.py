from __future__ import annotations

from datetime import date

from django.test import TestCase

from apps.accounts.models import User
from apps.career_profile.models import CareerProfile

from ..models import Achievement
from ..selectors import get_achievement, list_achievements


class AchievementSelectorTests(TestCase):
    def test_owner_scoping(self) -> None:
        user = User.objects.create_user(email="sel@example.com", password="strong-password")
        other_user = User.objects.create_user(email="other@example.com", password="strong-password")
        profile = CareerProfile.objects.create(user=user)
        other_profile = CareerProfile.objects.create(user=other_user)
        achievement = Achievement.objects.create(
            career_profile=profile,
            title="Dean's List",
            description="Recognized for academic excellence",
            achievement_date=date(2024, 1, 1),
        )
        Achievement.objects.create(
            career_profile=other_profile,
            title="Hackathon Winner",
            description="Won the competition",
        )

        self.assertEqual(list_achievements(user=user).count(), 1)
        self.assertEqual(get_achievement(user=user, achievement_id=achievement.id), achievement)
        self.assertIsNone(get_achievement(user=user, achievement_id=other_profile.achievements.first().id))
