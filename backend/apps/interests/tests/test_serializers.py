from __future__ import annotations

from django.test import TestCase

from ..serializers import InterestSerializer


class InterestSerializerTests(TestCase):
    def test_validation_and_representation(self) -> None:
        serializer = InterestSerializer(data={"name": " Machine Learning ", "display_order": 1})

        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(serializer.validated_data["name"], "Machine Learning")
