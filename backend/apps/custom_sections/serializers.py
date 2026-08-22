from __future__ import annotations

from rest_framework import serializers

from .models import CustomSection


class CustomSectionSerializer(serializers.ModelSerializer):
    display_order = serializers.IntegerField(required=False, min_value=0)

    class Meta:
        model = CustomSection
        fields = (
            "id",
            "title",
            "content",
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

    def validate_content(self, value: str) -> str:
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Content is required.")
        return value
