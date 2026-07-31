from __future__ import annotations

from datetime import date
from django.test import TestCase

from apps.accounts.models import User
from apps.career_profile.models import CareerProfile

from ..models import Certification
from ..selectors import get_certification, list_certifications


class CertificationSelectorTests(TestCase):
    def test_owner_filters_are_applied(self) -> None:
        user = User.objects.create_user(email="selector@example.com", password="strong-password")
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
        Certification.objects.create(
            career_profile=other_profile,
            name="Azure Admin",
            issuing_organization="Microsoft",
            issue_date=date(2024, 1, 1),
            does_not_expire=True,
        )

        self.assertEqual(list_certifications(user=user).count(), 1)
        self.assertEqual(get_certification(user=user, certification_id=certification.id), certification)
        self.assertIsNone(get_certification(user=user, certification_id=other_profile.certifications.first().id))
