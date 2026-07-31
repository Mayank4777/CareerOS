from __future__ import annotations

from django.test import TestCase

from apps.accounts.models import User
from apps.career_profile.models import CareerProfile

from ..models import Reference


class ReferenceModelTests(TestCase):
    def test_string_representation_and_ownership(self) -> None:
        user = User.objects.create_user(email="ref@example.com", password="strong-password")
        profile = CareerProfile.objects.create(user=user)
        reference = Reference.objects.create(
            career_profile=profile,
            name="Jane Doe",
            designation="Engineering Manager",
            company="OpenAI",
        )

        self.assertEqual(str(reference), "Jane Doe")
        self.assertEqual(profile.references.count(), 1)
