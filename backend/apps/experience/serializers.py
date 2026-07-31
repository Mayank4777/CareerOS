from __future__ import annotations

from rest_framework import serializers

from .models import Experience
from .validators import validate_experience_dates


class ExperienceSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    end_date = serializers.DateField(required=False, allow_null=True)
    display_order = serializers.IntegerField(required=False, min_value=0)

    class Meta:
        model = Experience
        fields = (
            "id",
            "user",
            "designation",
            "employment_type",
            "company",
            "location",
            "location_type",
            "start_date",
            "end_date",
            "currently_working",
            "description",
            "display_order",
        )
        read_only_fields = ("id", "user")

    def get_user(self, obj):
        return obj.career_profile.user_id

    def validate_designation(self, value: str) -> str:
        return value.strip()

    def validate_company(self, value: str) -> str:
        return value.strip()

    def validate_location(self, value: str) -> str:
        return value.strip()

    def validate_description(self, value: str) -> str:
        return value.strip()

    def validate(self, attrs):
        instance = getattr(self, "instance", None)
        start_date = attrs.get("start_date", getattr(instance, "start_date", None))
        currently_working = attrs.get(
            "currently_working",
            getattr(instance, "currently_working", False),
        )

        if currently_working:
            if "end_date" in attrs and attrs["end_date"] is not None:
                raise serializers.ValidationError(
                    {"end_date": "End date must be null when currently working is true."}
                )
            attrs["end_date"] = None
        end_date = attrs.get("end_date", getattr(instance, "end_date", None))

        validate_experience_dates(
            currently_working=currently_working,
            start_date=start_date,
            end_date=end_date,
        )
        return attrs
