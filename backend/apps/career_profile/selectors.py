from __future__ import annotations

from uuid import UUID

from .models import CareerProfile


def get_profile_by_user(user) -> CareerProfile | None:
    return CareerProfile.objects.select_related("user").filter(user=user).first()


def get_profile(profile_id: UUID) -> CareerProfile | None:
    return CareerProfile.objects.select_related("user").filter(id=profile_id).first()
