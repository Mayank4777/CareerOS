from __future__ import annotations

from datetime import date

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from apps.accounts.models import User
from apps.career_profile.models import CareerProfile

from ..models import Achievement


class AchievementAPIViewTests(APITestCase):
    def test_crud_flow_and_validation(self) -> None:
        client = APIClient()
        list_url = reverse("achievements:achievement-list")
        user = User.objects.create_user(email="view@example.com", password="strong-password")
        other_user = User.objects.create_user(email="other@example.com", password="strong-password")
        profile = CareerProfile.objects.create(user=user)
        other_profile = CareerProfile.objects.create(user=other_user)
        achievement = Achievement.objects.create(
            career_profile=profile,
            title="Dean's List",
            description="Recognized for academic excellence",
            achievement_date=date(2024, 1, 1),
        )
        other_achievement = Achievement.objects.create(
            career_profile=other_profile,
            title="Hackathon Winner",
            description="Won the competition",
        )
        detail_url = reverse("achievements:achievement-detail", kwargs={"achievement_id": achievement.id})
        other_detail_url = reverse(
            "achievements:achievement-detail",
            kwargs={"achievement_id": other_achievement.id},
        )

        self.assertEqual(client.get(list_url).status_code, status.HTTP_401_UNAUTHORIZED)

        client.force_authenticate(user=user)
        create_response = client.post(
            list_url,
            data={
                "title": "Community Award",
                "description": "Recognized for service",
                "achievement_date": "2024-06-01",
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

        update_response = client.patch(detail_url, data={"title": "Dean's List Updated"}, format="json")
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)

        validation_response = client.post(
            list_url,
            data={"title": "", "description": "x"},
            format="json",
        )
        self.assertEqual(validation_response.status_code, status.HTTP_400_BAD_REQUEST)
