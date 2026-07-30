from __future__ import annotations

from django.test import TestCase

from apps.accounts.models import User

from ..models import CareerProfile
from ..selectors import get_profile, get_profile_by_user


class CareerProfileSelectorTests(TestCase):
    def setUp(self) -> None:
        self.user = User.objects.create_user(
            email="selena@example.com",
            password="strong-password",
            first_name="Selena",
            last_name="Mora",
        )
        self.profile = CareerProfile.objects.create(
            user=self.user,
            headline="Backend Engineer",
        )

    def test_get_profile_by_user_returns_profile(self) -> None:
        self.assertEqual(get_profile_by_user(self.user), self.profile)

    def test_get_profile_returns_profile_by_id(self) -> None:
        self.assertEqual(get_profile(self.profile.id), self.profile)

