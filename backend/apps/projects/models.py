from __future__ import annotations

import uuid

from django.db import models
from django.db.models import F, Q

from apps.career_profile.models import CareerProfile


class Project(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    career_profile = models.ForeignKey(
        CareerProfile,
        on_delete=models.CASCADE,
        related_name="projects",
    )
    title = models.CharField(max_length=255)
    organization = models.CharField(max_length=255, blank=True, default="")
    role = models.CharField(max_length=255, blank=True, default="")
    description = models.TextField()
    technologies = models.TextField()
    project_url = models.URLField(blank=True, null=True)
    github_url = models.URLField(blank=True, null=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    currently_active = models.BooleanField(default=False)
    display_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "project"
        verbose_name = "project"
        verbose_name_plural = "projects"
        ordering = ["display_order", "title"]
        constraints = [
            models.CheckConstraint(
                condition=Q(currently_active=True, end_date__isnull=True)
                | Q(currently_active=False, end_date__isnull=True)
                | Q(currently_active=False, start_date__isnull=True)
                | Q(currently_active=False, start_date__lte=F("end_date")),
                name="project_end_date_matches_currently_active",
            ),
            models.CheckConstraint(
                condition=Q(end_date__isnull=True) | Q(start_date__isnull=True) | Q(start_date__lte=F("end_date")),
                name="project_start_date_before_end_date",
            ),
        ]

    def __str__(self) -> str:
        return self.title
