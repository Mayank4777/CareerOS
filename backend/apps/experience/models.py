from __future__ import annotations

import uuid

from django.db import models
from django.db.models import F, Q

from apps.career_profile.models import CareerProfile


class ExperienceEmploymentType(models.TextChoices):
    FULL_TIME = "full_time", "Full time"
    PART_TIME = "part_time", "Part time"
    CONTRACT = "contract", "Contract"
    INTERNSHIP = "internship", "Internship"
    FREELANCE = "freelance", "Freelance"
    TEMPORARY = "temporary", "Temporary"
    APPRENTICESHIP = "apprenticeship", "Apprenticeship"


class ExperienceLocationType(models.TextChoices):
    ONSITE = "onsite", "On-site"
    REMOTE = "remote", "Remote"
    HYBRID = "hybrid", "Hybrid"


class Experience(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    career_profile = models.ForeignKey(
        CareerProfile,
        on_delete=models.CASCADE,
        related_name="experiences",
    )
    designation = models.CharField(max_length=255)
    employment_type = models.CharField(max_length=32, choices=ExperienceEmploymentType.choices)
    company = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    location_type = models.CharField(max_length=32, choices=ExperienceLocationType.choices)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    currently_working = models.BooleanField(default=False)
    description = models.TextField()
    display_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "experience"
        verbose_name = "experience"
        verbose_name_plural = "experience"
        ordering = ["display_order", "-start_date"]
        indexes = [
            models.Index(fields=["career_profile", "display_order", "-start_date"], name="experience_order_idx"),
        ]
        constraints = [
            models.CheckConstraint(
                condition=Q(currently_working=True, end_date__isnull=True)
                | Q(currently_working=False, end_date__isnull=False),
                name="experience_end_date_matches_currently_working",
            ),
            models.CheckConstraint(
                condition=Q(end_date__isnull=True) | Q(start_date__lte=F("end_date")),
                name="experience_start_date_before_end_date",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.designation} at {self.company}"
