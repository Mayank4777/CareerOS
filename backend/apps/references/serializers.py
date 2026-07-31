from __future__ import annotations

from rest_framework import serializers

from .models import Reference


class ReferenceSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    relationship = serializers.CharField(required=False, allow_blank=True)
    display_order = serializers.IntegerField(required=False, min_value=0)

    class Meta:
        model = Reference
        fields = (
            "id",
            "name",
            "designation",
            "company",
            "email",
            "phone",
            "relationship",
            "display_order",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")

    def validate_name(self, value: str) -> str:
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Name is required.")
        return value

    def validate_designation(self, value: str) -> str:
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Designation is required.")
        return value

    def validate_company(self, value: str) -> str:
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Company is required.")
        return value

    def validate_email(self, value: str) -> str:
        return value.strip()

    def validate_phone(self, value: str) -> str:
        return value.strip()

    def validate_relationship(self, value: str) -> str:
        return value.strip()
