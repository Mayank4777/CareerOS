from __future__ import annotations

import uuid

from django.conf import settings
from django.db import models


class NotificationType(models.TextChoices):
    SYSTEM = "system", "System Alert"
    APPLICATION = "application", "Application Update"
    INTERVIEW = "interview", "Interview Reminder"
    AI_SUGGESTION = "ai_suggestion", "AI Suggestion"


class Notification(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    type = models.CharField(
        max_length=32,
        choices=NotificationType.choices,
        default=NotificationType.SYSTEM,
    )
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    link = models.CharField(max_length=500, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "notification"
        verbose_name = "notification"
        verbose_name_plural = "notifications"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.title} - {self.user.email}"
