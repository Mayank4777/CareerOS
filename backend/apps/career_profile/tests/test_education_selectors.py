from __future__ import annotations

from datetime import date
from django.test import TestCase

from apps.accounts.models import User

from ..models import CareerProfile, Education
from ..selectors import get_education, list_educations


class EducationSelectorTests(TestCase):
    def setUp(self) -> None:
        self.user = User.objects.create_user(email="selector@example.com", password="strong-password")
        self.other_user = User.objects.create_user(
            email="selector-other@example.com",
            password="strong-password",
        )
        self.profile = CareerProfile.objects.create(user=self.user)
        self.other_profile = CareerProfile.objects.create(user=self.other_user)
        self.education = Education.objects.create(
            career_profile=self.profile,
            institution="Example University",
            degree="B.Tech",
            field_of_study="Computer Science",
            start_date=date(2020, 1, 1),
            end_date=date(2024, 1, 1),
            grade="8.5 CGPA",
        )
        Education.objects.create(
            career_profile=self.other_profile,
            institution="Other University",
            degree="M.Tech",
            field_of_study="Data Science",
            start_date=date(2021, 1, 1),
            end_date=date(2023, 1, 1),
            grade="9.0 CGPA",
        )

    def test_list_educations_returns_only_owner_records(self) -> None:
        records = list_educations(user=self.user)

        self.assertEqual(records.count(), 1)
        self.assertEqual(records.first(), self.education)

    def test_get_education_returns_owner_record(self) -> None:
        record = get_education(user=self.user, education_id=self.education.id)

        self.assertEqual(record, self.education)

    def test_get_education_returns_none_for_other_users_record(self) -> None:
        record = get_education(user=self.user, education_id=self.other_profile.educations.first().id)

        self.assertIsNone(record)
