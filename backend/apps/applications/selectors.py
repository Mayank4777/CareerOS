from __future__ import annotations

from django.db.models import QuerySet

from apps.career_profile.models import CareerProfile

from .models import Application


def get_user_applications(user) -> QuerySet[Application]:
    profile, _ = CareerProfile.objects.get_or_create(user=user)
    return Application.objects.filter(career_profile=profile)
