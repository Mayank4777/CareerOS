from __future__ import annotations

from django.db import IntegrityError
from django.test import TestCase
from django.utils import timezone

from apps.accounts.models import User

from ..models import CareerProfile


class CareerProfileModelTests(TestCase):
    def test_string_representation_uses_name(self) -> None:
        user = User.objects.create_user(
            email="ada@example.com",
            password="strong-password",
            first_name="Ada",
            last_name="Lovelace",
        )
        profile = CareerProfile.objects.create(user=user)

        self.assertEqual(str(profile), "Ada Lovelace")

    def test_profile_is_owned_by_one_user(self) -> None:
        user = User.objects.create_user(email="grace@example.com", password="strong-password")
        CareerProfile.objects.create(user=user)

        with self.assertRaises(IntegrityError):
            CareerProfile.objects.create(user=user)

    def test_audit_timestamps_are_populated(self) -> None:
        user = User.objects.create_user(email="audit@example.com", password="strong-password")
        profile = CareerProfile.objects.create(user=user)

        self.assertIsNotNone(profile.created_at)
        self.assertIsNotNone(profile.updated_at)
        self.assertLessEqual(profile.created_at, timezone.now())
        self.assertLessEqual(profile.updated_at, timezone.now())
