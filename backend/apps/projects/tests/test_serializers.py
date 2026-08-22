from __future__ import annotations

from django.test import TestCase

from ..serializers import ProjectSerializer


class ProjectSerializerTests(TestCase):
    def test_serializer_validates_and_strips_fields(self) -> None:
        serializer = ProjectSerializer(
            data={
                "title": " CareerOS ",
                "organization": " OpenAI ",
                "role": " Backend ",
                "description": " Career tracking platform ",
                "technologies": " Django, DRF ",
                "currently_active": True,
                "display_order": 1,
            }
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(serializer.validated_data["title"], "CareerOS")
        self.assertEqual(serializer.validated_data["description"], "Career tracking platform")
        self.assertEqual(serializer.validated_data["technologies"], "Django, DRF")

    def test_serializer_rejects_invalid_date_combinations(self) -> None:
        serializer = ProjectSerializer(
            data={
                "title": "CareerOS",
                "description": "Career tracking platform",
                "technologies": "Django, DRF",
                "start_date": "2024-01-01",
                "end_date": "2023-01-01",
                "currently_active": False,
            }
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("end_date", serializer.errors)
