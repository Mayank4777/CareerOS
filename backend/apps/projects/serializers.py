from __future__ import annotations

from rest_framework import serializers

from .models import Project
from .validators import validate_project_dates


class ProjectSerializer(serializers.ModelSerializer):
    display_order = serializers.IntegerField(required=False, min_value=0)
    project_url = serializers.URLField(required=False, allow_null=True, allow_blank=True)
    github_url = serializers.URLField(required=False, allow_null=True, allow_blank=True)
    start_date = serializers.DateField(required=False, allow_null=True)
    end_date = serializers.DateField(required=False, allow_null=True)
    currently_active = serializers.BooleanField(required=False)

    class Meta:
        model = Project
        fields = (
            "id",
            "title",
            "organization",
            "role",
            "description",
            "technologies",
            "project_url",
            "github_url",
            "start_date",
            "end_date",
            "currently_active",
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

    def validate_organization(self, value: str) -> str:
        return value.strip()

    def validate_role(self, value: str) -> str:
        return value.strip()

    def validate_description(self, value: str) -> str:
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Description is required.")
        return value

    def validate_technologies(self, value: str) -> str:
        return value.strip()

    def validate(self, attrs):
        instance = getattr(self, "instance", None)
        currently_active = attrs.get("currently_active", getattr(instance, "currently_active", False))
        start_date = attrs.get("start_date", getattr(instance, "start_date", None))
        end_date = attrs.get("end_date", getattr(instance, "end_date", None))

        validate_project_dates(
            currently_active=currently_active,
            start_date=start_date,
            end_date=end_date,
        )
        return attrs
