from __future__ import annotations

from rest_framework import serializers

from .models import Skill
from .validators import validate_skill_years_of_experience


class SkillSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    category = serializers.CharField(required=False, allow_blank=True)
    years_of_experience = serializers.IntegerField(required=False, allow_null=True, min_value=0)
    display_order = serializers.IntegerField(required=False, min_value=0)

    class Meta:
        model = Skill
        fields = (
            "id",
            "user",
            "name",
            "category",
            "proficiency_level",
            "years_of_experience",
            "display_order",
        )
        read_only_fields = ("id", "user")

    def get_user(self, obj):
        return obj.career_profile.user_id

    def validate_name(self, value: str) -> str:
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Name is required.")
        return value

    def validate_category(self, value: str) -> str:
        return value.strip()

    def validate_years_of_experience(self, value):
        validate_skill_years_of_experience(value)
        return value

    def validate(self, attrs):
        years = attrs.get("years_of_experience")
        validate_skill_years_of_experience(years)
        return attrs
