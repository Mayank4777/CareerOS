from __future__ import annotations

from typing import Any

from django.db import transaction
from rest_framework.exceptions import NotFound

from apps.career_profile.selectors import get_profile_by_user

from .models import Award
from .selectors import get_award, list_awards


class AwardService:
    def create_award(self, *, user, data: dict[str, Any]) -> Award:
        profile = get_profile_by_user(user)
        if profile is None:
            raise NotFound("Career profile not found.")

        with transaction.atomic():
            return Award.objects.create(career_profile=profile, **data)

    def list_awards(self, *, user):
        return list_awards(user=user)

    def retrieve_award(self, *, user, award_id) -> Award:
        award = get_award(user=user, award_id=award_id)
        if award is None:
            raise NotFound("Award not found.")
        return award

    def update_award(self, *, user, award_id, data: dict[str, Any]) -> Award:
        award = get_award(user=user, award_id=award_id)
        if award is None:
            raise NotFound("Award not found.")

        for field, value in data.items():
            setattr(award, field, value)

        with transaction.atomic():
            award.save(update_fields=[*data.keys(), "updated_at"])

        return award

    def delete_award(self, *, user, award_id) -> None:
        award = get_award(user=user, award_id=award_id)
        if award is None:
            raise NotFound("Award not found.")

        with transaction.atomic():
            award.delete()
