from __future__ import annotations

from django.test import TestCase
from rest_framework.exceptions import NotFound

from apps.accounts.models import User
from apps.career_profile.models import CareerProfile

from ..models import Project
from ..services import ProjectService


class ProjectServiceTests(TestCase):
    def test_crud_flow(self) -> None:
        user = User.objects.create_user(email="service@example.com", password="strong-password")
        profile = CareerProfile.objects.create(user=user)
        service = ProjectService()

        project = service.create_project(
            user=user,
            data={
                "title": "CareerOS",
                "description": "Career tracking platform",
                "technologies": "Django, DRF",
                "currently_active": True,
            },
        )
        self.assertEqual(project.career_profile, profile)

        fetched = service.retrieve_project(user=user, project_id=project.id)
        self.assertEqual(fetched, project)

        updated = service.update_project(user=user, project_id=project.id, data={"title": "CareerOS Pro"})
        self.assertEqual(updated.title, "CareerOS Pro")

        service.delete_project(user=user, project_id=project.id)
        self.assertFalse(Project.objects.filter(id=project.id).exists())

    def test_missing_project_raises_not_found(self) -> None:
        user = User.objects.create_user(email="service2@example.com", password="strong-password")
        ProjectService()

        with self.assertRaises(NotFound):
            ProjectService().retrieve_project(user=user, project_id="00000000-0000-0000-0000-000000000000")
