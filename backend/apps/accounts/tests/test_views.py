from __future__ import annotations

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from apps.accounts.models import User


class AccountsAPIViewTests(APITestCase):
    def setUp(self) -> None:
        self.client = APIClient()
        self.register_url = reverse("accounts:register")
        self.login_url = reverse("accounts:login")
        self.me_url = reverse("accounts:me")
        self.refresh_url = reverse("accounts:refresh")

    def test_register_success_returns_jwt_tokens(self) -> None:
        payload = {
            "email": "newuser@example.com",
            "first_name": "New",
            "last_name": "User",
            "password": "StrongPassword123!",
            "confirm_password": "StrongPassword123!",
        }
        response = self.client.post(self.register_url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["success"])
        self.assertIn("access", response.data["data"])
        self.assertIn("refresh", response.data["data"])
        self.assertIn("user", response.data["data"])
        self.assertEqual(response.data["data"]["user"]["email"], "newuser@example.com")

    def test_register_password_mismatch(self) -> None:
        payload = {
            "email": "mismatch@example.com",
            "first_name": "Mismatch",
            "last_name": "User",
            "password": "Password123!",
            "confirm_password": "DifferentPassword123!",
        }
        response = self.client.post(self.register_url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data["success"])

    def test_register_duplicate_email(self) -> None:
        User.objects.create_user(email="existing@example.com", password="Password123!")
        payload = {
            "email": "existing@example.com",
            "first_name": "Duplicate",
            "last_name": "User",
            "password": "Password123!",
            "confirm_password": "Password123!",
        }
        response = self.client.post(self.register_url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(response.data["message"], "Email already exists.")

    def test_login_success(self) -> None:
        User.objects.create_user(email="login@example.com", password="Password123!")
        payload = {
            "email": "login@example.com",
            "password": "Password123!",
        }
        response = self.client.post(self.login_url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertIn("access", response.data["data"])
        self.assertIn("refresh", response.data["data"])
        self.assertIn("user", response.data["data"])
        self.assertEqual(response.data["data"]["user"]["email"], "login@example.com")

    def test_login_invalid_credentials(self) -> None:
        User.objects.create_user(email="login@example.com", password="Password123!")
        payload = {
            "email": "login@example.com",
            "password": "WrongPassword!",
        }
        response = self.client.post(self.login_url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data["message"], "Invalid email or password.")
