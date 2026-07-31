from __future__ import annotations

from datetime import date

from django.test import TestCase

from apps.accounts.models import User
from apps.career_profile.models import CareerProfile

from ..models import Publication
from ..selectors import get_publication, list_publications


class PublicationSelectorTests(TestCase):
    def test_owner_scoping(self) -> None:
        user = User.objects.create_user(email="sel@example.com", password="strong-password")
        other_user = User.objects.create_user(email="other@example.com", password="strong-password")
        profile = CareerProfile.objects.create(user=user)
        other_profile = CareerProfile.objects.create(user=other_user)
        publication = Publication.objects.create(
            career_profile=profile,
            title="Research Paper",
            publisher="Journal",
            publication_date=date(2024, 1, 1),
        )
        Publication.objects.create(
            career_profile=other_profile,
            title="Other Paper",
            publisher="Other Journal",
            publication_date=date(2024, 2, 1),
        )

        self.assertEqual(list_publications(user=user).count(), 1)
        self.assertEqual(get_publication(user=user, publication_id=publication.id), publication)
        self.assertIsNone(get_publication(user=user, publication_id=other_profile.publications.first().id))
