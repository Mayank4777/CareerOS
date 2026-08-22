from __future__ import annotations

from typing import Any

from django.db import transaction
from rest_framework.exceptions import NotFound

from apps.career_profile.selectors import get_profile_by_user

from .models import Achievement
from .selectors import get_achievement, list_achievements


class AchievementService:
    def create_achievement(self, *, user, data: dict[str, Any]) -> Achievement:
        profile = get_profile_by_user(user)
        if profile is None:
            raise NotFound("Career profile not found.")

        with transaction.atomic():
            return Achievement.objects.create(career_profile=profile, **data)

    def list_achievements(self, *, user):
        return list_achievements(user=user)

    def retrieve_achievement(self, *, user, achievement_id) -> Achievement:
        achievement = get_achievement(user=user, achievement_id=achievement_id)
        if achievement is None:
            raise NotFound("Achievement not found.")
        return achievement

    def update_achievement(self, *, user, achievement_id, data: dict[str, Any]) -> Achievement:
        achievement = get_achievement(user=user, achievement_id=achievement_id)
        if achievement is None:
            raise NotFound("Achievement not found.")

        for field, value in data.items():
            setattr(achievement, field, value)

        with transaction.atomic():
            achievement.save(update_fields=[*data.keys(), "updated_at"])

        return achievement

    def delete_achievement(self, *, user, achievement_id) -> None:
        achievement = get_achievement(user=user, achievement_id=achievement_id)
        if achievement is None:
            raise NotFound("Achievement not found.")

        with transaction.atomic():
            achievement.delete()
