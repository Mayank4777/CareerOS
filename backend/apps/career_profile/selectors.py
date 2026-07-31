from __future__ import annotations

from uuid import UUID

from django.contrib.auth import get_user_model

from .models import CareerProfile, Education

User = get_user_model()


def get_profile_by_user(user) -> CareerProfile | None:
    return CareerProfile.objects.select_related("user").filter(user=user).first()


def get_profile(profile_id: UUID) -> CareerProfile | None:
    return CareerProfile.objects.select_related("user").filter(id=profile_id).first()


def list_educations(*, user: User):
    profile = get_profile_by_user(user)
    if profile is None:
        return Education.objects.none()
    return Education.objects.select_related("career_profile", "career_profile__user").filter(
        career_profile=profile
    )


def get_education(*, user: User, education_id: UUID) -> Education | None:
    profile = get_profile_by_user(user)
    if profile is None:
        return None
    return Education.objects.select_related("career_profile", "career_profile__user").filter(
        career_profile=profile,
        id=education_id,
    ).first()
