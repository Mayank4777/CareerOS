from __future__ import annotations

from django.test import TestCase

from apps.accounts.models import User

from ..models import CareerProfile, Education
from ..serializers import EducationSerializer


class EducationSerializerTests(TestCase):
    def test_serializer_strips_text_fields(self) -> None:
        serializer = EducationSerializer(
            data={
                "institution": " Example University ",
                "degree": " B.Tech ",
                "field_of_study": " Computer Science ",
                "start_date": "2020-01-01",
                "end_date": "2024-01-01",
                "grade": " First Class ",
            }
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(serializer.validated_data["institution"], "Example University")
        self.assertEqual(serializer.validated_data["degree"], "B.Tech")
        self.assertEqual(serializer.validated_data["field_of_study"], "Computer Science")
        self.assertEqual(serializer.validated_data["grade"], "First Class")

    def test_serializer_represents_education(self) -> None:
        user = User.objects.create_user(email="eduser@example.com", password="strong-password")
        profile = CareerProfile.objects.create(user=user)
        education = Education.objects.create(
            career_profile=profile,
            institution="Example University",
            degree="B.Tech",
            field_of_study="Computer Science",
            start_date="2020-01-01",
            end_date="2024-01-01",
            grade="8.5 CGPA",
        )

        serializer = EducationSerializer(education)

        self.assertEqual(serializer.data["institution"], "Example University")
        self.assertEqual(serializer.data["user"], user.id)
