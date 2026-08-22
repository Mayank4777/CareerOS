from __future__ import annotations

from datetime import date
from django.test import TestCase
from rest_framework.exceptions import NotFound

from apps.accounts.models import User

from ..models import CareerProfile, Education
from ..services import EducationService


class EducationServiceTests(TestCase):
    def setUp(self) -> None:
        self.service = EducationService()
        self.user = User.objects.create_user(email="service@example.com", password="strong-password")
        self.other_user = User.objects.create_user(
            email="other@example.com",
            password="strong-password",
        )
        self.profile = CareerProfile.objects.create(user=self.user)
        self.other_profile = CareerProfile.objects.create(user=self.other_user)

    def test_create_education(self) -> None:
        education = self.service.create_education(
            user=self.user,
            data={
                "institution": "Example University",
                "degree": "B.Tech",
                "field_of_study": "Computer Science",
                "start_date": date(2020, 1, 1),
                "end_date": date(2024, 1, 1),
                "grade": "8.5 CGPA",
            },
        )

        self.assertIsInstance(education, Education)
        self.assertEqual(education.career_profile, self.profile)

    def test_list_educations_returns_owner_records(self) -> None:
        own_education = Education.objects.create(
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

        records = self.service.list_educations(user=self.user)

        self.assertEqual(records.count(), 1)
        self.assertEqual(records.first(), own_education)

    def test_retrieve_education(self) -> None:
        education = Education.objects.create(
            career_profile=self.profile,
            institution="Example University",
            degree="B.Tech",
            field_of_study="Computer Science",
            start_date=date(2020, 1, 1),
            end_date=date(2024, 1, 1),
            grade="8.5 CGPA",
        )

        fetched = self.service.retrieve_education(user=self.user, education_id=education.id)

        self.assertEqual(fetched, education)

    def test_update_education(self) -> None:
        education = Education.objects.create(
            career_profile=self.profile,
            institution="Example University",
            degree="B.Tech",
            field_of_study="Computer Science",
            start_date=date(2020, 1, 1),
            end_date=date(2024, 1, 1),
            grade="8.5 CGPA",
        )

        updated = self.service.update_education(
            user=self.user,
            education_id=education.id,
            data={"grade": "9.1 CGPA"},
        )

        self.assertEqual(updated.grade, "9.1 CGPA")
        self.assertIsNotNone(updated.updated_at)

    def test_delete_education(self) -> None:
        education = Education.objects.create(
            career_profile=self.profile,
            institution="Example University",
            degree="B.Tech",
            field_of_study="Computer Science",
            start_date=date(2020, 1, 1),
            end_date=date(2024, 1, 1),
            grade="8.5 CGPA",
        )

        self.service.delete_education(user=self.user, education_id=education.id)

        self.assertFalse(Education.objects.filter(id=education.id).exists())

    def test_missing_education_raises_not_found(self) -> None:
        with self.assertRaises(NotFound):
            self.service.retrieve_education(user=self.user, education_id="00000000-0000-0000-0000-000000000000")
