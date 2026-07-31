from __future__ import annotations

from django.test import TestCase

from ..serializers import AwardSerializer


class AwardSerializerTests(TestCase):
    def test_validation_and_representation(self) -> None:
        serializer = AwardSerializer(
            data={
                "title": " Employee of the Month ",
                "issuer": " OpenAI ",
                "award_date": "2024-01-01",
                "description": " Recognized for excellent work ",
                "display_order": 1,
            }
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(serializer.validated_data["title"], "Employee of the Month")
        self.assertEqual(serializer.validated_data["issuer"], "OpenAI")
