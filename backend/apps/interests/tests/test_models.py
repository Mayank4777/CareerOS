from __future__ import annotations

from django.test import TestCase

from apps.accounts.models import User
from apps.career_profile.models import CareerProfile

from ..models import Interest


class InterestModelTests(TestCase):
    def test_string_representation_and_ownership(self) -> None:
        user = User.objects.create_user(email="int@example.com", password="strong-password")
        profile = CareerProfile.objects.create(user=user)
        interest = Interest.objects.create(career_profile=profile, name="Machine Learning")

        self.assertEqual(str(interest), "Machine Learning")
        self.assertEqual(profile.interests.count(), 1)
