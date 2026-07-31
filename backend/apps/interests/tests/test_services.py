from __future__ import annotations

from django.test import TestCase
from rest_framework.exceptions import NotFound

from apps.accounts.models import User
from apps.career_profile.models import CareerProfile

from ..models import Interest
from ..services import InterestService


class InterestServiceTests(TestCase):
    def test_crud_and_not_found(self) -> None:
        user = User.objects.create_user(email="srv@example.com", password="strong-password")
        profile = CareerProfile.objects.create(user=user)
        service = InterestService()

        interest = service.create_interest(user=user, data={"name": "Machine Learning"})
        self.assertEqual(interest.career_profile, profile)

        fetched = service.retrieve_interest(user=user, interest_id=interest.id)
        self.assertEqual(fetched, interest)

        updated = service.update_interest(user=user, interest_id=interest.id, data={"name": "AI"})
        self.assertEqual(updated.name, "AI")

        service.delete_interest(user=user, interest_id=interest.id)
        self.assertFalse(Interest.objects.filter(id=interest.id).exists())

        with self.assertRaises(NotFound):
            service.retrieve_interest(user=user, interest_id="00000000-0000-0000-0000-000000000000")
