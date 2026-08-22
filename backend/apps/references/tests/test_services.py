from __future__ import annotations

from django.test import TestCase
from rest_framework.exceptions import NotFound

from apps.accounts.models import User
from apps.career_profile.models import CareerProfile

from ..models import Reference
from ..services import ReferenceService


class ReferenceServiceTests(TestCase):
    def test_crud_and_not_found(self) -> None:
        user = User.objects.create_user(email="srv@example.com", password="strong-password")
        profile = CareerProfile.objects.create(user=user)
        service = ReferenceService()

        reference = service.create_reference(
            user=user,
            data={
                "name": "Jane Doe",
                "designation": "Engineering Manager",
                "company": "OpenAI",
            },
        )
        self.assertEqual(reference.career_profile, profile)

        fetched = service.retrieve_reference(user=user, reference_id=reference.id)
        self.assertEqual(fetched, reference)

        updated = service.update_reference(user=user, reference_id=reference.id, data={"name": "Jane Smith"})
        self.assertEqual(updated.name, "Jane Smith")

        service.delete_reference(user=user, reference_id=reference.id)
        self.assertFalse(Reference.objects.filter(id=reference.id).exists())

        with self.assertRaises(NotFound):
            service.retrieve_reference(user=user, reference_id="00000000-0000-0000-0000-000000000000")
