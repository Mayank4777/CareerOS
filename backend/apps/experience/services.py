from __future__ import annotations

from typing import Any

from django.db import transaction
from rest_framework.exceptions import NotFound

from apps.career_profile.selectors import get_profile_by_user

from .models import Experience
from .selectors import get_experience, list_experiences


class ExperienceService:
    def create_experience(self, *, user, data: dict[str, Any]) -> Experience:
        profile = get_profile_by_user(user)
        if profile is None:
            raise NotFound("Career profile not found.")

        with transaction.atomic():
            return Experience.objects.create(career_profile=profile, **data)

    def list_experiences(self, *, user):
        return list_experiences(user=user)

    def retrieve_experience(self, *, user, experience_id) -> Experience:
        experience = get_experience(user=user, experience_id=experience_id)
        if experience is None:
            raise NotFound("Experience not found.")
        return experience

    def update_experience(self, *, user, experience_id, data: dict[str, Any]) -> Experience:
        experience = get_experience(user=user, experience_id=experience_id)
        if experience is None:
            raise NotFound("Experience not found.")

        for field, value in data.items():
            setattr(experience, field, value)

        with transaction.atomic():
            experience.save(update_fields=[*data.keys(), "updated_at"])

        return experience

    def delete_experience(self, *, user, experience_id) -> None:
        experience = get_experience(user=user, experience_id=experience_id)
        if experience is None:
            raise NotFound("Experience not found.")

        with transaction.atomic():
            experience.delete()
