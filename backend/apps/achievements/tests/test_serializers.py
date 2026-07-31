from __future__ import annotations

from django.test import TestCase

from ..serializers import AchievementSerializer


class AchievementSerializerTests(TestCase):
    def test_validation_and_representation(self) -> None:
        serializer = AchievementSerializer(
            data={
                "title": " Dean's List ",
                "description": " Recognized for academic excellence ",
                "achievement_date": "2024-01-01",
                "display_order": 1,
            }
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(serializer.validated_data["title"], "Dean's List")
        self.assertEqual(serializer.validated_data["description"], "Recognized for academic excellence")
