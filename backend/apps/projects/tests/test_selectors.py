from __future__ import annotations

from django.test import TestCase

from apps.accounts.models import User
from apps.career_profile.models import CareerProfile

from ..models import Project
from ..selectors import get_project, list_projects


class ProjectSelectorTests(TestCase):
    def test_owner_filters_are_applied(self) -> None:
        user = User.objects.create_user(email="selector@example.com", password="strong-password")
        other_user = User.objects.create_user(email="other@example.com", password="strong-password")
        profile = CareerProfile.objects.create(user=user)
        other_profile = CareerProfile.objects.create(user=other_user)
        project = Project.objects.create(
            career_profile=profile,
            title="CareerOS",
            description="Career tracking platform",
            technologies="Django, DRF",
            currently_active=True,
        )
        Project.objects.create(
            career_profile=other_profile,
            title="Other",
            description="Other",
            technologies="Python",
            currently_active=True,
        )

        self.assertEqual(list_projects(user=user).count(), 1)
        self.assertEqual(get_project(user=user, project_id=project.id), project)
        self.assertIsNone(get_project(user=user, project_id=other_profile.projects.first().id))
