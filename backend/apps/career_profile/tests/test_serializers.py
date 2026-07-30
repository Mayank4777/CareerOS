from __future__ import annotations

from django.test import TestCase

from apps.accounts.models import User

from ..models import CareerProfile
from ..serializers import CareerProfileSerializer


class CareerProfileSerializerTests(TestCase):
    def test_serializer_strips_text_fields(self) -> None:
        serializer = CareerProfileSerializer(
            data={
                "first_name": " Ada ",
                "last_name": " Lovelace ",
                "headline": " Backend Engineer ",
                "summary": " About me ",
                "phone": " 1234567890 ",
                "location": " London ",
                "website": "",
                "linkedin_url": "",
                "github_url": "",
            }
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(serializer.validated_data["first_name"], "Ada")
        self.assertEqual(serializer.validated_data["last_name"], "Lovelace")
        self.assertEqual(serializer.validated_data["headline"], "Backend Engineer")
        self.assertEqual(serializer.validated_data["summary"], "About me")
        self.assertEqual(serializer.validated_data["phone"], "1234567890")
        self.assertEqual(serializer.validated_data["location"], "London")

    def test_serializer_represents_profile(self) -> None:
        user = User.objects.create_user(email="demo@example.com", password="strong-password")
        profile = CareerProfile.objects.create(user=user, headline="Engineer")

        serializer = CareerProfileSerializer(profile)

        self.assertEqual(serializer.data["headline"], "Engineer")
        self.assertEqual(serializer.data["user"], user.id)
