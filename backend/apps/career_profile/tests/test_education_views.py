from __future__ import annotations

from datetime import date
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from apps.accounts.models import User

from ..models import CareerProfile, Education


class EducationAPIViewTests(APITestCase):
    def setUp(self) -> None:
        self.client = APIClient()
        self.list_url = reverse("career_profile:education-list")
        self.user = User.objects.create_user(email="view@example.com", password="strong-password")
        self.other_user = User.objects.create_user(
            email="other@example.com",
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
        self.other_education = Education.objects.create(
            career_profile=self.other_profile,
            institution="Other University",
            degree="M.Tech",
            field_of_study="Data Science",
            start_date=date(2021, 1, 1),
            end_date=date(2023, 1, 1),
            grade="9.0 CGPA",
        )
        self.detail_url = reverse("career_profile:education-detail", kwargs={"education_id": self.education.id})
        self.other_detail_url = reverse(
            "career_profile:education-detail",
            kwargs={"education_id": self.other_education.id},
        )

    def authenticate(self, user: User) -> None:
        self.client.force_authenticate(user=user)

    def test_authentication_required(self) -> None:
        response = self.client.get(self.list_url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_education(self) -> None:
        self.authenticate(self.user)

        response = self.client.post(
            self.list_url,
            data={
                "institution": "New University",
                "degree": "M.Tech",
                "field_of_study": "AI",
                "start_date": "2024-01-01",
                "end_date": "2026-01-01",
                "grade": "9.2 CGPA",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["data"]["institution"], "New University")
        self.assertEqual(Education.objects.filter(career_profile=self.profile).count(), 2)

    def test_list_own_educations(self) -> None:
        self.authenticate(self.user)

        response = self.client.get(self.list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["data"]), 1)
        self.assertEqual(response.data["data"][0]["institution"], "Example University")

    def test_retrieve_own_education(self) -> None:
        self.authenticate(self.user)

        response = self.client.get(self.detail_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["degree"], "B.Tech")

    def test_cannot_access_another_users_education(self) -> None:
        self.authenticate(self.user)

        response = self.client.get(self.other_detail_url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_own_education(self) -> None:
        self.authenticate(self.user)

        response = self.client.patch(
            self.detail_url,
            data={"grade": "9.0 CGPA"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["grade"], "9.0 CGPA")

    def test_delete_own_education(self) -> None:
        self.authenticate(self.user)

        response = self.client.delete(self.detail_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(Education.objects.filter(id=self.education.id).exists())

    def test_validation_error_for_missing_required_field(self) -> None:
        self.authenticate(self.user)

        response = self.client.post(
            self.list_url,
            data={
                "degree": "M.Tech",
                "field_of_study": "AI",
                "start_date": "2024-01-01",
                "end_date": "2026-01-01",
                "grade": "9.2 CGPA",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
