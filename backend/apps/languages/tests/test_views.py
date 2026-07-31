from __future__ import annotations

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from apps.accounts.models import User
from apps.career_profile.models import CareerProfile

from ..models import Language


class LanguageAPIViewTests(APITestCase):
    def test_endpoints_and_validation(self) -> None:
        client = APIClient()
        list_url = reverse("languages:language-list")
        user = User.objects.create_user(email="view@example.com", password="strong-password")
        other_user = User.objects.create_user(email="other@example.com", password="strong-password")
        profile = CareerProfile.objects.create(user=user)
        other_profile = CareerProfile.objects.create(user=other_user)
        language = Language.objects.create(career_profile=profile, language="English", proficiency="native")
        other_language = Language.objects.create(career_profile=other_profile, language="German", proficiency="professional")
        detail_url = reverse("languages:language-detail", kwargs={"language_id": language.id})
        other_detail_url = reverse("languages:language-detail", kwargs={"language_id": other_language.id})

        self.assertEqual(client.get(list_url).status_code, status.HTTP_401_UNAUTHORIZED)

        client.force_authenticate(user=user)
        create_response = client.post(list_url, data={"language": "French", "proficiency": "professional"}, format="json")
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)

        list_response = client.get(list_url)
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_response.data["data"]), 2)

        retrieve_response = client.get(detail_url)
        self.assertEqual(retrieve_response.status_code, status.HTTP_200_OK)

        forbidden_response = client.get(other_detail_url)
        self.assertEqual(forbidden_response.status_code, status.HTTP_404_NOT_FOUND)

        update_response = client.patch(detail_url, data={"language": "English (UK)"}, format="json")
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)

        validation_response = client.post(list_url, data={"language": "", "proficiency": "native"}, format="json")
        self.assertEqual(validation_response.status_code, status.HTTP_400_BAD_REQUEST)
