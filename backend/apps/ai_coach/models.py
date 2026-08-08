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
