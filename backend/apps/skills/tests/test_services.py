from __future__ import annotations

from django.test import TestCase
from rest_framework.exceptions import NotFound

from apps.accounts.models import User
from apps.career_profile.models import CareerProfile

from ..models import Skill
from ..services import SkillService


class SkillServiceTests(TestCase):
    def setUp(self) -> None:
        self.service = SkillService()
        self.user = User.objects.create_user(email="service@example.com", password="strong-password")
        self.other_user = User.objects.create_user(email="other@example.com", password="strong-password")
        self.profile = CareerProfile.objects.create(user=self.user)
        self.other_profile = CareerProfile.objects.create(user=self.other_user)

    def test_create_skill(self) -> None:
        skill = self.service.create_skill(
            user=self.user,
            data={
                "name": "Python",
                "category": "Backend",
                "proficiency_level": "expert",
                "years_of_experience": 5,
                "display_order": 1,
            },
        )

        self.assertIsInstance(skill, Skill)
        self.assertEqual(skill.career_profile, self.profile)

    def test_list_skills_returns_owner_records(self) -> None:
        own_skill = Skill.objects.create(
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

        records = self.service.list_skills(user=self.user)

        self.assertEqual(records.count(), 1)
        self.assertEqual(records.first(), own_skill)

    def test_retrieve_skill(self) -> None:
        skill = Skill.objects.create(
            career_profile=self.profile,
            name="Python",
            category="Backend",
            proficiency_level="expert",
            years_of_experience=5,
            display_order=1,
        )

        fetched = self.service.retrieve_skill(user=self.user, skill_id=skill.id)

        self.assertEqual(fetched, skill)

    def test_update_skill(self) -> None:
        skill = Skill.objects.create(
            career_profile=self.profile,
            name="Python",
            category="Backend",
            proficiency_level="expert",
            years_of_experience=5,
            display_order=1,
        )

        updated = self.service.update_skill(
            user=self.user,
            skill_id=skill.id,
            data={"name": "Python 3"},
        )

        self.assertEqual(updated.name, "Python 3")
        self.assertIsNotNone(updated.updated_at)

    def test_delete_skill(self) -> None:
        skill = Skill.objects.create(
            career_profile=self.profile,
            name="Python",
            category="Backend",
            proficiency_level="expert",
            years_of_experience=5,
            display_order=1,
        )

        self.service.delete_skill(user=self.user, skill_id=skill.id)

        self.assertFalse(Skill.objects.filter(id=skill.id).exists())

    def test_missing_skill_raises_not_found(self) -> None:
        with self.assertRaises(NotFound):
            self.service.retrieve_skill(user=self.user, skill_id="00000000-0000-0000-0000-000000000000")
