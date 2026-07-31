from __future__ import annotations

from datetime import date
from types import SimpleNamespace

from django.test import TestCase

from apps.accounts.models import User
from apps.career_profile.models import CareerProfile

from ..models import Experience
from ..permissions import IsExperienceOwner


class ExperiencePermissionTests(TestCase):
    def setUp(self) -> None:
        self.owner = User.objects.create_user(email="owner@example.com", password="strong-password")
        self.other_user = User.objects.create_user(email="other@example.com", password="strong-password")
        self.profile = CareerProfile.objects.create(user=self.owner)
        self.experience = Experience.objects.create(
            career_profile=self.profile,
            designation="Software Engineer",
            employment_type="full_time",
            company="Example Inc",
            location="Remote",
            location_type="remote",
            start_date=date(2022, 1, 1),
            end_date=date(2024, 1, 1),
            currently_working=False,
            description="Built APIs",
        )
        self.permission = IsExperienceOwner()

    def test_owner_can_access_own_experience(self) -> None:
        request = SimpleNamespace(user=self.owner)

        self.assertTrue(self.permission.has_object_permission(request, None, self.experience))

    def test_other_user_cannot_access_experience(self) -> None:
        request = SimpleNamespace(user=self.other_user)

        self.assertFalse(self.permission.has_object_permission(request, None, self.experience))
