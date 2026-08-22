from __future__ import annotations

from typing import Any

from django.db import transaction
from rest_framework.exceptions import NotFound

from apps.career_profile.selectors import get_profile_by_user

from .models import Language
from .selectors import get_language, list_languages


class LanguageService:
    def create_language(self, *, user, data: dict[str, Any]) -> Language:
        profile = get_profile_by_user(user)
        if profile is None:
            raise NotFound("Career profile not found.")

        with transaction.atomic():
            return Language.objects.create(career_profile=profile, **data)

    def list_languages(self, *, user):
        return list_languages(user=user)

    def retrieve_language(self, *, user, language_id) -> Language:
        language = get_language(user=user, language_id=language_id)
        if language is None:
            raise NotFound("Language not found.")
        return language

    def update_language(self, *, user, language_id, data: dict[str, Any]) -> Language:
        language = get_language(user=user, language_id=language_id)
        if language is None:
            raise NotFound("Language not found.")

        for field, value in data.items():
            setattr(language, field, value)

        with transaction.atomic():
            language.save(update_fields=[*data.keys(), "updated_at"])

        return language

    def delete_language(self, *, user, language_id) -> None:
        language = get_language(user=user, language_id=language_id)
        if language is None:
            raise NotFound("Language not found.")

        with transaction.atomic():
            language.delete()
