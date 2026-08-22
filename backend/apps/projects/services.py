from __future__ import annotations

from typing import Any

from django.db import transaction
from rest_framework.exceptions import NotFound

from apps.career_profile.selectors import get_profile_by_user

from .models import Project
from .selectors import get_project, list_projects


class ProjectService:
    def create_project(self, *, user, data: dict[str, Any]) -> Project:
        profile = get_profile_by_user(user)
        if profile is None:
            raise NotFound("Career profile not found.")

        with transaction.atomic():
            return Project.objects.create(career_profile=profile, **data)

    def list_projects(self, *, user):
        return list_projects(user=user)

    def retrieve_project(self, *, user, project_id) -> Project:
        project = get_project(user=user, project_id=project_id)
        if project is None:
            raise NotFound("Project not found.")
        return project

    def update_project(self, *, user, project_id, data: dict[str, Any]) -> Project:
        project = get_project(user=user, project_id=project_id)
        if project is None:
            raise NotFound("Project not found.")

        for field, value in data.items():
            setattr(project, field, value)

        with transaction.atomic():
            project.save(update_fields=[*data.keys(), "updated_at"])

        return project

    def delete_project(self, *, user, project_id) -> None:
        project = get_project(user=user, project_id=project_id)
        if project is None:
            raise NotFound("Project not found.")

        with transaction.atomic():
            project.delete()
