from __future__ import annotations

from django.test import TestCase

from apps.accounts.models import User
from apps.career_profile.models import CareerProfile

from ..models import Resume
from ..serializers import ResumeSerializer


class ResumeSerializerTests(TestCase):
    def setUp(self) -> None:
        self.user = User.objects.create_user(email="serializer@example.com", password="strong-password")
        self.profile = CareerProfile.objects.create(user=self.user)

    def test_serializer_strips_text_fields(self) -> None:
        serializer = ResumeSerializer(
            data={
                "title": " Backend Resume ",
                "template": " Minimal ",
                "status": "draft",
            }
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(serializer.validated_data["title"], "Backend Resume")
        self.assertEqual(serializer.validated_data["template"], "Minimal")

    def test_serializer_represents_resume(self) -> None:
        resume = Resume.objects.create(
            career_profile=self.profile,
            title="Backend Resume",
            template="Minimal",
            status="draft",
        )

        serializer = ResumeSerializer(resume)

        self.assertEqual(serializer.data["title"], "Backend Resume")
        self.assertEqual(serializer.data["status"], "draft")

    def test_title_cannot_be_blank(self) -> None:
        serializer = ResumeSerializer(
            data={
                "title": "   ",
                "template": "Minimal",
                "status": "draft",
            }
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("title", serializer.errors)

    def test_invalid_status_is_rejected(self) -> None:
        serializer = ResumeSerializer(
            data={
                "title": "Backend Resume",
                "template": "Minimal",
                "status": "invalid",
            }
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("status", serializer.errors)

