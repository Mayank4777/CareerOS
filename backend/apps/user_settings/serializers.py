from __future__ import annotations

from rest_framework import serializers

from .models import UserSettings


class UserSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSettings
        fields = [
            "id",
            "theme",
            "timezone",
            "language",
            "email_notifications",
            "ai_preferences",
            "updated_at",
        ]
        read_only_fields = ["id", "updated_at"]


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)
