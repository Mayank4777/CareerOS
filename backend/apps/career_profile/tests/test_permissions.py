from __future__ import annotations

from types import SimpleNamespace

from django.test import TestCase

from apps.accounts.models import User

from ..models import CareerProfile
from ..permissions import IsCareerProfileOwner


class CareerProfilePermissionTests(TestCase):
    def setUp(self) -> None:
        self.owner = User.objects.create_user(
            email="owner@example.com",
            password="strong-password",
        )
        self.other_user = User.objects.create_user(
            email="other@example.com",
            password="strong-password",
        )
        self.profile = CareerProfile.objects.create(user=self.owner)
        self.permission = IsCareerProfileOwner()

    def test_owner_can_access_own_profile(self) -> None:
        request = SimpleNamespace(user=self.owner)

        self.assertTrue(self.permission.has_object_permission(request, None, self.profile))

    def test_other_user_cannot_access_profile(self) -> None:
        request = SimpleNamespace(user=self.other_user)

        self.assertFalse(self.permission.has_object_permission(request, None, self.profile))

