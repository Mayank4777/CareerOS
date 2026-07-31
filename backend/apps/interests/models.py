from __future__ import annotations

import uuid

from django.db import models

from apps.career_profile.models import CareerProfile


class Interest(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    career_profile = models.ForeignKey(
        CareerProfile,
        on_delete=models.CASCADE,
        related_name="interests",
    )
    name = models.CharField(max_length=255)
    display_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "interest"
        verbose_name = "interest"
        verbose_name_plural = "interests"
        ordering = ["display_order", "name"]

    def __str__(self) -> str:
        return self.name
