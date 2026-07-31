from __future__ import annotations

from rest_framework import serializers

from .models import Achievement


class AchievementSerializer(serializers.ModelSerializer):
    achievement_date = serializers.DateField(required=False, allow_null=True)
    display_order = serializers.IntegerField(required=False, min_value=0)

    class Meta:
        model = Achievement
        fields = (
            "id",
            "title",
            "description",
            "achievement_date",
            "display_order",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")

    def validate_title(self, value: str) -> str:
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Title is required.")
        return value

    def validate_description(self, value: str) -> str:
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Description is required.")
        return value
