from __future__ import annotations

from datetime import date
from types import SimpleNamespace

from django.test import TestCase

from apps.accounts.models import User
from apps.career_profile.models import CareerProfile

from ..models import Certification
from ..permissions import IsCertificationOwner


class CertificationPermissionTests(TestCase):
    def test_owner_only_access(self) -> None:
        owner = User.objects.create_user(email="owner@example.com", password="strong-password")
        other = User.objects.create_user(email="other@example.com", password="strong-password")
        profile = CareerProfile.objects.create(user=owner)
        certification = Certification.objects.create(
            career_profile=profile,
            name="AWS Certified Developer",
            issuing_organization="Amazon",
            issue_date=date(2024, 1, 1),
            does_not_expire=True,
        )
        permission = IsCertificationOwner()

        self.assertTrue(permission.has_object_permission(SimpleNamespace(user=owner), None, certification))
        self.assertFalse(permission.has_object_permission(SimpleNamespace(user=other), None, certification))
