from __future__ import annotations

from uuid import UUID

from django.contrib.auth import get_user_model

from apps.career_profile.selectors import get_profile_by_user

from .models import Experience

User = get_user_model()


def list_experiences(*, user: User):
    profile = get_profile_by_user(user)
    if profile is None:
        return Experience.objects.none()
    return Experience.objects.select_related("career_profile", "career_profile__user").filter(
        career_profile=profile,
    )


def get_experience(*, user: User, experience_id: UUID) -> Experience | None:
    profile = get_profile_by_user(user)
    if profile is None:
        return None
    return Experience.objects.select_related("career_profile", "career_profile__user").filter(
        career_profile=profile,
        id=experience_id,
    ).first()
