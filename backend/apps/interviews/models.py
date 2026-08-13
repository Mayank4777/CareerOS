from __future__ import annotations

import uuid

from django.db import models

from apps.applications.models import Application


class InterviewType(models.TextChoices):
    SCREENING = "screening", "Screening Call"
    TECHNICAL = "technical", "Technical Interview"
    BEHAVIORAL = "behavioral", "Behavioral Interview"
    SYSTEM_DESIGN = "system_design", "System Design"
    HR = "hr", "HR / Culture Fit"
    FINAL = "final", "Final Round"


class InterviewStatus(models.TextChoices):
    SCHEDULED = "scheduled", "Scheduled"
    COMPLETED = "completed", "Completed"
    CANCELLED = "cancelled", "Cancelled"
    RESCHEDULED = "rescheduled", "Rescheduled"


class Interview(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    application = models.ForeignKey(
        Application,
        on_delete=models.CASCADE,
        related_name="interviews",
    )
    round = models.CharField(max_length=100, blank=True, default="Round 1")
    interview_type = models.CharField(
        max_length=32,
        choices=InterviewType.choices,
        default=InterviewType.TECHNICAL,
    )
    scheduled_at = models.DateTimeField()
    status = models.CharField(
        max_length=32,
        choices=InterviewStatus.choices,
        default=InterviewStatus.SCHEDULED,
    )
    location_or_link = models.CharField(max_length=500, blank=True, default="")
    interviewer_name = models.CharField(max_length=255, blank=True, default="")
    notes = models.TextField(blank=True, default="")
    feedback = models.TextField(blank=True, default="")
    ai_prep_data = models.JSONField(default=dict, blank=True)
    prep_notes = models.TextField(blank=True, default="")
    reflection = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "interview"
        verbose_name = "interview"
        verbose_name_plural = "interviews"
        ordering = ["scheduled_at"]

    def __str__(self) -> str:
        return f"{self.round} - {self.application.company}"
