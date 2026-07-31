from __future__ import annotations

from datetime import date

from django.test import TestCase
from rest_framework.exceptions import NotFound

from apps.accounts.models import User
from apps.career_profile.models import CareerProfile

from ..models import Publication
from ..services import PublicationService


class PublicationServiceTests(TestCase):
    def test_crud_and_not_found(self) -> None:
        user = User.objects.create_user(email="srv@example.com", password="strong-password")
        profile = CareerProfile.objects.create(user=user)
        service = PublicationService()

        publication = service.create_publication(
            user=user,
            data={
                "title": "Research Paper",
                "publisher": "Journal",
                "publication_date": date(2024, 1, 1),
            },
        )
        self.assertEqual(publication.career_profile, profile)

        fetched = service.retrieve_publication(user=user, publication_id=publication.id)
        self.assertEqual(fetched, publication)

        updated = service.update_publication(
            user=user,
            publication_id=publication.id,
            data={"title": "Updated Paper"},
        )
        self.assertEqual(updated.title, "Updated Paper")

        service.delete_publication(user=user, publication_id=publication.id)
        self.assertFalse(Publication.objects.filter(id=publication.id).exists())

        with self.assertRaises(NotFound):
            service.retrieve_publication(user=user, publication_id="00000000-0000-0000-0000-000000000000")
