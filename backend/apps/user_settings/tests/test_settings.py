from __future__ import annotations

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class UserSettingsAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="settingsuser@example.com",
            password="Password123!",
        )
        self.client.force_authenticate(user=self.user)

    def test_get_settings(self):
        response = self.client.get("/api/v1/settings/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["theme"], "system")
        self.assertTrue(response.data["data"]["email_notifications"])

    def test_update_settings(self):
        payload = {
            "theme": "dark",
            "timezone": "America/New_York",
            "email_notifications": False,
        }
        response = self.client.patch("/api/v1/settings/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["theme"], "dark")
        self.assertFalse(response.data["data"]["email_notifications"])

    def test_change_password(self):
        payload = {
            "current_password": "Password123!",
            "new_password": "NewSecretPassword123!",
        }
        response = self.client.post("/api/v1/settings/change-password/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("NewSecretPassword123!"))
