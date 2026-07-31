from __future__ import annotations

from django.test import TestCase

from ..serializers import VolunteerExperienceSerializer


class VolunteerExperienceSerializerTests(TestCase):
    def test_validation_and_representation(self) -> None:
        serializer = VolunteerExperienceSerializer(
            data={
                "organization": " Local NGO ",
                "role": " Mentor ",
                "description": " Mentored students ",
                "start_date": "2024-01-01",
                "currently_volunteering": True,
                "display_order": 1,
            }
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(serializer.validated_data["organization"], "Local NGO")
        self.assertEqual(serializer.validated_data["role"], "Mentor")
