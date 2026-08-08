from __future__ import annotations

from rest_framework import serializers

from .models import SavedJob


class SavedJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedJob
        fields = [
            "id",
            "title",
            "company",
            "location",
            "salary_range",
            "source",
            "url",
            "status",
            "description",
            "saved_at",
            "updated_at",
        ]
        read_only_fields = ["id", "saved_at", "updated_at"]
