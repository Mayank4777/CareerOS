from __future__ import annotations

from django.test import TestCase

from ..serializers import PublicationSerializer


class PublicationSerializerTests(TestCase):
    def test_validation_and_representation(self) -> None:
        serializer = PublicationSerializer(
            data={
                "title": " Research Paper ",
                "publisher": " Journal ",
                "publication_date": "2024-01-01",
                "publication_url": "https://example.com/paper",
                "description": " Published in a journal ",
                "display_order": 1,
            }
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(serializer.validated_data["title"], "Research Paper")
        self.assertEqual(serializer.validated_data["publisher"], "Journal")
