from __future__ import annotations

from uuid import UUID

from django.contrib.auth import get_user_model

from apps.career_profile.selectors import get_profile_by_user

from .models import CustomSection

User = get_user_model()


def list_custom_sections(*, user: User):
    profile = get_profile_by_user(user)
    if profile is None:
        return CustomSection.objects.none()
    return CustomSection.objects.select_related("career_profile", "career_profile__user").filter(
        career_profile=profile,
    )


def get_custom_section(*, user: User, custom_section_id: UUID) -> CustomSection | None:
    profile = get_profile_by_user(user)
    if profile is None:
        return None
    return CustomSection.objects.select_related("career_profile", "career_profile__user").filter(
        career_profile=profile,
        id=custom_section_id,
    ).first()
