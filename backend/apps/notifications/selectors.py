from __future__ import annotations

from django.db.models import QuerySet

from .models import Notification


def get_user_notifications(user) -> QuerySet[Notification]:
    return Notification.objects.filter(user=user)
