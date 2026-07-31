from __future__ import annotations

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from apps.accounts.models import User
from apps.career_profile.models import CareerProfile

from ..models import Project


class ProjectAPIViewTests(APITestCase):
    def test_endpoints_and_validation(self) -> None:
        client = APIClient()
        list_url = reverse("projects:project-list")
        user = User.objects.create_user(email="view@example.com", password="strong-password")
        other_user = User.objects.create_user(email="other@example.com", password="strong-password")
        profile = CareerProfile.objects.create(user=user)
        other_profile = CareerProfile.objects.create(user=other_user)
        project = Project.objects.create(
            career_profile=profile,
            title="CareerOS",
            description="Career tracking platform",
            technologies="Django, DRF",
            currently_active=True,
        )
        other_project = Project.objects.create(
            career_profile=other_profile,
            title="Other",
            description="Other",
            technologies="Python",
            currently_active=True,
        )
        detail_url = reverse("projects:project-detail", kwargs={"project_id": project.id})
        other_detail_url = reverse("projects:project-detail", kwargs={"project_id": other_project.id})

        self.assertEqual(client.get(list_url).status_code, status.HTTP_401_UNAUTHORIZED)

        client.force_authenticate(user=user)
        create_response = client.post(
            list_url,
            data={
                "title": "New Project",
                "description": "Something useful",
                "technologies": "Python",
                "currently_active": False,
                "start_date": "2024-01-01",
                "end_date": "2024-12-31",
            },
            format="json",
        )
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(create_response.data["data"]["title"], "New Project")

        list_response = client.get(list_url)
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_response.data["data"]), 2)

        retrieve_response = client.get(detail_url)
        self.assertEqual(retrieve_response.status_code, status.HTTP_200_OK)

        forbidden_response = client.get(other_detail_url)
        self.assertEqual(forbidden_response.status_code, status.HTTP_404_NOT_FOUND)

        update_response = client.patch(detail_url, data={"title": "CareerOS v2"}, format="json")
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)

        validation_response = client.post(
            list_url,
            data={
                "title": "Bad Project",
                "description": "Something",
                "technologies": "Python",
                "currently_active": True,
                "end_date": "2024-12-31",
            },
            format="json",
        )
        self.assertEqual(validation_response.status_code, status.HTTP_400_BAD_REQUEST)
