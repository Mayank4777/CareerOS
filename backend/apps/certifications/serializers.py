from __future__ import annotations

from rest_framework import serializers

from .models import Certification
from .validators import validate_certification_dates


class CertificationSerializer(serializers.ModelSerializer):
    credential_id = serializers.CharField(required=False, allow_blank=True)
    credential_url = serializers.URLField(required=False, allow_null=True, allow_blank=True)
    expiry_date = serializers.DateField(required=False, allow_null=True)
    does_not_expire = serializers.BooleanField(required=False)
    display_order = serializers.IntegerField(required=False, min_value=0)

    class Meta:
        model = Certification
        fields = (
            "id",
            "name",
            "issuing_organization",
            "credential_id",
            "credential_url",
            "issue_date",
            "expiry_date",
            "does_not_expire",
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

    def validate_issuing_organization(self, value: str) -> str:
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Issuing organization is required.")
        return value

    def validate_credential_id(self, value: str) -> str:
        return value.strip()

    def validate(self, attrs):
        instance = getattr(self, "instance", None)
        does_not_expire = attrs.get("does_not_expire", getattr(instance, "does_not_expire", False))
        issue_date = attrs.get("issue_date", getattr(instance, "issue_date", None))
        expiry_date = attrs.get("expiry_date", getattr(instance, "expiry_date", None))

        validate_certification_dates(
            does_not_expire=does_not_expire,
            issue_date=issue_date,
            expiry_date=expiry_date,
        )
        return attrs
