from __future__ import annotations

from typing import Any

from django.db import transaction
from rest_framework.exceptions import NotFound

from apps.career_profile.selectors import get_profile_by_user

from .models import Skill
from .selectors import get_skill, list_skills


class SkillService:
    def create_skill(self, *, user, data: dict[str, Any]) -> Skill:
        profile = get_profile_by_user(user)
        if profile is None:
            raise NotFound("Career profile not found.")

        with transaction.atomic():
            return Skill.objects.create(career_profile=profile, **data)

    def list_skills(self, *, user):
        return list_skills(user=user)

    def retrieve_skill(self, *, user, skill_id) -> Skill:
        skill = get_skill(user=user, skill_id=skill_id)
        if skill is None:
            raise NotFound("Skill not found.")
        return skill

    def update_skill(self, *, user, skill_id, data: dict[str, Any]) -> Skill:
        skill = get_skill(user=user, skill_id=skill_id)
        if skill is None:
            raise NotFound("Skill not found.")

        for field, value in data.items():
            setattr(skill, field, value)

        with transaction.atomic():
            skill.save(update_fields=[*data.keys(), "updated_at"])

        return skill

    def delete_skill(self, *, user, skill_id) -> None:
        skill = get_skill(user=user, skill_id=skill_id)
        if skill is None:
            raise NotFound("Skill not found.")

        with transaction.atomic():
            skill.delete()
