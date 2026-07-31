from __future__ import annotations

from rest_framework import serializers

from .models import Publication


class PublicationSerializer(serializers.ModelSerializer):
    publication_url = serializers.URLField(required=False, allow_null=True, allow_blank=True)
    description = serializers.CharField(required=False, allow_blank=True)
    display_order = serializers.IntegerField(required=False, min_value=0)

    class Meta:
        model = Publication
        fields = (
            "id",
            "title",
            "publisher",
            "publication_date",
            "publication_url",
            "description",
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

    def validate_publisher(self, value: str) -> str:
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Publisher is required.")
        return value

    def validate_description(self, value: str) -> str:
        return value.strip()
