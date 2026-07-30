from __future__ import annotations

from django.test import TestCase
from rest_framework.exceptions import NotFound

from apps.accounts.models import User
from apps.common.exceptions import ConflictException

from ..models import CareerProfile
from ..services import CareerProfileService


class CareerProfileServiceTests(TestCase):
    def setUp(self) -> None:
        self.service = CareerProfileService()
        self.user = User.objects.create_user(
            email="service@example.com",
            password="strong-password",
        )

    def test_create_profile(self) -> None:
        profile = self.service.create_profile(
            user=self.user,
            data={
                "first_name": "Ada",
                "last_name": "Lovelace",
                "headline": "Backend Engineer",
            },
        )

        self.assertIsInstance(profile, CareerProfile)
        self.assertEqual(profile.user, self.user)
        self.assertEqual(profile.first_name, "Ada")

    def test_retrieve_profile(self) -> None:
        profile = CareerProfile.objects.create(user=self.user, headline="Engineer")

        fetched = self.service.retrieve_profile(user=self.user)

        self.assertEqual(fetched, profile)

    def test_update_profile(self) -> None:
        CareerProfile.objects.create(user=self.user, headline="Engineer")

        updated = self.service.update_profile(
            user=self.user,
            data={"headline": "Senior Engineer"},
        )

        self.assertEqual(updated.headline, "Senior Engineer")
        self.assertIsNotNone(updated.updated_at)

    def test_delete_profile(self) -> None:
        CareerProfile.objects.create(user=self.user)

        self.service.delete_profile(user=self.user)

        self.assertFalse(CareerProfile.objects.filter(user=self.user).exists())

    def test_duplicate_profile_raises_conflict(self) -> None:
        CareerProfile.objects.create(user=self.user)

        with self.assertRaises(ConflictException):
            self.service.create_profile(user=self.user, data={})

    def test_missing_profile_raises_not_found(self) -> None:
        with self.assertRaises(NotFound):
            self.service.retrieve_profile(user=self.user)
