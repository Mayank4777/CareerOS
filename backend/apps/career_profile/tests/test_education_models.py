from __future__ import annotations

from datetime import date
from django.db import IntegrityError
from django.test import TestCase
from django.utils import timezone

from apps.accounts.models import User

from ..models import CareerProfile, Education


class EducationModelTests(TestCase):
    def test_string_representation_uses_institution_and_degree(self) -> None:
        user = User.objects.create_user(email="edu@example.com", password="strong-password")
        profile = CareerProfile.objects.create(user=user)
        education = Education.objects.create(
            career_profile=profile,
            institution="University of Example",
            degree="B.Tech",
            field_of_study="Computer Science",
            start_date=date(2020, 1, 1),
            end_date=date(2024, 1, 1),
            grade="8.5 CGPA",
        )

        self.assertEqual(str(education), "University of Example - B.Tech")

    def test_education_belongs_to_a_user(self) -> None:
        user = User.objects.create_user(email="edu2@example.com", password="strong-password")
        profile = CareerProfile.objects.create(user=user)
        Education.objects.create(
            career_profile=profile,
            institution="University of Example",
            degree="B.Tech",
            field_of_study="Computer Science",
            start_date=date(2020, 1, 1),
            end_date=date(2024, 1, 1),
            grade="8.5 CGPA",
        )

        self.assertEqual(Education.objects.filter(career_profile=profile).count(), 1)

    def test_audit_timestamps_are_populated(self) -> None:
        user = User.objects.create_user(email="edu3@example.com", password="strong-password")
        profile = CareerProfile.objects.create(user=user)
        education = Education.objects.create(
            career_profile=profile,
            institution="University of Example",
            degree="B.Tech",
            field_of_study="Computer Science",
            start_date=date(2020, 1, 1),
            end_date=date(2024, 1, 1),
            grade="8.5 CGPA",
        )

        self.assertIsNotNone(education.created_at)
        self.assertIsNotNone(education.updated_at)
        self.assertLessEqual(education.created_at, timezone.now())
        self.assertLessEqual(education.updated_at, timezone.now())
