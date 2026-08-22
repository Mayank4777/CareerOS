from __future__ import annotations

import uuid

from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from apps.career_profile.models import CareerProfile


class JobStatus(models.TextChoices):
    SAVED = "saved", "Saved"
    APPLIED = "applied", "Applied"
    ARCHIVED = "archived", "Archived"


class SavedJob(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    career_profile = models.ForeignKey(
        CareerProfile,
        on_delete=models.CASCADE,
        related_name="saved_jobs",
    )
    title = models.CharField(max_length=255)
    company = models.CharField(max_length=255)
    location = models.CharField(max_length=255, blank=True, default="")
    salary_range = models.CharField(max_length=100, blank=True, default="")
    source = models.CharField(max_length=100, blank=True, default="")
    url = models.URLField(max_length=500, blank=True, default="")
    status = models.CharField(
        max_length=32,
        choices=JobStatus.choices,
        default=JobStatus.SAVED,
    )
    description = models.TextField(blank=True, default="")
    saved_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "saved_job"
        verbose_name = "saved job"
        verbose_name_plural = "saved jobs"
        ordering = ["-saved_at"]

    def __str__(self) -> str:
        return f"{self.title} at {self.company}"


class JobMatchAnalysis(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job = models.ForeignKey(
        SavedJob,
        on_delete=models.CASCADE,
        related_name="match_analyses",
    )
    resume = models.ForeignKey(
        "resumes.Resume",
        on_delete=models.CASCADE,
        related_name="job_matches",
    )
    match_score = models.PositiveIntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    strengths = models.JSONField(default=list, blank=True)
    missing_skills = models.JSONField(default=list, blank=True)
    gaps = models.JSONField(default=list, blank=True)
    recommendations = models.JSONField(default=list, blank=True)
    analyzed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "job_match_analysis"
        verbose_name = "job match analysis"
        verbose_name_plural = "job match analyses"
        ordering = ["-analyzed_at"]

    def __str__(self) -> str:
        return f"Match {self.match_score}% for {self.job.title}"


class SkillGapAnalysis(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    career_profile = models.ForeignKey(
        CareerProfile,
        on_delete=models.CASCADE,
        related_name="skill_gap_analyses",
    )
    job = models.ForeignKey(
        SavedJob,
        on_delete=models.CASCADE,
        related_name="skill_gap_analyses",
    )
    matched_skills = models.JSONField(default=list, blank=True)
    missing_skills = models.JSONField(default=list, blank=True)
    partial_skills = models.JSONField(default=list, blank=True)
    recommendations = models.JSONField(default=list, blank=True)
    analyzed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "skill_gap_analysis"
        verbose_name = "skill gap analysis"
        verbose_name_plural = "skill gap analyses"
        ordering = ["-analyzed_at"]

    def __str__(self) -> str:
        return f"Skill Gap Analysis for {self.job.title}"
