from __future__ import annotations

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from apps.accounts.models import User
from apps.career_profile.models import CareerProfile

from ..models import Resume


class ResumeAPIViewTests(APITestCase):
    def setUp(self) -> None:
        self.client = APIClient()
        self.list_url = reverse("resumes:resume-list")
        self.user = User.objects.create_user(email="view@example.com", password="strong-password")
        self.other_user = User.objects.create_user(email="other@example.com", password="strong-password")
        self.profile = CareerProfile.objects.create(user=self.user)
        self.other_profile = CareerProfile.objects.create(user=self.other_user)
        self.resume = Resume.objects.create(
            career_profile=self.profile,
            title="Backend Resume",
            template="Minimal",
            status="draft",
        )
        self.other_resume = Resume.objects.create(
            career_profile=self.other_profile,
            title="Product Resume",
            template="Classic",
            status="approved",
        )
        self.detail_url = reverse("resumes:resume-detail", kwargs={"resume_id": self.resume.id})
        self.other_detail_url = reverse("resumes:resume-detail", kwargs={"resume_id": self.other_resume.id})

    def authenticate(self, user: User) -> None:
        self.client.force_authenticate(user=user)

    def test_authentication_required(self) -> None:
        response = self.client.get(self.list_url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_resume(self) -> None:
        self.authenticate(self.user)

        response = self.client.post(
            self.list_url,
            data={
                "title": "Senior Backend Resume",
                "template": "Minimal",
                "status": "in_review",
                "career_profile": str(self.other_profile.id),
                "user": str(self.other_user.id),
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["data"]["title"], "Senior Backend Resume")
        self.assertEqual(Resume.objects.filter(career_profile=self.profile).count(), 2)

    def test_list_own_resumes(self) -> None:
        self.authenticate(self.user)

        response = self.client.get(self.list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["data"]), 1)
        self.assertEqual(response.data["data"][0]["title"], "Backend Resume")

    def test_retrieve_own_resume(self) -> None:
        self.authenticate(self.user)

        response = self.client.get(self.detail_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["title"], "Backend Resume")

    def test_cannot_access_another_users_resume(self) -> None:
        self.authenticate(self.user)

        response = self.client.get(self.other_detail_url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_own_resume(self) -> None:
        self.authenticate(self.user)

        response = self.client.patch(
            self.detail_url,
            data={"title": "Lead Backend Resume", "status": "approved"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["title"], "Lead Backend Resume")
        self.assertEqual(response.data["data"]["status"], "approved")

    def test_delete_own_resume(self) -> None:
        self.authenticate(self.user)

        response = self.client.delete(self.detail_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(Resume.objects.filter(id=self.resume.id).exists())

    def test_validation_error_for_missing_required_field(self) -> None:
        self.authenticate(self.user)

        response = self.client.post(
            self.list_url,
            data={
                "template": "Minimal",
                "status": "draft",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_validation_error_for_invalid_status(self) -> None:
        self.authenticate(self.user)

        response = self.client.post(
            self.list_url,
            data={
                "title": "Backend Resume",
                "template": "Minimal",
                "status": "unknown",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

