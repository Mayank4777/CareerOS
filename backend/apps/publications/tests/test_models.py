from __future__ import annotations

from datetime import date

from django.test import TestCase

from apps.accounts.models import User
from apps.career_profile.models import CareerProfile

from ..models import Publication


class PublicationModelTests(TestCase):
    def test_string_representation_and_ownership(self) -> None:
        user = User.objects.create_user(email="pub@example.com", password="strong-password")
        profile = CareerProfile.objects.create(user=user)
        publication = Publication.objects.create(
            career_profile=profile,
            title="Research Paper",
            publisher="Journal",
            publication_date=date(2024, 1, 1),
        )

        self.assertEqual(str(publication), "Research Paper")
        self.assertEqual(profile.publications.count(), 1)
