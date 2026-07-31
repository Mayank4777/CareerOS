from __future__ import annotations

import uuid

from django.db import models

from apps.career_profile.models import CareerProfile


class Reference(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    career_profile = models.ForeignKey(
        CareerProfile,
        on_delete=models.CASCADE,
        related_name="references",
    )
    name = models.CharField(max_length=255)
    designation = models.CharField(max_length=255)
    company = models.CharField(max_length=255)
    email = models.EmailField(blank=True, default="")
    phone = models.CharField(max_length=32, blank=True, default="")
    relationship = models.CharField(max_length=255, blank=True, default="")
    display_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "reference"
        verbose_name = "reference"
        verbose_name_plural = "references"
        ordering = ["display_order", "name"]

    def __str__(self) -> str:
        return self.name
