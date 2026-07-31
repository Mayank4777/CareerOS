from __future__ import annotations

from django.test import TestCase

from apps.accounts.models import User
from apps.career_profile.models import CareerProfile

from ..models import Interest
from ..selectors import get_interest, list_interests


class InterestSelectorTests(TestCase):
    def test_owner_scoping(self) -> None:
        user = User.objects.create_user(email="sel@example.com", password="strong-password")
        other_user = User.objects.create_user(email="other@example.com", password="strong-password")
        profile = CareerProfile.objects.create(user=user)
        other_profile = CareerProfile.objects.create(user=other_user)
        interest = Interest.objects.create(career_profile=profile, name="Machine Learning")
        Interest.objects.create(career_profile=other_profile, name="Cooking")

        self.assertEqual(list_interests(user=user).count(), 1)
        self.assertEqual(get_interest(user=user, interest_id=interest.id), interest)
        self.assertIsNone(get_interest(user=user, interest_id=other_profile.interests.first().id))
