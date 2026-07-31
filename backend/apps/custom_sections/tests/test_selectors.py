from __future__ import annotations

from django.test import TestCase

from apps.accounts.models import User
from apps.career_profile.models import CareerProfile

from ..models import CustomSection
from ..selectors import get_custom_section, list_custom_sections


class CustomSectionSelectorTests(TestCase):
    def test_owner_scoping(self) -> None:
        user = User.objects.create_user(email="sel@example.com", password="strong-password")
        other_user = User.objects.create_user(email="other@example.com", password="strong-password")
        profile = CareerProfile.objects.create(user=user)
        other_profile = CareerProfile.objects.create(user=other_user)
        custom_section = CustomSection.objects.create(
            career_profile=profile,
            title="Additional Information",
            content="Open source contributor",
        )
        CustomSection.objects.create(
            career_profile=other_profile,
            title="Other",
            content="Something else",
        )

        self.assertEqual(list_custom_sections(user=user).count(), 1)
        self.assertEqual(get_custom_section(user=user, custom_section_id=custom_section.id), custom_section)
        self.assertIsNone(get_custom_section(user=user, custom_section_id=other_profile.custom_sections.first().id))
