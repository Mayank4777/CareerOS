from __future__ import annotations

from rest_framework import serializers

from .models import Interest


class InterestSerializer(serializers.ModelSerializer):
    display_order = serializers.IntegerField(required=False, min_value=0)

    class Meta:
        model = Interest
        fields = (
            "id",
            "name",
            "display_order",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")

    def validate_name(self, value: str) -> str:
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Name is required.")
        return value
