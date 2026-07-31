from __future__ import annotations

from datetime import date

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from apps.accounts.models import User
from apps.career_profile.models import CareerProfile

from ..models import Award


class AwardAPIViewTests(APITestCase):
    def test_crud_flow_and_validation(self) -> None:
        client = APIClient()
        list_url = reverse("awards:award-list")
        user = User.objects.create_user(email="view@example.com", password="strong-password")
        other_user = User.objects.create_user(email="other@example.com", password="strong-password")
        profile = CareerProfile.objects.create(user=user)
        other_profile = CareerProfile.objects.create(user=other_user)
        award = Award.objects.create(
            career_profile=profile,
            title="Employee of the Month",
            issuer="OpenAI",
            award_date=date(2024, 1, 1),
        )
        other_award = Award.objects.create(
            career_profile=other_profile,
            title="Best Speaker",
            issuer="Conference",
            award_date=date(2024, 2, 1),
        )
        detail_url = reverse("awards:award-detail", kwargs={"award_id": award.id})
        other_detail_url = reverse("awards:award-detail", kwargs={"award_id": other_award.id})

        self.assertEqual(client.get(list_url).status_code, status.HTTP_401_UNAUTHORIZED)

        client.force_authenticate(user=user)
        create_response = client.post(
            list_url,
            data={
                "title": "Team Award",
                "issuer": "CareerOS",
                "award_date": "2024-05-01",
                "description": "For teamwork",
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

        update_response = client.patch(detail_url, data={"title": "Employee of the Year"}, format="json")
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)

        validation_response = client.post(
            list_url,
            data={"title": "", "issuer": "", "award_date": "2024-01-01"},
            format="json",
        )
        self.assertEqual(validation_response.status_code, status.HTTP_400_BAD_REQUEST)
