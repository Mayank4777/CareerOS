from __future__ import annotations

from rest_framework import serializers

from .models import ResumeSection, ResumeSectionItem
from .validators import validate_resume_section_title, validate_resume_section_type


class ResumeSectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResumeSection
        fields = (
            "id",
            "section_type",
            "title",
            "display_order",
            "is_visible",
        )
        read_only_fields = ("id",)

    def validate_section_type(self, value: str) -> str:
        value = value.strip()
        validate_resume_section_type(value)
        return value

    def validate_title(self, value: str) -> str:
        value = value.strip()
        validate_resume_section_title(value)
        return value


class ResumeSectionItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResumeSectionItem
        fields = (
            "id",
            "source_object_id",
            "display_order",
        )
        read_only_fields = ("id",)

