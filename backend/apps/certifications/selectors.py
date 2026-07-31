from __future__ import annotations

from uuid import UUID

from django.contrib.auth import get_user_model

from apps.career_profile.selectors import get_profile_by_user

from .models import Certification

User = get_user_model()


def list_certifications(*, user: User):
    profile = get_profile_by_user(user)
    if profile is None:
        return Certification.objects.none()
    return Certification.objects.select_related("career_profile", "career_profile__user").filter(
        career_profile=profile,
    )


def get_certification(*, user: User, certification_id: UUID) -> Certification | None:
    profile = get_profile_by_user(user)
    if profile is None:
        return None
    return Certification.objects.select_related("career_profile", "career_profile__user").filter(
        career_profile=profile,
        id=certification_id,
    ).first()
