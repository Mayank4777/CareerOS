from __future__ import annotations

from types import SimpleNamespace

from django.test import TestCase

from apps.accounts.models import User
from apps.career_profile.models import CareerProfile

from ..models import Skill
from ..permissions import IsSkillOwner


class SkillPermissionTests(TestCase):
    def setUp(self) -> None:
        self.owner = User.objects.create_user(email="owner@example.com", password="strong-password")
        self.other_user = User.objects.create_user(email="other@example.com", password="strong-password")
        self.profile = CareerProfile.objects.create(user=self.owner)
        self.skill = Skill.objects.create(
            career_profile=self.profile,
            name="Python",
            category="Backend",
            proficiency_level="expert",
            years_of_experience=5,
            display_order=1,
        )
        self.permission = IsSkillOwner()

    def test_owner_can_access_own_skill(self) -> None:
        request = SimpleNamespace(user=self.owner)

        self.assertTrue(self.permission.has_object_permission(request, None, self.skill))

    def test_other_user_cannot_access_skill(self) -> None:
        request = SimpleNamespace(user=self.other_user)

        self.assertFalse(self.permission.has_object_permission(request, None, self.skill))
