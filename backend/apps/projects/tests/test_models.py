from __future__ import annotations

from django.test import TestCase
from django.utils import timezone

from apps.accounts.models import User
from apps.career_profile.models import CareerProfile

from ..models import Project


class ProjectModelTests(TestCase):
    def test_string_representation_and_ownership(self) -> None:
        user = User.objects.create_user(email="project@example.com", password="strong-password")
        profile = CareerProfile.objects.create(user=user)
        project = Project.objects.create(
            career_profile=profile,
            title="CareerOS",
            description="Career tracking platform",
            technologies="Django, DRF",
            currently_active=True,
        )

        self.assertEqual(str(project), "CareerOS")
        self.assertEqual(profile.projects.count(), 1)

    def test_audit_timestamps_are_populated(self) -> None:
        user = User.objects.create_user(email="project2@example.com", password="strong-password")
        profile = CareerProfile.objects.create(user=user)
        project = Project.objects.create(
            career_profile=profile,
            title="CareerOS",
            description="Career tracking platform",
            technologies="Django, DRF",
            currently_active=True,
        )

        self.assertIsNotNone(project.created_at)
        self.assertIsNotNone(project.updated_at)
        self.assertLessEqual(project.created_at, timezone.now())
        self.assertLessEqual(project.updated_at, timezone.now())
