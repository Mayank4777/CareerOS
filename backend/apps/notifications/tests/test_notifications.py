from __future__ import annotations

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from apps.notifications.models import Notification, NotificationType

User = get_user_model()


class NotificationAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="notiuser@example.com",
            password="Password123!",
        )
        self.client.force_authenticate(user=self.user)

    def test_list_notifications(self):
        Notification.objects.create(
            user=self.user,
            type=NotificationType.INTERVIEW,
            title="Upcoming Interview",
            message="Your technical interview with Stripe starts in 1 hour.",
        )
        response = self.client.get("/api/v1/notifications/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["data"]), 1)
        self.assertFalse(response.data["data"][0]["is_read"])

    def test_mark_notification_read(self):
        notification = Notification.objects.create(
            user=self.user,
            type=NotificationType.SYSTEM,
            title="Welcome to CareerOS",
            message="Your profile has been created successfully.",
        )
        response = self.client.patch(f"/api/v1/notifications/{notification.id}/read/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["data"]["is_read"])

    def test_mark_all_notifications_read(self):
        Notification.objects.create(user=self.user, title="N1", message="M1")
        Notification.objects.create(user=self.user, title="N2", message="M2")
        response = self.client.patch("/api/v1/notifications/read-all/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Notification.objects.filter(user=self.user, is_read=True).count(), 2)

    def test_delete_notification(self):
        notification = Notification.objects.create(
            user=self.user,
            title="Clear me",
            message="Message to remove.",
        )
        response = self.client.delete(f"/api/v1/notifications/{notification.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Notification.objects.filter(id=notification.id).count(), 0)
