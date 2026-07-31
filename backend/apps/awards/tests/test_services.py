from __future__ import annotations

from datetime import date

from django.test import TestCase
from rest_framework.exceptions import NotFound

from apps.accounts.models import User
from apps.career_profile.models import CareerProfile

from ..models import Award
from ..services import AwardService


class AwardServiceTests(TestCase):
    def test_crud_and_not_found(self) -> None:
        user = User.objects.create_user(email="srv@example.com", password="strong-password")
        profile = CareerProfile.objects.create(user=user)
        service = AwardService()

        award = service.create_award(
            user=user,
            data={
                "title": "Employee of the Month",
                "issuer": "OpenAI",
                "award_date": date(2024, 1, 1),
            },
        )
        self.assertEqual(award.career_profile, profile)

        fetched = service.retrieve_award(user=user, award_id=award.id)
        self.assertEqual(fetched, award)

        updated = service.update_award(
            user=user,
            award_id=award.id,
            data={"title": "Employee of the Year"},
        )
        self.assertEqual(updated.title, "Employee of the Year")

        service.delete_award(user=user, award_id=award.id)
        self.assertFalse(Award.objects.filter(id=award.id).exists())

        with self.assertRaises(NotFound):
            service.retrieve_award(user=user, award_id="00000000-0000-0000-0000-000000000000")
