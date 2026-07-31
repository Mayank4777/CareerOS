from __future__ import annotations

from uuid import UUID

from django.contrib.auth import get_user_model

from apps.career_profile.selectors import get_profile_by_user

from .models import Achievement

User = get_user_model()


def list_achievements(*, user: User):
    profile = get_profile_by_user(user)
    if profile is None:
        return Achievement.objects.none()
    return Achievement.objects.select_related("career_profile", "career_profile__user").filter(
        career_profile=profile,
    )


def get_achievement(*, user: User, achievement_id: UUID) -> Achievement | None:
    profile = get_profile_by_user(user)
    if profile is None:
        return None
    return Achievement.objects.select_related("career_profile", "career_profile__user").filter(
        career_profile=profile,
        id=achievement_id,
    ).first()
