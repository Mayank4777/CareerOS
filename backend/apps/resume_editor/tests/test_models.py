from __future__ import annotations

from django.db import IntegrityError
from django.test import TestCase

from apps.accounts.models import User
from apps.career_profile.models import CareerProfile
from apps.resumes.models import Resume

from ..models import ResumeSection, ResumeSectionItem


class ResumeEditorModelTests(TestCase):
    def setUp(self) -> None:
        self.user = User.objects.create_user(email="model@example.com", password="strong-password")
        self.profile = CareerProfile.objects.create(user=self.user)
        self.resume = Resume.objects.create(career_profile=self.profile, title="Backend Resume")

    def test_resume_section_string_representation_and_ownership(self) -> None:
        section = ResumeSection.objects.create(
            resume=self.resume,
            section_type="experience",
            title="Experience",
            display_order=1,
            is_visible=True,
        )

        self.assertEqual(str(section), "Experience")
        self.assertEqual(self.resume.sections.count(), 1)

    def test_resume_section_item_string_representation_and_ownership(self) -> None:
        section = ResumeSection.objects.create(
            resume=self.resume,
            section_type="skills",
            title="Skills",
            display_order=0,
            is_visible=True,
        )
        item = ResumeSectionItem.objects.create(
            resume_section=section,
            source_object_id=self.profile.id,
            display_order=1,
        )

        self.assertEqual(str(item), str(self.profile.id))
        self.assertEqual(section.items.count(), 1)

    def test_resume_section_item_source_object_must_be_unique_within_section(self) -> None:
        section = ResumeSection.objects.create(
            resume=self.resume,
            section_type="projects",
            title="Projects",
            display_order=2,
            is_visible=True,
        )

        ResumeSectionItem.objects.create(
            resume_section=section,
            source_object_id=self.profile.id,
            display_order=1,
        )

        with self.assertRaises(IntegrityError):
            ResumeSectionItem.objects.create(
                resume_section=section,
                source_object_id=self.profile.id,
                display_order=2,
            )

    def test_resume_section_item_can_reuse_source_object_in_different_sections(self) -> None:
        first_section = ResumeSection.objects.create(
            resume=self.resume,
            section_type="skills",
            title="Skills",
            display_order=0,
            is_visible=True,
        )
        second_section = ResumeSection.objects.create(
            resume=self.resume,
            section_type="projects",
            title="Projects",
            display_order=1,
            is_visible=True,
        )

        ResumeSectionItem.objects.create(
            resume_section=first_section,
            source_object_id=self.profile.id,
            display_order=1,
        )
        item = ResumeSectionItem.objects.create(
            resume_section=second_section,
            source_object_id=self.profile.id,
            display_order=1,
        )

        self.assertIsNotNone(item.id)
