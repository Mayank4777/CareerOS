from __future__ import annotations

import uuid

from django.db import models

from apps.resumes.models import Resume


class ResumeSection(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    resume = models.ForeignKey(
        Resume,
        on_delete=models.CASCADE,
        related_name="sections",
    )
    section_type = models.CharField(max_length=64)
    title = models.CharField(max_length=255)
    display_order = models.PositiveIntegerField(default=0)
    is_visible = models.BooleanField(default=True)

    class Meta:
        db_table = "resume_section"
        verbose_name = "resume section"
        verbose_name_plural = "resume sections"
        ordering = ["display_order", "title"]
        indexes = [
            models.Index(fields=["resume", "display_order"], name="resume_section_order_idx"),
        ]

    def __str__(self) -> str:
        return self.title


class ResumeSectionItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    resume_section = models.ForeignKey(
        ResumeSection,
        on_delete=models.CASCADE,
        related_name="items",
    )
    source_object_id = models.UUIDField()
    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "resume_section_item"
        verbose_name = "resume section item"
        verbose_name_plural = "resume section items"
        ordering = ["display_order", "id"]
        constraints = [
            models.UniqueConstraint(
                fields=["resume_section", "source_object_id"],
                name="resume_section_item_unique_source_object",
            ),
        ]
        indexes = [
            models.Index(fields=["resume_section", "display_order"], name="resume_item_order_idx"),
        ]

    def __str__(self) -> str:
        return str(self.source_object_id)
