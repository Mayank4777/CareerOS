from __future__ import annotations

from django.test import TestCase

from ..serializers import LanguageSerializer


class LanguageSerializerTests(TestCase):
    def test_validation_and_required_language(self) -> None:
        serializer = LanguageSerializer(data={"language": " English ", "proficiency": "native"})
        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(serializer.validated_data["language"], "English")

        invalid = LanguageSerializer(data={"proficiency": "native"})
        self.assertFalse(invalid.is_valid())
        self.assertIn("language", invalid.errors)
