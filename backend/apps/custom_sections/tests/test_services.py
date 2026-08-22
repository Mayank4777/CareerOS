from __future__ import annotations

from django.test import TestCase
from rest_framework.exceptions import NotFound

from apps.accounts.models import User
from apps.career_profile.models import CareerProfile

from ..models import CustomSection
from ..services import CustomSectionService


class CustomSectionServiceTests(TestCase):
    def test_crud_and_not_found(self) -> None:
        user = User.objects.create_user(email="srv@example.com", password="strong-password")
        profile = CareerProfile.objects.create(user=user)
        service = CustomSectionService()

        custom_section = service.create_custom_section(
            user=user,
            data={
                "title": "Additional Information",
                "content": "Open source contributor",
            },
        )
        self.assertEqual(custom_section.career_profile, profile)

        fetched = service.retrieve_custom_section(user=user, custom_section_id=custom_section.id)
        self.assertEqual(fetched, custom_section)

        updated = service.update_custom_section(
            user=user,
            custom_section_id=custom_section.id,
            data={"title": "More Information"},
        )
        self.assertEqual(updated.title, "More Information")

        service.delete_custom_section(user=user, custom_section_id=custom_section.id)
        self.assertFalse(CustomSection.objects.filter(id=custom_section.id).exists())

        with self.assertRaises(NotFound):
            service.retrieve_custom_section(user=user, custom_section_id="00000000-0000-0000-0000-000000000000")
