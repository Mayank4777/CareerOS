from __future__ import annotations

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from apps.accounts.models import User
from apps.career_profile.models import CareerProfile

from ..models import Skill


class SkillAPIViewTests(APITestCase):
    def setUp(self) -> None:
        self.client = APIClient()
        self.list_url = reverse("skills:skill-list")
        self.user = User.objects.create_user(email="view@example.com", password="strong-password")
        self.other_user = User.objects.create_user(email="other@example.com", password="strong-password")
        self.profile = CareerProfile.objects.create(user=self.user)
        self.other_profile = CareerProfile.objects.create(user=self.other_user)
        self.skill = Skill.objects.create(
            career_profile=self.profile,
            name="Python",
            category="Backend",
            proficiency_level="expert",
            years_of_experience=5,
            display_order=1,
        )
        self.other_skill = Skill.objects.create(
            career_profile=self.other_profile,
            name="Java",
            category="Backend",
            proficiency_level="advanced",
            years_of_experience=4,
            display_order=0,
        )
        self.detail_url = reverse("skills:skill-detail", kwargs={"skill_id": self.skill.id})
        self.other_detail_url = reverse("skills:skill-detail", kwargs={"skill_id": self.other_skill.id})

    def authenticate(self, user: User) -> None:
        self.client.force_authenticate(user=user)

    def test_authentication_required(self) -> None:
        response = self.client.get(self.list_url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_skill(self) -> None:
        self.authenticate(self.user)

        response = self.client.post(
            self.list_url,
            data={
                "name": "Django",
                "category": "Backend",
                "proficiency_level": "advanced",
                "years_of_experience": 4,
                "display_order": 2,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["data"]["name"], "Django")
        self.assertEqual(Skill.objects.filter(career_profile=self.profile).count(), 2)

    def test_list_own_skills(self) -> None:
        self.authenticate(self.user)

        response = self.client.get(self.list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["data"]), 1)
        self.assertEqual(response.data["data"][0]["name"], "Python")

    def test_retrieve_own_skill(self) -> None:
        self.authenticate(self.user)

        response = self.client.get(self.detail_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["name"], "Python")

    def test_cannot_access_another_users_skill(self) -> None:
        self.authenticate(self.user)

        response = self.client.get(self.other_detail_url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_own_skill(self) -> None:
        self.authenticate(self.user)

        response = self.client.patch(
            self.detail_url,
            data={"name": "Python 3"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["name"], "Python 3")

    def test_delete_own_skill(self) -> None:
        self.authenticate(self.user)

        response = self.client.delete(self.detail_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(Skill.objects.filter(id=self.skill.id).exists())

    def test_validation_error_for_missing_required_field(self) -> None:
        self.authenticate(self.user)

        response = self.client.post(
            self.list_url,
            data={
                "category": "Backend",
                "proficiency_level": "advanced",
                "years_of_experience": 4,
                "display_order": 2,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
