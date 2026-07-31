from __future__ import annotations

from uuid import UUID

from django.contrib.auth import get_user_model

from apps.career_profile.selectors import get_profile_by_user

from .models import Project

User = get_user_model()


def list_projects(*, user: User):
    profile = get_profile_by_user(user)
    if profile is None:
        return Project.objects.none()
    return Project.objects.select_related("career_profile", "career_profile__user").filter(
        career_profile=profile,
    )


def get_project(*, user: User, project_id: UUID) -> Project | None:
    profile = get_profile_by_user(user)
    if profile is None:
        return None
    return Project.objects.select_related("career_profile", "career_profile__user").filter(
        career_profile=profile,
        id=project_id,
    ).first()
