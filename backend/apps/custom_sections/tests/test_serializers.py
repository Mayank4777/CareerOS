from __future__ import annotations

from django.test import TestCase

from ..serializers import CustomSectionSerializer


class CustomSectionSerializerTests(TestCase):
    def test_validation_and_representation(self) -> None:
        serializer = CustomSectionSerializer(
            data={
                "title": " Additional Information ",
                "content": " Open source contributor ",
                "display_order": 1,
            }
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(serializer.validated_data["title"], "Additional Information")
        self.assertEqual(serializer.validated_data["content"], "Open source contributor")
