from __future__ import annotations

import uuid

from django.conf import settings
from django.db import models


class UserSettings(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="settings",
    )
    theme = models.CharField(max_length=20, default="system")
    timezone = models.CharField(max_length=100, default="UTC")
    language = models.CharField(max_length=20, default="en")
    email_notifications = models.BooleanField(default=True)
    ai_preferences = models.JSONField(default=dict, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "user_settings"
        verbose_name = "user settings"
        verbose_name_plural = "user settings"

    def __str__(self) -> str:
        return f"Settings for {self.user.email}"
