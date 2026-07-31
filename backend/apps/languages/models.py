from __future__ import annotations

import uuid

from django.db import models

from apps.career_profile.models import CareerProfile


class LanguageProficiency(models.TextChoices):
    BEGINNER = "beginner", "Beginner"
    INTERMEDIATE = "intermediate", "Intermediate"
    PROFESSIONAL = "professional", "Professional"
    NATIVE = "native", "Native"


class Language(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    career_profile = models.ForeignKey(
        CareerProfile,
        on_delete=models.CASCADE,
        related_name="languages",
    )
    language = models.CharField(max_length=255)
    proficiency = models.CharField(max_length=32, choices=LanguageProficiency.choices)
    display_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "language"
        verbose_name = "language"
        verbose_name_plural = "languages"
        ordering = ["display_order", "language"]

    def __str__(self) -> str:
        return self.language
