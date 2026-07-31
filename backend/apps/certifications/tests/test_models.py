from __future__ import annotations

from datetime import date
from django.test import TestCase

from apps.accounts.models import User
from apps.career_profile.models import CareerProfile

from ..models import Certification


class CertificationModelTests(TestCase):
    def test_string_representation_and_ownership(self) -> None:
        user = User.objects.create_user(email="cert@example.com", password="strong-password")
        profile = CareerProfile.objects.create(user=user)
        certification = Certification.objects.create(
            career_profile=profile,
            name="AWS Certified Developer",
            issuing_organization="Amazon",
            issue_date=date(2024, 1, 1),
            does_not_expire=True,
        )

        self.assertEqual(str(certification), "AWS Certified Developer")
        self.assertEqual(profile.certifications.count(), 1)
