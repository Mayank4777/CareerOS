from __future__ import annotations

from django.test import TestCase

from apps.accounts.models import User
from apps.career_profile.models import CareerProfile

from ..models import Skill
from ..selectors import get_skill, list_skills


class SkillSelectorTests(TestCase):
    def setUp(self) -> None:
        self.user = User.objects.create_user(email="selector@example.com", password="strong-password")
        self.other_user = User.objects.create_user(email="other@example.com", password="strong-password")
        self.profile = CareerProfile.objects.create(user=self.user)
        self.other_profile = CareerProfile.objects.create(user=self.other_user)
        self.skill = Skill.objects.create(
            career_profile=self.profile,
            name="Python",
            category="Backend",
            proficiency_level="expert",
            years_of_experience=5,
            display_order=1,
        )
        Skill.objects.create(
            career_profile=self.other_profile,
            name="Java",
            category="Backend",
            proficiency_level="advanced",
            years_of_experience=4,
            display_order=0,
        )

    def test_list_skills_returns_only_owner_records(self) -> None:
        records = list_skills(user=self.user)

        self.assertEqual(records.count(), 1)
        self.assertEqual(records.first(), self.skill)

    def test_get_skill_returns_owner_record(self) -> None:
        record = get_skill(user=self.user, skill_id=self.skill.id)

        self.assertEqual(record, self.skill)

    def test_get_skill_returns_none_for_other_users_record(self) -> None:
        record = get_skill(user=self.user, skill_id=self.other_profile.skills.first().id)

        self.assertIsNone(record)
