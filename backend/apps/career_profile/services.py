from __future__ import annotations

from typing import Any

from django.db import IntegrityError, transaction
from django.utils import timezone
from rest_framework.exceptions import NotFound

from apps.common.exceptions import ConflictException

from .models import CareerProfile
from .selectors import get_profile_by_user


class CareerProfileService:
    def create_profile(self, *, user, data: dict[str, Any]) -> CareerProfile:
        if get_profile_by_user(user) is not None:
            raise ConflictException("Career profile already exists.")

        try:
            with transaction.atomic():
                return CareerProfile.objects.create(user=user, **data)
        except IntegrityError as exc:
            raise ConflictException("Career profile already exists.") from exc

    def retrieve_profile(self, *, user) -> CareerProfile:
        profile = get_profile_by_user(user)
        if profile is None:
            raise NotFound("Career profile not found.")
        return profile

    def update_profile(self, *, user, data: dict[str, Any]) -> CareerProfile:
        profile = get_profile_by_user(user)
        if profile is None:
            raise NotFound("Career profile not found.")

        for field, value in data.items():
            setattr(profile, field, value)
        profile.updated_at = timezone.now()

        with transaction.atomic():
            profile.save(update_fields=[*data.keys(), "updated_at"])

        return profile

    def delete_profile(self, *, user) -> None:
        profile = get_profile_by_user(user)
        if profile is None:
            raise NotFound("Career profile not found.")

        with transaction.atomic():
            profile.delete()
