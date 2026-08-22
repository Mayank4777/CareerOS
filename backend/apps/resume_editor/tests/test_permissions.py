from __future__ import annotations

from types import SimpleNamespace

from django.test import TestCase

from apps.accounts.models import User
from apps.career_profile.models import CareerProfile
from apps.resumes.models import Resume

from ..models import ResumeSection, ResumeSectionItem
from ..permissions import IsResumeSectionItemOwner, IsResumeSectionOwner


class ResumeEditorPermissionTests(TestCase):
    def setUp(self) -> None:
        self.owner = User.objects.create_user(email="owner@example.com", password="strong-password")
        self.other_user = User.objects.create_user(email="other@example.com", password="strong-password")
        self.profile = CareerProfile.objects.create(user=self.owner)
        self.resume = Resume.objects.create(career_profile=self.profile, title="Backend Resume")
        self.section = ResumeSection.objects.create(
            resume=self.resume,
            section_type="experience",
            title="Experience",
            display_order=1,
            is_visible=True,
        )
        self.item = ResumeSectionItem.objects.create(
            resume_section=self.section,
            source_object_id=self.profile.id,
            display_order=1,
        )
        self.section_permission = IsResumeSectionOwner()
        self.item_permission = IsResumeSectionItemOwner()

    def test_owner_can_access_section_and_item(self) -> None:
        request = SimpleNamespace(user=self.owner)

        self.assertTrue(self.section_permission.has_object_permission(request, None, self.section))
        self.assertTrue(self.item_permission.has_object_permission(request, None, self.item))

    def test_other_user_cannot_access_section_or_item(self) -> None:
        request = SimpleNamespace(user=self.other_user)

        self.assertFalse(self.section_permission.has_object_permission(request, None, self.section))
        self.assertFalse(self.item_permission.has_object_permission(request, None, self.item))

