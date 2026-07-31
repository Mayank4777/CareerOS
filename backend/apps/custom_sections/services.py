from __future__ import annotations

from typing import Any

from django.db import transaction
from rest_framework.exceptions import NotFound

from apps.career_profile.selectors import get_profile_by_user

from .models import CustomSection
from .selectors import get_custom_section, list_custom_sections


class CustomSectionService:
    def create_custom_section(self, *, user, data: dict[str, Any]) -> CustomSection:
        profile = get_profile_by_user(user)
        if profile is None:
            raise NotFound("Career profile not found.")

        with transaction.atomic():
            return CustomSection.objects.create(career_profile=profile, **data)

    def list_custom_sections(self, *, user):
        return list_custom_sections(user=user)

    def retrieve_custom_section(self, *, user, custom_section_id) -> CustomSection:
        custom_section = get_custom_section(user=user, custom_section_id=custom_section_id)
        if custom_section is None:
            raise NotFound("Custom section not found.")
        return custom_section

    def update_custom_section(self, *, user, custom_section_id, data: dict[str, Any]) -> CustomSection:
        custom_section = get_custom_section(user=user, custom_section_id=custom_section_id)
        if custom_section is None:
            raise NotFound("Custom section not found.")

        for field, value in data.items():
            setattr(custom_section, field, value)

        with transaction.atomic():
            custom_section.save(update_fields=[*data.keys(), "updated_at"])

        return custom_section

    def delete_custom_section(self, *, user, custom_section_id) -> None:
        custom_section = get_custom_section(user=user, custom_section_id=custom_section_id)
        if custom_section is None:
            raise NotFound("Custom section not found.")

        with transaction.atomic():
            custom_section.delete()
