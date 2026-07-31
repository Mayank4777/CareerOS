from __future__ import annotations

from uuid import UUID

from django.contrib.auth import get_user_model

from apps.career_profile.selectors import get_profile_by_user

from .models import VolunteerExperience

User = get_user_model()


def list_volunteer_experiences(*, user: User):
    profile = get_profile_by_user(user)
    if profile is None:
        return VolunteerExperience.objects.none()
    return VolunteerExperience.objects.select_related("career_profile", "career_profile__user").filter(
        career_profile=profile,
    )


def get_volunteer_experience(*, user: User, volunteer_experience_id: UUID) -> VolunteerExperience | None:
    profile = get_profile_by_user(user)
    if profile is None:
        return None
    return VolunteerExperience.objects.select_related("career_profile", "career_profile__user").filter(
        career_profile=profile,
        id=volunteer_experience_id,
    ).first()
