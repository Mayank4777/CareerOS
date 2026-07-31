from __future__ import annotations

from datetime import date

from django.test import TestCase
from rest_framework.exceptions import NotFound

from apps.accounts.models import User
from apps.career_profile.models import CareerProfile

from ..models import Achievement
from ..services import AchievementService


class AchievementServiceTests(TestCase):
    def test_crud_and_not_found(self) -> None:
        user = User.objects.create_user(email="srv@example.com", password="strong-password")
        profile = CareerProfile.objects.create(user=user)
        service = AchievementService()

        achievement = service.create_achievement(
            user=user,
            data={
                "title": "Dean's List",
                "description": "Recognized for academic excellence",
                "achievement_date": date(2024, 1, 1),
            },
        )
        self.assertEqual(achievement.career_profile, profile)

        fetched = service.retrieve_achievement(user=user, achievement_id=achievement.id)
        self.assertEqual(fetched, achievement)

        updated = service.update_achievement(
            user=user,
            achievement_id=achievement.id,
            data={"title": "Dean's List 2024"},
        )
        self.assertEqual(updated.title, "Dean's List 2024")

        service.delete_achievement(user=user, achievement_id=achievement.id)
        self.assertFalse(Achievement.objects.filter(id=achievement.id).exists())

        with self.assertRaises(NotFound):
            service.retrieve_achievement(user=user, achievement_id="00000000-0000-0000-0000-000000000000")
