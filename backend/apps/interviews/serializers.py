from __future__ import annotations

from rest_framework import serializers

from .models import Interview


class InterviewSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source="application.company", read_only=True)
    position_name = serializers.CharField(source="application.position", read_only=True)

    class Meta:
        model = Interview
        fields = [
            "id",
            "application",
            "company_name",
            "position_name",
            "round",
            "interview_type",
            "scheduled_at",
            "status",
            "location_or_link",
            "interviewer_name",
            "notes",
            "feedback",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "company_name", "position_name", "created_at", "updated_at"]
