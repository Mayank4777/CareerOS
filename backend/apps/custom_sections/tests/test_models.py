from __future__ import annotations

from django.test import TestCase

from apps.accounts.models import User
from apps.career_profile.models import CareerProfile

from ..models import CustomSection


class CustomSectionModelTests(TestCase):
    def test_string_representation_and_ownership(self) -> None:
        user = User.objects.create_user(email="custom@example.com", password="strong-password")
        profile = CareerProfile.objects.create(user=user)
        custom_section = CustomSection.objects.create(
            career_profile=profile,
            title="Additional Information",
            content="Open source contributor",
        )

        self.assertEqual(str(custom_section), "Additional Information")
        self.assertEqual(profile.custom_sections.count(), 1)
