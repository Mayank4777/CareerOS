from __future__ import annotations

from datetime import date

from django.test import TestCase
from rest_framework.exceptions import NotFound

from apps.accounts.models import User
from apps.career_profile.models import CareerProfile

from ..models import VolunteerExperience
from ..services import VolunteerExperienceService


class VolunteerExperienceServiceTests(TestCase):
    def test_crud_and_not_found(self) -> None:
        user = User.objects.create_user(email="srv@example.com", password="strong-password")
        profile = CareerProfile.objects.create(user=user)
        service = VolunteerExperienceService()

        record = service.create_volunteer_experience(
            user=user,
            data={
                "organization": "Local NGO",
                "role": "Mentor",
                "description": "Mentored students",
                "start_date": date(2024, 1, 1),
                "currently_volunteering": True,
            },
        )
        self.assertEqual(record.career_profile, profile)

        fetched = service.retrieve_volunteer_experience(user=user, volunteer_experience_id=record.id)
        self.assertEqual(fetched, record)

        updated = service.update_volunteer_experience(
            user=user,
            volunteer_experience_id=record.id,
            data={"role": "Lead Mentor"},
        )
        self.assertEqual(updated.role, "Lead Mentor")

        service.delete_volunteer_experience(user=user, volunteer_experience_id=record.id)
        self.assertFalse(VolunteerExperience.objects.filter(id=record.id).exists())

        with self.assertRaises(NotFound):
            service.retrieve_volunteer_experience(user=user, volunteer_experience_id="00000000-0000-0000-0000-000000000000")
