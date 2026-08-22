from __future__ import annotations

from typing import Any

from django.db import transaction
from rest_framework.exceptions import NotFound

from apps.career_profile.selectors import get_profile_by_user

from .models import Interest
from .selectors import get_interest, list_interests


class InterestService:
    def create_interest(self, *, user, data: dict[str, Any]) -> Interest:
        profile = get_profile_by_user(user)
        if profile is None:
            raise NotFound("Career profile not found.")

        with transaction.atomic():
            return Interest.objects.create(career_profile=profile, **data)

    def list_interests(self, *, user):
        return list_interests(user=user)

    def retrieve_interest(self, *, user, interest_id) -> Interest:
        interest = get_interest(user=user, interest_id=interest_id)
        if interest is None:
            raise NotFound("Interest not found.")
        return interest

    def update_interest(self, *, user, interest_id, data: dict[str, Any]) -> Interest:
        interest = get_interest(user=user, interest_id=interest_id)
        if interest is None:
            raise NotFound("Interest not found.")

        for field, value in data.items():
            setattr(interest, field, value)

        with transaction.atomic():
            interest.save(update_fields=[*data.keys(), "updated_at"])

        return interest

    def delete_interest(self, *, user, interest_id) -> None:
        interest = get_interest(user=user, interest_id=interest_id)
        if interest is None:
            raise NotFound("Interest not found.")

        with transaction.atomic():
            interest.delete()
