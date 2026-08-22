from __future__ import annotations

from .models import UserSettings
from .selectors import get_user_settings


class UserSettingsService:
    def retrieve_settings(self, user) -> UserSettings:
        return get_user_settings(user)

    def update_settings(self, user, data: dict) -> UserSettings:
        settings_obj = get_user_settings(user)
        for key, value in data.items():
            setattr(settings_obj, key, value)
        settings_obj.save()
        return settings_obj
