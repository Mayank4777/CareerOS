from __future__ import annotations

from django.test import TestCase

from ..serializers import ResumeSectionItemSerializer, ResumeSectionSerializer


class ResumeEditorSerializerTests(TestCase):
    def test_resume_section_serializer_validation(self) -> None:
        serializer = ResumeSectionSerializer(
            data={
                "section_type": " experience ",
                "title": " Experience ",
                "display_order": 1,
                "is_visible": True,
            }
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(serializer.validated_data["section_type"], "experience")
        self.assertEqual(serializer.validated_data["title"], "Experience")

    def test_resume_section_item_serializer_validation(self) -> None:
        serializer = ResumeSectionItemSerializer(
            data={
                "source_object_id": "550e8400-e29b-41d4-a716-446655440000",
                "display_order": 1,
            }
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(str(serializer.validated_data["source_object_id"]), "550e8400-e29b-41d4-a716-446655440000")

