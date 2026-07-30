from __future__ import annotations

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from apps.accounts.models import User

from ..models import CareerProfile


class CareerProfileAPIViewTests(APITestCase):
    def setUp(self) -> None:
        self.client = APIClient()
        self.url = reverse("career_profile:profile")
        self.user = User.objects.create_user(
            email="view@example.com",
            password="strong-password",
            first_name="View",
            last_name="User",
        )

    def authenticate(self, user: User) -> None:
        self.client.force_authenticate(user=user)

    def test_authentication_required(self) -> None:
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_profile(self) -> None:
        self.authenticate(self.user)

        response = self.client.post(
            self.url,
            data={
                "first_name": "View",
                "last_name": "User",
                "headline": "Backend Engineer",
                "summary": "Building APIs",
                "phone": "1234567890",
                "location": "Remote",
                "website": "https://example.com",
                "linkedin_url": "https://linkedin.com/in/viewuser",
                "github_url": "https://github.com/viewuser",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["data"]["headline"], "Backend Engineer")
        self.assertTrue(CareerProfile.objects.filter(user=self.user).exists())

    def test_retrieve_own_profile(self) -> None:
        CareerProfile.objects.create(user=self.user, headline="Backend Engineer")
        self.authenticate(self.user)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["headline"], "Backend Engineer")

    def test_update_own_profile(self) -> None:
        CareerProfile.objects.create(user=self.user, headline="Backend Engineer")
        self.authenticate(self.user)

        response = self.client.patch(
            self.url,
            data={"headline": "Senior Backend Engineer"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["headline"], "Senior Backend Engineer")

    def test_delete_own_profile(self) -> None:
        CareerProfile.objects.create(user=self.user)
        self.authenticate(self.user)

        response = self.client.delete(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(CareerProfile.objects.filter(user=self.user).exists())

    def test_duplicate_profile_returns_conflict(self) -> None:
        CareerProfile.objects.create(user=self.user)
        self.authenticate(self.user)

        response = self.client.post(self.url, data={}, format="json")

        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)

