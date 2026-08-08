from __future__ import annotations

from rest_framework import serializers

from .models import Resume
from .validators import validate_resume_title


class ResumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = (
            "id",
            "title",
            "template",
            "status",
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
