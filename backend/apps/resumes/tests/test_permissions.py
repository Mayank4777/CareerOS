from __future__ import annotations

from types import SimpleNamespace

from django.test import TestCase

from apps.accounts.models import User
from apps.career_profile.models import CareerProfile

from ..models import Resume
from ..permissions import IsResumeOwner


class ResumePermissionTests(TestCase):
    def setUp(self) -> None:
        self.owner = User.objects.create_user(email="owner@example.com", password="strong-password")
        self.other_user = User.objects.create_user(email="other@example.com", password="strong-password")
        self.profile = CareerProfile.objects.create(user=self.owner)
        self.resume = Resume.objects.create(
            career_profile=self.profile,
            title="Backend Resume",
            template="Minimal",
            status="draft",
        )
        self.permission = IsResumeOwner()

    def test_owner_can_access_own_resume(self) -> None:
        request = SimpleNamespace(user=self.owner)

        self.assertTrue(self.permission.has_object_permission(request, None, self.resume))

    def test_other_user_cannot_access_resume(self) -> None:
        request = SimpleNamespace(user=self.other_user)

        self.assertFalse(self.permission.has_object_permission(request, None, self.resume))

