from __future__ import annotations

from datetime import date
from types import SimpleNamespace

from django.test import TestCase

from apps.accounts.models import User

from ..models import CareerProfile, Education
from ..permissions import IsEducationOwner


class EducationPermissionTests(TestCase):
    def setUp(self) -> None:
        self.owner = User.objects.create_user(email="owner@example.com", password="strong-password")
        self.other_user = User.objects.create_user(email="other@example.com", password="strong-password")
        self.owner_profile = CareerProfile.objects.create(user=self.owner)
        self.education = Education.objects.create(
            career_profile=self.owner_profile,
            institution="Example University",
            degree="B.Tech",
            field_of_study="Computer Science",
            start_date=date(2020, 1, 1),
            end_date=date(2024, 1, 1),
            grade="8.5 CGPA",
        )
        self.permission = IsEducationOwner()

    def test_owner_can_access_own_education(self) -> None:
        request = SimpleNamespace(user=self.owner)

        self.assertTrue(self.permission.has_object_permission(request, None, self.education))

    def test_other_user_cannot_access_education(self) -> None:
        request = SimpleNamespace(user=self.other_user)

        self.assertFalse(self.permission.has_object_permission(request, None, self.education))
