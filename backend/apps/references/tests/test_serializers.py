from __future__ import annotations

from django.test import TestCase

from ..serializers import ReferenceSerializer


class ReferenceSerializerTests(TestCase):
    def test_validation_and_representation(self) -> None:
        serializer = ReferenceSerializer(
            data={
                "name": " Jane Doe ",
                "designation": " Engineering Manager ",
                "company": " OpenAI ",
                "email": "jane@example.com",
                "phone": "1234567890",
                "relationship": "Mentor",
                "display_order": 1,
            }
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(serializer.validated_data["name"], "Jane Doe")
        self.assertEqual(serializer.validated_data["designation"], "Engineering Manager")
