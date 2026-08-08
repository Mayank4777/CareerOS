from __future__ import annotations

from django.test import TestCase

from apps.accounts.models import User
from apps.career_profile.models import CareerProfile
from apps.resumes.models import Resume

from ..models import ResumeSection, ResumeSectionItem
from ..selectors import (
    get_resume_section,
    get_resume_section_item,
    list_resume_section_items,
    list_resume_sections,
)


class ResumeEditorSelectorTests(TestCase):
    def setUp(self) -> None:
        self.user = User.objects.create_user(email="selector@example.com", password="strong-password")
        self.other_user = User.objects.create_user(email="other@example.com", password="strong-password")
        self.profile = CareerProfile.objects.create(user=self.user)
        self.other_profile = CareerProfile.objects.create(user=self.other_user)
        self.resume = Resume.objects.create(career_profile=self.profile, title="Backend Resume")
        self.other_resume = Resume.objects.create(career_profile=self.other_profile, title="Other Resume")
        self.section = ResumeSection.objects.create(
            resume=self.resume,
            section_type="experience",
            title="Experience",
            display_order=1,
            is_visible=True,
        )
        self.other_section = ResumeSection.objects.create(
            resume=self.other_resume,
            section_type="skills",
            title="Skills",
            display_order=0,
            is_visible=True,
        )
        self.item = ResumeSectionItem.objects.create(
            resume_section=self.section,
            source_object_id=self.profile.id,
            display_order=1,
        )
        ResumeSectionItem.objects.create(
            resume_section=self.other_section,
            source_object_id=self.other_profile.id,
            display_order=0,
        )

    def test_list_resume_sections_returns_only_owner_sections(self) -> None:
        records = list_resume_sections(user=self.user, resume_id=self.resume.id)

        self.assertEqual(records.count(), 1)
        self.assertEqual(records.first(), self.section)

    def test_get_resume_section_returns_owner_section(self) -> None:
        record = get_resume_section(user=self.user, resume_section_id=self.section.id)

        self.assertEqual(record, self.section)

    def test_list_resume_section_items_returns_only_owner_items(self) -> None:
        records = list_resume_section_items(user=self.user, resume_section_id=self.section.id)

        self.assertEqual(records.count(), 1)
        self.assertEqual(records.first(), self.item)

    def test_get_resume_section_item_returns_owner_item(self) -> None:
        record = get_resume_section_item(user=self.user, resume_section_item_id=self.item.id)

        self.assertEqual(record, self.item)

    def test_cross_user_access_returns_none(self) -> None:
        self.assertIsNone(get_resume_section(user=self.user, resume_section_id=self.other_section.id))
        self.assertIsNone(get_resume_section_item(user=self.user, resume_section_item_id=self.other_section.items.first().id))

