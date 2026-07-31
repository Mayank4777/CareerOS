from __future__ import annotations

from datetime import date
from django.test import TestCase
from rest_framework.exceptions import NotFound

from apps.accounts.models import User
from apps.career_profile.models import CareerProfile

from ..models import Certification
from ..services import CertificationService


class CertificationServiceTests(TestCase):
    def test_crud_flow(self) -> None:
        user = User.objects.create_user(email="service@example.com", password="strong-password")
        profile = CareerProfile.objects.create(user=user)
        service = CertificationService()

        certification = service.create_certification(
            user=user,
            data={
                "name": "AWS Certified Developer",
                "issuing_organization": "Amazon",
                "issue_date": date(2024, 1, 1),
                "does_not_expire": True,
            },
        )
        self.assertEqual(certification.career_profile, profile)

        fetched = service.retrieve_certification(user=user, certification_id=certification.id)
        self.assertEqual(fetched, certification)

        updated = service.update_certification(
            user=user,
            certification_id=certification.id,
            data={"name": "AWS Certified Developer Associate"},
        )
        self.assertEqual(updated.name, "AWS Certified Developer Associate")

        service.delete_certification(user=user, certification_id=certification.id)
        self.assertFalse(Certification.objects.filter(id=certification.id).exists())

    def test_missing_certification_raises_not_found(self) -> None:
        user = User.objects.create_user(email="service2@example.com", password="strong-password")
        with self.assertRaises(NotFound):
            CertificationService().retrieve_certification(
                user=user,
                certification_id="00000000-0000-0000-0000-000000000000",
            )
