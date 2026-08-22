from __future__ import annotations

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from apps.accounts.models import User
from apps.career_profile.models import CareerProfile

from ..models import Reference


class ReferenceAPIViewTests(APITestCase):
    def test_crud_flow_and_validation(self) -> None:
        client = APIClient()
        list_url = reverse("references:reference-list")
        user = User.objects.create_user(email="view@example.com", password="strong-password")
        other_user = User.objects.create_user(email="other@example.com", password="strong-password")
        profile = CareerProfile.objects.create(user=user)
        other_profile = CareerProfile.objects.create(user=other_user)
        reference = Reference.objects.create(
            career_profile=profile,
            name="Jane Doe",
            designation="Engineering Manager",
            company="OpenAI",
        )
        other_reference = Reference.objects.create(
            career_profile=other_profile,
            name="John Smith",
            designation="Manager",
            company="Other",
        )
        detail_url = reverse("references:reference-detail", kwargs={"reference_id": reference.id})
        other_detail_url = reverse("references:reference-detail", kwargs={"reference_id": other_reference.id})

        self.assertEqual(client.get(list_url).status_code, status.HTTP_401_UNAUTHORIZED)

        client.force_authenticate(user=user)
        create_response = client.post(
            list_url,
            data={
                "name": "Alice",
                "designation": "Director",
                "company": "CareerOS",
                "email": "alice@example.com",
                "phone": "1234567890",
                "relationship": "Supervisor",
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

        update_response = client.patch(detail_url, data={"name": "Jane Smith"}, format="json")
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)

        validation_response = client.post(
            list_url,
            data={"name": "", "designation": "", "company": ""},
            format="json",
        )
        self.assertEqual(validation_response.status_code, status.HTTP_400_BAD_REQUEST)
