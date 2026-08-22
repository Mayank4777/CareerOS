from __future__ import annotations

from rest_framework import serializers

from .models import Language


class LanguageSerializer(serializers.ModelSerializer):
    display_order = serializers.IntegerField(required=False, min_value=0)

    class Meta:
        model = Language
        fields = (
            "id",
            "language",
            "proficiency",
            "display_order",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")

    def validate_language(self, value: str) -> str:
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Language is required.")
        return value
