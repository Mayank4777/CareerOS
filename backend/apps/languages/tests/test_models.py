from __future__ import annotations

from django.test import TestCase

from apps.accounts.models import User
from apps.career_profile.models import CareerProfile

from ..models import Language


class LanguageModelTests(TestCase):
    def test_string_representation_and_ownership(self) -> None:
        user = User.objects.create_user(email="language@example.com", password="strong-password")
        profile = CareerProfile.objects.create(user=user)
        language = Language.objects.create(
            career_profile=profile,
            language="English",
            proficiency="native",
        )

        self.assertEqual(str(language), "English")
        self.assertEqual(profile.languages.count(), 1)
