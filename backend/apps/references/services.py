from __future__ import annotations

from typing import Any

from django.db import transaction
from rest_framework.exceptions import NotFound

from apps.career_profile.selectors import get_profile_by_user

from .models import Reference
from .selectors import get_reference, list_references


class ReferenceService:
    def create_reference(self, *, user, data: dict[str, Any]) -> Reference:
        profile = get_profile_by_user(user)
        if profile is None:
            raise NotFound("Career profile not found.")

        with transaction.atomic():
            return Reference.objects.create(career_profile=profile, **data)

    def list_references(self, *, user):
        return list_references(user=user)

    def retrieve_reference(self, *, user, reference_id) -> Reference:
        reference = get_reference(user=user, reference_id=reference_id)
        if reference is None:
            raise NotFound("Reference not found.")
        return reference

    def update_reference(self, *, user, reference_id, data: dict[str, Any]) -> Reference:
        reference = get_reference(user=user, reference_id=reference_id)
        if reference is None:
            raise NotFound("Reference not found.")

        for field, value in data.items():
            setattr(reference, field, value)

        with transaction.atomic():
            reference.save(update_fields=[*data.keys(), "updated_at"])

        return reference

    def delete_reference(self, *, user, reference_id) -> None:
        reference = get_reference(user=user, reference_id=reference_id)
        if reference is None:
            raise NotFound("Reference not found.")

        with transaction.atomic():
            reference.delete()
