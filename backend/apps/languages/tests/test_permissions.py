from __future__ import annotations

from types import SimpleNamespace

from django.test import TestCase

from apps.accounts.models import User
from apps.career_profile.models import CareerProfile

from ..models import Language
from ..permissions import IsLanguageOwner


class LanguagePermissionTests(TestCase):
    def test_owner_only_access(self) -> None:
        owner = User.objects.create_user(email="owner@example.com", password="strong-password")
        other = User.objects.create_user(email="other@example.com", password="strong-password")
        profile = CareerProfile.objects.create(user=owner)
        language = Language.objects.create(career_profile=profile, language="English", proficiency="native")
        permission = IsLanguageOwner()

        self.assertTrue(permission.has_object_permission(SimpleNamespace(user=owner), None, language))
        self.assertFalse(permission.has_object_permission(SimpleNamespace(user=other), None, language))
