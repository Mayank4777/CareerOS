from __future__ import annotations

from django.db.models import QuerySet

from apps.career_profile.models import CareerProfile

from .models import Interview


def get_user_interviews(user) -> QuerySet[Interview]:
    profile, _ = CareerProfile.objects.get_or_create(user=user)
    return Interview.objects.filter(application__career_profile=profile).select_related("application")
