from __future__ import annotations

from uuid import UUID

from django.contrib.auth import get_user_model

from apps.career_profile.selectors import get_profile_by_user

from .models import Skill

User = get_user_model()


def list_skills(*, user: User):
    profile = get_profile_by_user(user)
    if profile is None:
        return Skill.objects.none()
    return Skill.objects.select_related("career_profile", "career_profile__user").filter(
        career_profile=profile,
    )


def get_skill(*, user: User, skill_id: UUID) -> Skill | None:
    profile = get_profile_by_user(user)
    if profile is None:
        return None
    return Skill.objects.select_related("career_profile", "career_profile__user").filter(
        career_profile=profile,
        id=skill_id,
    ).first()
