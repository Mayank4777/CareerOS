from __future__ import annotations

from datetime import date
from types import SimpleNamespace

from django.test import TestCase

from apps.accounts.models import User
from apps.career_profile.models import CareerProfile

from ..models import Project
from ..permissions import IsProjectOwner


class ProjectPermissionTests(TestCase):
    def test_owner_only_access(self) -> None:
        owner = User.objects.create_user(email="owner@example.com", password="strong-password")
        other = User.objects.create_user(email="other@example.com", password="strong-password")
        profile = CareerProfile.objects.create(user=owner)
        project = Project.objects.create(
            career_profile=profile,
            title="CareerOS",
            description="Career tracking platform",
            technologies="Django, DRF",
            currently_active=True,
        )
        permission = IsProjectOwner()

        self.assertTrue(permission.has_object_permission(SimpleNamespace(user=owner), None, project))
        self.assertFalse(permission.has_object_permission(SimpleNamespace(user=other), None, project))
