from __future__ import annotations

from rest_framework import serializers

from .models import Resume, ResumeVersion
from .validators import validate_resume_title


class ResumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = (
            "id",
            "title",
            "target_role",
            "job_description",
            "template",
            "status",
            "content_data",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")

    def validate_title(self, value: str) -> str:
        value = value.strip()
        validate_resume_title(value)
        return value

    def validate_template(self, value: str) -> str:
        return value.strip()


class ResumeGenerateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255)
    target_role = serializers.CharField(max_length=255, required=False, allow_blank=True, default="")
    job_description = serializers.CharField(required=False, allow_blank=True, default="")
    template = serializers.CharField(max_length=100, required=False, default="modern")


class ResumeVersionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResumeVersion
        fields = (
            "id",
            "version_number",
            "title",
            "commit_message",
            "tags",
            "snapshot_data",
            "created_at",
        )
        read_only_fields = ("id", "created_at")


class ResumeVersionCreateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255)
    commit_message = serializers.CharField(required=False, allow_blank=True, default="")
    tags = serializers.ListField(child=serializers.CharField(), required=False, default=list)


class ApplySuggestionSerializer(serializers.Serializer):
    section_key = serializers.CharField()
    original_text = serializers.CharField()
    suggested_text = serializers.CharField()

