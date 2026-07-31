from __future__ import annotations

from typing import Any

from django.db import transaction
from rest_framework.exceptions import NotFound

from apps.career_profile.selectors import get_profile_by_user

from .models import Certification
from .selectors import get_certification, list_certifications


class CertificationService:
    def create_certification(self, *, user, data: dict[str, Any]) -> Certification:
        profile = get_profile_by_user(user)
        if profile is None:
            raise NotFound("Career profile not found.")

        with transaction.atomic():
            return Certification.objects.create(career_profile=profile, **data)

    def list_certifications(self, *, user):
        return list_certifications(user=user)

    def retrieve_certification(self, *, user, certification_id) -> Certification:
        certification = get_certification(user=user, certification_id=certification_id)
        if certification is None:
            raise NotFound("Certification not found.")
        return certification

    def update_certification(self, *, user, certification_id, data: dict[str, Any]) -> Certification:
        certification = get_certification(user=user, certification_id=certification_id)
        if certification is None:
            raise NotFound("Certification not found.")

        for field, value in data.items():
            setattr(certification, field, value)

        with transaction.atomic():
            certification.save(update_fields=[*data.keys(), "updated_at"])

        return certification

    def delete_certification(self, *, user, certification_id) -> None:
        certification = get_certification(user=user, certification_id=certification_id)
        if certification is None:
            raise NotFound("Certification not found.")

        with transaction.atomic():
            certification.delete()
