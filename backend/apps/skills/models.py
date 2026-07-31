from __future__ import annotations

import uuid

from django.db import models

from apps.career_profile.models import CareerProfile


class SkillProficiencyLevel(models.TextChoices):
    BEGINNER = "beginner", "Beginner"
    INTERMEDIATE = "intermediate", "Intermediate"
    ADVANCED = "advanced", "Advanced"
    EXPERT = "expert", "Expert"


class Skill(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    career_profile = models.ForeignKey(
        CareerProfile,
        on_delete=models.CASCADE,
        related_name="skills",
    )
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=100, blank=True, default="")
    proficiency_level = models.CharField(max_length=32, choices=SkillProficiencyLevel.choices)
    years_of_experience = models.PositiveIntegerField(null=True, blank=True)
    display_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "skill"
        verbose_name = "skill"
        verbose_name_plural = "skills"
        ordering = ["display_order", "name"]

    def __str__(self) -> str:
        return self.name
