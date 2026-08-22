from __future__ import annotations

import uuid

from django.db import models

from apps.career_profile.models import CareerProfile


class Publication(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    career_profile = models.ForeignKey(
        CareerProfile,
        on_delete=models.CASCADE,
        related_name="publications",
    )
    title = models.CharField(max_length=255)
    publisher = models.CharField(max_length=255)
    publication_date = models.DateField()
    publication_url = models.URLField(blank=True, null=True)
    description = models.TextField(blank=True, default="")
    display_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "publication"
        verbose_name = "publication"
        verbose_name_plural = "publications"
        ordering = ["display_order", "title"]

    def __str__(self) -> str:
        return self.title
