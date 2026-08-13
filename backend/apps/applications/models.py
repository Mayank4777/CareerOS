from __future__ import annotations

import uuid

from django.db import models

from apps.career_profile.models import CareerProfile
from apps.jobs.models import SavedJob
from apps.resumes.models import Resume


class ApplicationStatus(models.TextChoices):
    WISHLIST = "wishlist", "Wishlist"
    APPLIED = "applied", "Applied"
    INTERVIEWING = "interviewing", "Interviewing"
    OFFER = "offer", "Offer"
    REJECTED = "rejected", "Rejected"
    ACCEPTED = "accepted", "Accepted"


class Application(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    career_profile = models.ForeignKey(
        CareerProfile,
        on_delete=models.CASCADE,
        related_name="applications",
    )
    resume = models.ForeignKey(
        Resume,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="applications",
    )
    job = models.ForeignKey(
        SavedJob,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="applications",
    )
    company = models.CharField(max_length=255)
    position = models.CharField(max_length=255)
    status = models.CharField(
        max_length=32,
        choices=ApplicationStatus.choices,
        default=ApplicationStatus.APPLIED,
    )
    applied_at = models.DateField(null=True, blank=True)
    location = models.CharField(max_length=255, blank=True, default="")
    salary = models.CharField(max_length=100, blank=True, default="")
    job_url = models.URLField(max_length=500, blank=True, default="")
    notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "application"
        verbose_name = "application"
        verbose_name_plural = "applications"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.position} at {self.company}"
