from __future__ import annotations

from rest_framework import serializers

from .models import VolunteerExperience
from .validators import validate_volunteer_experience_dates


class VolunteerExperienceSerializer(serializers.ModelSerializer):
    end_date = serializers.DateField(required=False, allow_null=True)
    currently_volunteering = serializers.BooleanField(required=False)
    display_order = serializers.IntegerField(required=False, min_value=0)

    class Meta:
        model = VolunteerExperience
        fields = (
            "id",
            "organization",
            "role",
            "description",
            "start_date",
            "end_date",
            "currently_volunteering",
            "display_order",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")

    def validate_organization(self, value: str) -> str:
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Organization is required.")
        return value

    def validate_role(self, value: str) -> str:
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Role is required.")
        return value

    def validate_description(self, value: str) -> str:
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Description is required.")
        return value

    def validate(self, attrs):
        instance = getattr(self, "instance", None)
        start_date = attrs.get("start_date", getattr(instance, "start_date", None))
        currently_volunteering = attrs.get(
            "currently_volunteering",
            getattr(instance, "currently_volunteering", False),
        )
        end_date = attrs.get("end_date", getattr(instance, "end_date", None))

        validate_volunteer_experience_dates(
            currently_volunteering=currently_volunteering,
            start_date=start_date,
            end_date=end_date,
        )
        return attrs
