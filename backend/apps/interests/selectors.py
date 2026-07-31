from __future__ import annotations

from uuid import UUID

from django.contrib.auth import get_user_model

from apps.career_profile.selectors import get_profile_by_user

from .models import Interest

User = get_user_model()


def list_interests(*, user: User):
    profile = get_profile_by_user(user)
    if profile is None:
        return Interest.objects.none()
    return Interest.objects.select_related("career_profile", "career_profile__user").filter(
        career_profile=profile,
    )


def get_interest(*, user: User, interest_id: UUID) -> Interest | None:
    profile = get_profile_by_user(user)
    if profile is None:
        return None
    return Interest.objects.select_related("career_profile", "career_profile__user").filter(
        career_profile=profile,
        id=interest_id,
    ).first()
