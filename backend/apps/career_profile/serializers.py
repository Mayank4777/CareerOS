from __future__ import annotations

from rest_framework import serializers

from .models import CareerProfile


class CareerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CareerProfile
        fields = (
            "id",
            "user",
            "first_name",
            "last_name",
            "headline",
            "summary",
            "phone",
            "location",
            "website",
            "linkedin_url",
            "github_url",
        )
        read_only_fields = ("id", "user")

    def validate_first_name(self, value: str) -> str:
        return value.strip()

    def validate_last_name(self, value: str) -> str:
        return value.strip()

    def validate_headline(self, value: str) -> str:
        return value.strip()

    def validate_summary(self, value: str) -> str:
        return value.strip()

    def validate_phone(self, value: str) -> str:
        return value.strip()

    def validate_location(self, value: str) -> str:
        return value.strip()
