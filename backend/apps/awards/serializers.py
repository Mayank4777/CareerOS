from __future__ import annotations

from rest_framework import serializers

from .models import Award


class AwardSerializer(serializers.ModelSerializer):
    description = serializers.CharField(required=False, allow_blank=True)
    display_order = serializers.IntegerField(required=False, min_value=0)

    class Meta:
        model = Award
        fields = (
            "id",
            "title",
            "issuer",
            "award_date",
            "description",
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

    def validate_issuer(self, value: str) -> str:
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Issuer is required.")
        return value

    def validate_description(self, value: str) -> str:
        return value.strip()
