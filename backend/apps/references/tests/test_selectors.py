from __future__ import annotations

from django.test import TestCase

from apps.accounts.models import User
from apps.career_profile.models import CareerProfile

from ..models import Reference
from ..selectors import get_reference, list_references


class ReferenceSelectorTests(TestCase):
    def test_owner_scoping(self) -> None:
        user = User.objects.create_user(email="sel@example.com", password="strong-password")
        other_user = User.objects.create_user(email="other@example.com", password="strong-password")
        profile = CareerProfile.objects.create(user=user)
        other_profile = CareerProfile.objects.create(user=other_user)
        reference = Reference.objects.create(
            career_profile=profile,
            name="Jane Doe",
            designation="Engineering Manager",
            company="OpenAI",
        )
        Reference.objects.create(
            career_profile=other_profile,
            name="John Smith",
            designation="Manager",
            company="Other",
        )

        self.assertEqual(list_references(user=user).count(), 1)
        self.assertEqual(get_reference(user=user, reference_id=reference.id), reference)
        self.assertIsNone(get_reference(user=user, reference_id=other_profile.references.first().id))
