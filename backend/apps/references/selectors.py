from __future__ import annotations

from uuid import UUID

from django.contrib.auth import get_user_model

from apps.career_profile.selectors import get_profile_by_user

from .models import Reference

User = get_user_model()


def list_references(*, user: User):
    profile = get_profile_by_user(user)
    if profile is None:
        return Reference.objects.none()
    return Reference.objects.select_related("career_profile", "career_profile__user").filter(
        career_profile=profile,
    )


def get_reference(*, user: User, reference_id: UUID) -> Reference | None:
    profile = get_profile_by_user(user)
    if profile is None:
        return None
    return Reference.objects.select_related("career_profile", "career_profile__user").filter(
        career_profile=profile,
        id=reference_id,
    ).first()
