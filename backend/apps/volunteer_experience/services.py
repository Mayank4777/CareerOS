from __future__ import annotations

from typing import Any

from django.db import transaction
from rest_framework.exceptions import NotFound

from apps.career_profile.selectors import get_profile_by_user

from .models import VolunteerExperience
from .selectors import get_volunteer_experience, list_volunteer_experiences


class VolunteerExperienceService:
    def create_volunteer_experience(self, *, user, data: dict[str, Any]) -> VolunteerExperience:
        profile = get_profile_by_user(user)
        if profile is None:
            raise NotFound("Career profile not found.")

        with transaction.atomic():
            return VolunteerExperience.objects.create(career_profile=profile, **data)

    def list_volunteer_experiences(self, *, user):
        return list_volunteer_experiences(user=user)

    def retrieve_volunteer_experience(self, *, user, volunteer_experience_id) -> VolunteerExperience:
        volunteer_experience = get_volunteer_experience(user=user, volunteer_experience_id=volunteer_experience_id)
        if volunteer_experience is None:
            raise NotFound("Volunteer experience not found.")
        return volunteer_experience

    def update_volunteer_experience(self, *, user, volunteer_experience_id, data: dict[str, Any]) -> VolunteerExperience:
        volunteer_experience = get_volunteer_experience(user=user, volunteer_experience_id=volunteer_experience_id)
        if volunteer_experience is None:
            raise NotFound("Volunteer experience not found.")

        for field, value in data.items():
            setattr(volunteer_experience, field, value)

        with transaction.atomic():
            volunteer_experience.save(update_fields=[*data.keys(), "updated_at"])

        return volunteer_experience

    def delete_volunteer_experience(self, *, user, volunteer_experience_id) -> None:
        volunteer_experience = get_volunteer_experience(user=user, volunteer_experience_id=volunteer_experience_id)
        if volunteer_experience is None:
            raise NotFound("Volunteer experience not found.")

        with transaction.atomic():
            volunteer_experience.delete()
