from __future__ import annotations

from uuid import UUID

from django.contrib.auth import get_user_model

from apps.career_profile.selectors import get_profile_by_user

from .models import Publication

User = get_user_model()


def list_publications(*, user: User):
    profile = get_profile_by_user(user)
    if profile is None:
        return Publication.objects.none()
    return Publication.objects.select_related("career_profile", "career_profile__user").filter(
        career_profile=profile,
    )


def get_publication(*, user: User, publication_id: UUID) -> Publication | None:
    profile = get_profile_by_user(user)
    if profile is None:
        return None
    return Publication.objects.select_related("career_profile", "career_profile__user").filter(
        career_profile=profile,
        id=publication_id,
    ).first()
