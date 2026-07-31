from __future__ import annotations

from datetime import date

from django.test import TestCase

from apps.accounts.models import User
from apps.career_profile.models import CareerProfile

from ..models import Award
from ..selectors import get_award, list_awards


class AwardSelectorTests(TestCase):
    def test_owner_scoping(self) -> None:
        user = User.objects.create_user(email="sel@example.com", password="strong-password")
        other_user = User.objects.create_user(email="other@example.com", password="strong-password")
        profile = CareerProfile.objects.create(user=user)
        other_profile = CareerProfile.objects.create(user=other_user)
        award = Award.objects.create(
            career_profile=profile,
            title="Employee of the Month",
            issuer="OpenAI",
            award_date=date(2024, 1, 1),
        )
        Award.objects.create(
            career_profile=other_profile,
            title="Best Speaker",
            issuer="Conference",
            award_date=date(2024, 2, 1),
        )

        self.assertEqual(list_awards(user=user).count(), 1)
        self.assertEqual(get_award(user=user, award_id=award.id), award)
        self.assertIsNone(get_award(user=user, award_id=other_profile.awards.first().id))
