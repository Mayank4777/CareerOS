from __future__ import annotations

import uuid

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from apps.accounts.models import User
from apps.career_profile.models import CareerProfile
from apps.resumes.models import Resume

from ..models import ResumeSection, ResumeSectionItem


class ResumeEditorAPIViewTests(APITestCase):
    def setUp(self) -> None:
        self.client = APIClient()
        self.user = User.objects.create_user(email="view@example.com", password="strong-password")
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
        self.other_item = ResumeSectionItem.objects.create(
            resume_section=self.other_section,
            source_object_id=self.other_profile.id,
            display_order=0,
        )
        self.section_list_url = reverse("resume_editor:resume-section-list", kwargs={"resume_id": self.resume.id})
        self.section_detail_url = reverse(
            "resume_editor:resume-section-detail",
            kwargs={"resume_section_id": self.section.id},
        )
        self.other_section_detail_url = reverse(
            "resume_editor:resume-section-detail",
            kwargs={"resume_section_id": self.other_section.id},
        )
        self.item_list_url = reverse(
            "resume_editor:resume-section-item-list",
            kwargs={"resume_section_id": self.section.id},
        )
        self.item_detail_url = reverse(
            "resume_editor:resume-section-item-detail",
            kwargs={"resume_section_item_id": self.item.id},
        )
        self.other_item_detail_url = reverse(
            "resume_editor:resume-section-item-detail",
            kwargs={"resume_section_item_id": self.other_item.id},
        )

    def authenticate(self, user: User) -> None:
        self.client.force_authenticate(user=user)

    def test_authentication_required(self) -> None:
        response = self.client.get(self.section_list_url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_section(self) -> None:
        self.authenticate(self.user)

        response = self.client.post(
            self.section_list_url,
            data={
                "section_type": "experience",
                "title": "Experience",
                "display_order": 1,
                "is_visible": True,
                "resume": str(self.other_resume.id),
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["data"]["title"], "Experience")
        self.assertEqual(ResumeSection.objects.filter(resume=self.resume).count(), 2)

    def test_list_sections(self) -> None:
        self.authenticate(self.user)

        response = self.client.get(self.section_list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["data"]), 1)
        self.assertEqual(response.data["data"][0]["title"], "Experience")

    def test_foreign_resume_sections_return_not_found(self) -> None:
        self.authenticate(self.user)

        response = self.client.get(
            reverse("resume_editor:resume-section-list", kwargs={"resume_id": self.other_resume.id})
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_patch_section(self) -> None:
        self.authenticate(self.user)

        response = self.client.patch(
            self.section_detail_url,
            data={"title": "Work Experience", "is_visible": False},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["title"], "Work Experience")
        self.assertFalse(response.data["data"]["is_visible"])

    def test_delete_section(self) -> None:
        self.authenticate(self.user)

        response = self.client.delete(self.section_detail_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(ResumeSection.objects.filter(id=self.section.id).exists())

    def test_cross_user_section_access_blocked(self) -> None:
        self.authenticate(self.user)

        response = self.client.patch(
            self.other_section_detail_url,
            data={"title": "Nope"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_create_item(self) -> None:
        self.authenticate(self.user)

        response = self.client.post(
            self.item_list_url,
            data={
                "source_object_id": str(uuid.uuid4()),
                "display_order": 2,
                "resume_section": str(self.other_section.id),
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["data"]["display_order"], 2)
        self.assertEqual(ResumeSectionItem.objects.filter(resume_section=self.section).count(), 2)

    def test_duplicate_item_create_returns_validation_error(self) -> None:
        self.authenticate(self.user)

        response = self.client.post(
            self.item_list_url,
            data={
                "source_object_id": str(self.profile.id),
                "display_order": 2,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("source_object_id", response.data["errors"])

    def test_list_items(self) -> None:
        self.authenticate(self.user)

        response = self.client.get(self.item_list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["data"]), 1)

    def test_foreign_resume_section_items_return_not_found(self) -> None:
        self.authenticate(self.user)

        response = self.client.get(
            reverse(
                "resume_editor:resume-section-item-list",
                kwargs={"resume_section_id": self.other_section.id},
            )
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_patch_item(self) -> None:
        self.authenticate(self.user)

        response = self.client.patch(
            self.item_detail_url,
            data={"display_order": 3},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["display_order"], 3)

    def test_delete_item(self) -> None:
        self.authenticate(self.user)

        response = self.client.delete(self.item_detail_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(ResumeSectionItem.objects.filter(id=self.item.id).exists())

    def test_cross_user_item_access_blocked(self) -> None:
        self.authenticate(self.user)

        response = self.client.patch(
            self.other_item_detail_url,
            data={"display_order": 7},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_validation_errors(self) -> None:
        self.authenticate(self.user)

        section_response = self.client.post(
            self.section_list_url,
            data={"section_type": " ", "title": " ", "display_order": 0, "is_visible": True},
            format="json",
        )
        self.assertEqual(section_response.status_code, status.HTTP_400_BAD_REQUEST)

        item_response = self.client.post(
            self.item_list_url,
            data={"source_object_id": "not-a-uuid", "display_order": 0},
            format="json",
        )
        self.assertEqual(item_response.status_code, status.HTTP_400_BAD_REQUEST)
