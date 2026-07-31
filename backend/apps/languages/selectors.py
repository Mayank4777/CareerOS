from __future__ import annotations

from uuid import UUID

from django.contrib.auth import get_user_model

from apps.career_profile.selectors import get_profile_by_user

from .models import Language

User = get_user_model()


def list_languages(*, user: User):
    profile = get_profile_by_user(user)
    if profile is None:
        return Language.objects.none()
    return Language.objects.select_related("career_profile", "career_profile__user").filter(
        career_profile=profile,
    )


def get_language(*, user: User, language_id: UUID) -> Language | None:
    profile = get_profile_by_user(user)
    if profile is None:
        return None
    return Language.objects.select_related("career_profile", "career_profile__user").filter(
        career_profile=profile,
        id=language_id,
    ).first()
