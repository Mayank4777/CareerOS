from __future__ import annotations

from django.test import TestCase

from apps.accounts.models import User
from apps.career_profile.models import CareerProfile

from ..models import Language
from ..selectors import get_language, list_languages


class LanguageSelectorTests(TestCase):
    def test_owner_filters_are_applied(self) -> None:
        user = User.objects.create_user(email="selector@example.com", password="strong-password")
        other_user = User.objects.create_user(email="other@example.com", password="strong-password")
        profile = CareerProfile.objects.create(user=user)
        other_profile = CareerProfile.objects.create(user=other_user)
        language = Language.objects.create(career_profile=profile, language="English", proficiency="native")
        Language.objects.create(career_profile=other_profile, language="German", proficiency="professional")

        self.assertEqual(list_languages(user=user).count(), 1)
        self.assertEqual(get_language(user=user, language_id=language.id), language)
        self.assertIsNone(get_language(user=user, language_id=other_profile.languages.first().id))
