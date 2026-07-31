from __future__ import annotations

from uuid import UUID

from django.contrib.auth import get_user_model

from apps.career_profile.selectors import get_profile_by_user

from .models import Award

User = get_user_model()


def list_awards(*, user: User):
    profile = get_profile_by_user(user)
    if profile is None:
        return Award.objects.none()
    return Award.objects.select_related("career_profile", "career_profile__user").filter(
        career_profile=profile,
    )


def get_award(*, user: User, award_id: UUID) -> Award | None:
    profile = get_profile_by_user(user)
    if profile is None:
        return None
    return Award.objects.select_related("career_profile", "career_profile__user").filter(
        career_profile=profile,
        id=award_id,
    ).first()
