from __future__ import annotations

from django.db.models import QuerySet

from apps.career_profile.models import CareerProfile

from .models import SavedJob


def get_user_saved_jobs(user) -> QuerySet[SavedJob]:
    profile, _ = CareerProfile.objects.get_or_create(user=user)
    return SavedJob.objects.filter(career_profile=profile)
