from __future__ import annotations

from datetime import date

from django.test import TestCase

from apps.accounts.models import User
from apps.career_profile.models import CareerProfile

from ..models import VolunteerExperience
from ..selectors import get_volunteer_experience, list_volunteer_experiences


class VolunteerExperienceSelectorTests(TestCase):
    def test_owner_scoping(self) -> None:
        user = User.objects.create_user(email="sel@example.com", password="strong-password")
        other_user = User.objects.create_user(email="other@example.com", password="strong-password")
        profile = CareerProfile.objects.create(user=user)
        other_profile = CareerProfile.objects.create(user=other_user)
        record = VolunteerExperience.objects.create(
            career_profile=profile,
            organization="Local NGO",
            role="Mentor",
            description="Mentored students",
            start_date=date(2024, 1, 1),
            currently_volunteering=True,
        )
        VolunteerExperience.objects.create(
            career_profile=other_profile,
            organization="Charity",
            role="Helper",
            description="Helped community",
            start_date=date(2024, 2, 1),
            currently_volunteering=True,
        )

        self.assertEqual(list_volunteer_experiences(user=user).count(), 1)
        self.assertEqual(get_volunteer_experience(user=user, volunteer_experience_id=record.id), record)
        self.assertIsNone(get_volunteer_experience(user=user, volunteer_experience_id=other_profile.volunteer_experiences.first().id))
