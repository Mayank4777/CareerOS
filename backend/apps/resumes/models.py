from __future__ import annotations

import uuid

from django.db import models

from apps.career_profile.models import CareerProfile


class ResumeStatus(models.TextChoices):
    DRAFT = "draft", "Draft"
    IN_REVIEW = "in_review", "In Review"
    APPROVED = "approved", "Approved"
    APPLIED = "applied", "Applied"
    ARCHIVED = "archived", "Archived"


class Resume(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    career_profile = models.ForeignKey(
        CareerProfile,
        on_delete=models.CASCADE,
        related_name="resumes",
    )
    title = models.CharField(max_length=255)
    template = models.CharField(max_length=100, blank=True, default="")
    status = models.CharField(max_length=32, choices=ResumeStatus.choices, default=ResumeStatus.DRAFT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "resume"
        verbose_name = "resume"
        verbose_name_plural = "resumes"
        ordering = ["-created_at", "-updated_at"]
        indexes = [
            models.Index(fields=["career_profile", "-created_at"], name="resume_profile_created_idx"),
            models.Index(fields=["career_profile", "status"], name="resume_profile_status_idx"),
        ]

    def __str__(self) -> str:
        return self.title

