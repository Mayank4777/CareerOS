from __future__ import annotations

from datetime import date
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from apps.accounts.models import User
from apps.career_profile.models import CareerProfile

from ..models import Certification


class CertificationAPIViewTests(APITestCase):
    def test_endpoints_and_validation(self) -> None:
        client = APIClient()
        list_url = reverse("certifications:certification-list")
        user = User.objects.create_user(email="view@example.com", password="strong-password")
        other_user = User.objects.create_user(email="other@example.com", password="strong-password")
        profile = CareerProfile.objects.create(user=user)
        other_profile = CareerProfile.objects.create(user=other_user)
        certification = Certification.objects.create(
            career_profile=profile,
            name="AWS Certified Developer",
            issuing_organization="Amazon",
            issue_date=date(2024, 1, 1),
            does_not_expire=True,
        )
        other_certification = Certification.objects.create(
            career_profile=other_profile,
            name="Azure Admin",
            issuing_organization="Microsoft",
            issue_date=date(2024, 1, 1),
            does_not_expire=True,
        )
        detail_url = reverse("certifications:certification-detail", kwargs={"certification_id": certification.id})
        other_detail_url = reverse(
            "certifications:certification-detail",
            kwargs={"certification_id": other_certification.id},
        )

        self.assertEqual(client.get(list_url).status_code, status.HTTP_401_UNAUTHORIZED)

        client.force_authenticate(user=user)
        create_response = client.post(
            list_url,
            data={
                "name": "Google Cloud Professional",
                "issuing_organization": "Google",
                "issue_date": "2024-01-01",
                "does_not_expire": False,
                "expiry_date": "2025-01-01",
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

        update_response = client.patch(detail_url, data={"name": "AWS Certified Developer Pro"}, format="json")
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)

        validation_response = client.post(
            list_url,
            data={
                "name": "Bad Cert",
                "issuing_organization": "Bad Org",
                "issue_date": "2024-01-01",
                "does_not_expire": True,
                "expiry_date": "2025-01-01",
            },
            format="json",
        )
        self.assertEqual(validation_response.status_code, status.HTTP_400_BAD_REQUEST)
