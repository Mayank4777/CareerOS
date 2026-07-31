from __future__ import annotations

from datetime import date

from django.test import TestCase

from apps.accounts.models import User
from apps.career_profile.models import CareerProfile

from ..models import Award


class AwardModelTests(TestCase):
    def test_string_representation_and_ownership(self) -> None:
        user = User.objects.create_user(email="award@example.com", password="strong-password")
        profile = CareerProfile.objects.create(user=user)
        award = Award.objects.create(
            career_profile=profile,
            title="Employee of the Month",
            issuer="OpenAI",
            award_date=date(2024, 1, 1),
        )

        self.assertEqual(str(award), "Employee of the Month")
        self.assertEqual(profile.awards.count(), 1)
