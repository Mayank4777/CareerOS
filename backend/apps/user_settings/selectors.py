from __future__ import annotations

from .models import UserSettings


def get_user_settings(user) -> UserSettings:
    user_settings, _ = UserSettings.objects.get_or_create(user=user)
    return user_settings
