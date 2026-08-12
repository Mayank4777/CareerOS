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
    target_role = models.CharField(max_length=255, blank=True, default="")
    job_description = models.TextField(blank=True, default="")
    template = models.CharField(max_length=100, blank=True, default="modern")
    status = models.CharField(max_length=32, choices=ResumeStatus.choices, default=ResumeStatus.DRAFT)
    content_data = models.JSONField(default=dict, blank=True)
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


class ResumeVersion(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    resume = models.ForeignKey(
        Resume,
        on_delete=models.CASCADE,
        related_name="versions",
    )
    version_number = models.CharField(max_length=32)
    title = models.CharField(max_length=255)
    commit_message = models.TextField(blank=True, default="")
    tags = models.JSONField(default=list, blank=True)
    snapshot_data = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "resume_version"
        verbose_name = "resume version"
        verbose_name_plural = "resume versions"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["resume", "-created_at"], name="resume_ver_created_idx"),
        ]

    def __str__(self) -> str:
        return f"{self.resume.title} ({self.version_number})"


