from __future__ import annotations

from datetime import date

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from apps.accounts.models import User
from apps.career_profile.models import CareerProfile

from ..models import VolunteerExperience


class VolunteerExperienceAPIViewTests(APITestCase):
    def test_crud_flow_and_validation(self) -> None:
        client = APIClient()
        list_url = reverse("volunteer_experience:volunteer-experience-list")
        user = User.objects.create_user(email="view@example.com", password="strong-password")
        other_user = User.objects.create_user(email="other@example.com", password="strong-password")
        profile = CareerProfile.objects.create(user=user)
        other_profile = CareerProfile.objects.create(user=other_user)
        record = VolunteerExperience.objects.create(
            career_profile=profile,
            organization="Local NGO",
            role="Mentor",
            description="Mentored students",
            start_date=date(2024, 1, 1),
            currently_volunteering=True,
        )
        other_record = VolunteerExperience.objects.create(
            career_profile=other_profile,
            organization="Charity",
            role="Helper",
            description="Helped community",
            start_date=date(2024, 2, 1),
            currently_volunteering=True,
        )
        detail_url = reverse("volunteer_experience:volunteer-experience-detail", kwargs={"volunteer_experience_id": record.id})
        other_detail_url = reverse(
            "volunteer_experience:volunteer-experience-detail",
            kwargs={"volunteer_experience_id": other_record.id},
        )

        self.assertEqual(client.get(list_url).status_code, status.HTTP_401_UNAUTHORIZED)

        client.force_authenticate(user=user)
        create_response = client.post(
            list_url,
            data={
                "organization": "Community Org",
                "role": "Coordinator",
                "description": "Coordinated volunteers",
                "start_date": "2024-03-01",
                "currently_volunteering": False,
                "end_date": "2024-04-01",
                "display_order": 1,
            },
            format="json",
        )
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)

        list_response = client.get(list_url)
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_response.data["data"]), 2)

        retrieve_response = client.get(detail_url)
        self.assertEqual(retrieve_response.status_code, status.HTTP_200_OK)

        forbidden_response = client.get(other_detail_url)
        self.assertEqual(forbidden_response.status_code, status.HTTP_404_NOT_FOUND)

        update_response = client.patch(detail_url, data={"role": "Lead Mentor"}, format="json")
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)

        validation_response = client.post(
            list_url,
            data={
                "organization": "Bad Org",
                "role": "Helper",
                "description": "x",
                "start_date": "2024-01-01",
                "currently_volunteering": True,
                "end_date": "2024-02-01",
            },
            format="json",
        )
        self.assertEqual(validation_response.status_code, status.HTTP_400_BAD_REQUEST)
