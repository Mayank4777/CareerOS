from __future__ import annotations

import uuid

from django.conf import settings
from django.db import models


class AIHistory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="ai_history",
    )
    feature = models.CharField(max_length=100)
    provider = models.CharField(max_length=100, default="openai")
    model = models.CharField(max_length=100, default="gpt-4o")
    prompt_tokens = models.PositiveIntegerField(default=0)
    completion_tokens = models.PositiveIntegerField(default=0)
    total_tokens = models.PositiveIntegerField(default=0)
    response_data = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "ai_history"
        verbose_name = "AI history record"
        verbose_name_plural = "AI history records"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.feature} for {self.user.email}"


class RoadmapStatus(models.TextChoices):
    NOT_STARTED = "not_started", "Not Started"
    IN_PROGRESS = "in_progress", "In Progress"
    COMPLETED = "completed", "Completed"
    ARCHIVED = "archived", "Archived"


class PhaseStatus(models.TextChoices):
    UPCOMING = "upcoming", "Upcoming"
    IN_PROGRESS = "in_progress", "In Progress"
    COMPLETED = "completed", "Completed"


class CareerRoadmap(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    career_profile = models.ForeignKey(
        "career_profile.CareerProfile",
        on_delete=models.CASCADE,
        related_name="roadmaps",
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    target_role = models.CharField(max_length=255, blank=True, default="")
    target_job = models.ForeignKey(
        "jobs.SavedJob",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="roadmaps",
    )
    status = models.CharField(
        max_length=32,
        choices=RoadmapStatus.choices,
        default=RoadmapStatus.IN_PROGRESS,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "career_roadmap"
        verbose_name = "career roadmap"
        verbose_name_plural = "career roadmaps"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Roadmap: {self.title}"


class RoadmapPhase(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    roadmap = models.ForeignKey(
        CareerRoadmap,
        on_delete=models.CASCADE,
        related_name="phases",
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    objective = models.TextField(blank=True, default="")
    skills = models.JSONField(default=list, blank=True)
    actions = models.JSONField(default=list, blank=True)
    status = models.CharField(
        max_length=32,
        choices=PhaseStatus.choices,
        default=PhaseStatus.UPCOMING,
    )
    ordering = models.PositiveIntegerField(default=1)
    estimated_duration = models.CharField(max_length=100, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "roadmap_phase"
        verbose_name = "roadmap phase"
        verbose_name_plural = "roadmap phases"
        ordering = ["ordering", "created_at"]

    def __str__(self) -> str:
        return f"Phase {self.ordering}: {self.title}"
