from __future__ import annotations

from datetime import date

from django.test import TestCase

from apps.accounts.models import User
from apps.career_profile.models import CareerProfile

from ..models import VolunteerExperience


class VolunteerExperienceModelTests(TestCase):
    def test_string_representation_and_ownership(self) -> None:
        user = User.objects.create_user(email="vol@example.com", password="strong-password")
        profile = CareerProfile.objects.create(user=user)
        record = VolunteerExperience.objects.create(
            career_profile=profile,
            organization="Local NGO",
            role="Mentor",
            description="Mentored students",
            start_date=date(2024, 1, 1),
            currently_volunteering=True,
        )

        self.assertEqual(str(record), "Mentor at Local NGO")
        self.assertEqual(profile.volunteer_experiences.count(), 1)
