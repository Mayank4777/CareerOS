from __future__ import annotations

from django.test import TestCase
from rest_framework.exceptions import NotFound

from apps.accounts.models import User
from apps.career_profile.models import CareerProfile

from ..models import Language
from ..services import LanguageService


class LanguageServiceTests(TestCase):
    def test_crud_flow(self) -> None:
        user = User.objects.create_user(email="service@example.com", password="strong-password")
        profile = CareerProfile.objects.create(user=user)
        service = LanguageService()

        language = service.create_language(user=user, data={"language": "English", "proficiency": "native"})
        self.assertEqual(language.career_profile, profile)

        fetched = service.retrieve_language(user=user, language_id=language.id)
        self.assertEqual(fetched, language)

        updated = service.update_language(user=user, language_id=language.id, data={"language": "English (UK)"})
        self.assertEqual(updated.language, "English (UK)")

        service.delete_language(user=user, language_id=language.id)
        self.assertFalse(Language.objects.filter(id=language.id).exists())

    def test_missing_language_raises_not_found(self) -> None:
        user = User.objects.create_user(email="service2@example.com", password="strong-password")
        with self.assertRaises(NotFound):
            LanguageService().retrieve_language(user=user, language_id="00000000-0000-0000-0000-000000000000")
