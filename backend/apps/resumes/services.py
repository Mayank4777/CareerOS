from __future__ import annotations

from typing import Any

from django.db import transaction
from rest_framework.exceptions import NotFound

from apps.career_profile.selectors import get_profile_by_user

from .models import Resume
from .selectors import get_resume, list_resumes


class ResumeService:
    def create_resume(self, *, user, data: dict[str, Any]) -> Resume:
        profile = get_profile_by_user(user)
        if profile is None:
            raise NotFound("Career profile not found.")

        with transaction.atomic():
            return Resume.objects.create(career_profile=profile, **data)

    def list_resumes(self, *, user):
        return list_resumes(user=user)

    def retrieve_resume(self, *, user, resume_id) -> Resume:
        resume = get_resume(user=user, resume_id=resume_id)
        if resume is None:
            raise NotFound("Resume not found.")
        return resume

    def update_resume(self, *, user, resume_id, data: dict[str, Any]) -> Resume:
        resume = get_resume(user=user, resume_id=resume_id)
        if resume is None:
            raise NotFound("Resume not found.")

        for field, value in data.items():
            setattr(resume, field, value)

        with transaction.atomic():
            resume.save(update_fields=[*data.keys(), "updated_at"])

        return resume

    def delete_resume(self, *, user, resume_id) -> None:
        resume = get_resume(user=user, resume_id=resume_id)
        if resume is None:
            raise NotFound("Resume not found.")

        with transaction.atomic():
            resume.delete()

