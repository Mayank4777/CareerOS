from __future__ import annotations

import uuid

from django.conf import settings
from django.db import models


class CareerProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="career_profile",
    )
    first_name = models.CharField(max_length=150, blank=True, default="")
    last_name = models.CharField(max_length=150, blank=True, default="")
    headline = models.CharField(max_length=255, blank=True, default="")
    summary = models.TextField(blank=True, default="")
    phone = models.CharField(max_length=32, blank=True, default="")
    location = models.CharField(max_length=255, blank=True, default="")
    website = models.URLField(blank=True, default="")
    linkedin_url = models.URLField(blank=True, default="")
    github_url = models.URLField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "career_profile"
        verbose_name = "career profile"
        verbose_name_plural = "career profiles"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        full_name = f"{self.first_name} {self.last_name}".strip()
        return full_name or self.user.get_full_name() or self.user.email


class Education(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    career_profile = models.ForeignKey(
        CareerProfile,
        on_delete=models.CASCADE,
        related_name="educations",
    )
    institution = models.CharField(max_length=255)
    degree = models.CharField(max_length=255)
    field_of_study = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField()
    grade = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "education"
        verbose_name = "education"
        verbose_name_plural = "education"

    def __str__(self) -> str:
        return f"{self.institution} - {self.degree}"
