from __future__ import annotations

from django.test import TestCase
from rest_framework.exceptions import NotFound
from rest_framework.exceptions import ValidationError

from apps.accounts.models import User
from apps.career_profile.models import CareerProfile
from apps.resumes.models import Resume

from ..models import ResumeSection, ResumeSectionItem
from ..services import ResumeSectionItemService, ResumeSectionService


class ResumeEditorServiceTests(TestCase):
    def setUp(self) -> None:
        self.section_service = ResumeSectionService()
        self.item_service = ResumeSectionItemService()
        self.user = User.objects.create_user(email="service@example.com", password="strong-password")
        self.other_user = User.objects.create_user(email="other@example.com", password="strong-password")
        self.profile = CareerProfile.objects.create(user=self.user)
        self.other_profile = CareerProfile.objects.create(user=self.other_user)
        self.resume = Resume.objects.create(career_profile=self.profile, title="Backend Resume")
        self.other_resume = Resume.objects.create(career_profile=self.other_profile, title="Other Resume")

    def test_section_crud(self) -> None:
        section = self.section_service.create_resume_section(
            user=self.user,
            resume_id=self.resume.id,
            data={
                "section_type": "experience",
                "title": "Experience",
                "display_order": 1,
                "is_visible": True,
            },
        )

        self.assertIsInstance(section, ResumeSection)
        self.assertEqual(section.resume, self.resume)

        fetched = self.section_service.retrieve_resume_section(user=self.user, resume_section_id=section.id)
        self.assertEqual(fetched, section)

        updated = self.section_service.update_resume_section(
            user=self.user,
            resume_section_id=section.id,
            data={"title": "Work Experience", "is_visible": False},
        )
        self.assertEqual(updated.title, "Work Experience")
        self.assertFalse(updated.is_visible)

        self.section_service.delete_resume_section(user=self.user, resume_section_id=section.id)
        self.assertFalse(ResumeSection.objects.filter(id=section.id).exists())

    def test_item_crud(self) -> None:
        section = ResumeSection.objects.create(
            resume=self.resume,
            section_type="skills",
            title="Skills",
            display_order=0,
            is_visible=True,
        )
        item = self.item_service.create_resume_section_item(
            user=self.user,
            resume_section_id=section.id,
            data={
                "source_object_id": self.profile.id,
                "display_order": 1,
            },
        )

        self.assertIsInstance(item, ResumeSectionItem)
        self.assertEqual(item.resume_section, section)

        fetched = self.item_service.retrieve_resume_section_item(user=self.user, resume_section_item_id=item.id)
        self.assertEqual(fetched, item)

        updated = self.item_service.update_resume_section_item(
            user=self.user,
            resume_section_item_id=item.id,
            data={"display_order": 2},
        )
        self.assertEqual(updated.display_order, 2)

        self.item_service.delete_resume_section_item(user=self.user, resume_section_item_id=item.id)
        self.assertFalse(ResumeSectionItem.objects.filter(id=item.id).exists())

    def test_duplicate_item_create_raises_validation_error(self) -> None:
        section = ResumeSection.objects.create(
            resume=self.resume,
            section_type="experience",
            title="Experience",
            display_order=1,
            is_visible=True,
        )
        ResumeSectionItem.objects.create(
            resume_section=section,
            source_object_id=self.profile.id,
            display_order=1,
        )

        with self.assertRaises(ValidationError):
            self.item_service.create_resume_section_item(
                user=self.user,
                resume_section_id=section.id,
                data={
                    "source_object_id": self.profile.id,
                    "display_order": 2,
                },
            )

    def test_not_found_rules(self) -> None:
        with self.assertRaises(NotFound):
            self.section_service.create_resume_section(
                user=self.user,
                resume_id="00000000-0000-0000-0000-000000000000",
                data={
                    "section_type": "experience",
                    "title": "Experience",
                    "display_order": 1,
                    "is_visible": True,
                },
            )

        with self.assertRaises(NotFound):
            self.item_service.create_resume_section_item(
                user=self.user,
                resume_section_id="00000000-0000-0000-0000-000000000000",
                data={
                    "source_object_id": self.profile.id,
                    "display_order": 1,
                },
            )
