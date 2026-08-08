from __future__ import annotations

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.applications.models import Application
from apps.career_profile.models import CareerProfile
from apps.interviews.models import Interview, InterviewStatus, InterviewType

User = get_user_model()


class InterviewAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="interviewuser@example.com",
            password="Password123!",
        )
        self.profile = CareerProfile.objects.create(user=self.user)
        self.application = Application.objects.create(
            career_profile=self.profile,
            company="Stripe",
            position="Staff Engineer",
        )
        self.client.force_authenticate(user=self.user)

    def test_schedule_interview(self):
        payload = {
            "application": str(self.application.id),
            "round": "Technical Phone Screen",
            "interview_type": "technical",
            "scheduled_at": timezone.now().isoformat(),
            "status": "scheduled",
            "interviewer_name": "Sarah Connor",
            "location_or_link": "https://zoom.us/j/999888777",
            "notes": "Focus on data structures and concurrency.",
        }
        response = self.client.post("/api/v1/interviews/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["data"]["round"], "Technical Phone Screen")
        self.assertEqual(response.data["data"]["company_name"], "Stripe")

    def test_list_interviews(self):
        Interview.objects.create(
            application=self.application,
            round="System Design",
            interview_type=InterviewType.SYSTEM_DESIGN,
            scheduled_at=timezone.now(),
            status=InterviewStatus.SCHEDULED,
        )
        response = self.client.get("/api/v1/interviews/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["data"]), 1)

    def test_update_interview_feedback(self):
        interview = Interview.objects.create(
            application=self.application,
            round="HR Round",
            interview_type=InterviewType.HR,
            scheduled_at=timezone.now(),
            status=InterviewStatus.SCHEDULED,
        )
        response = self.client.patch(
            f"/api/v1/interviews/{interview.id}/",
            {"status": "completed", "feedback": "Great alignment on values."},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["status"], "completed")

    def test_delete_interview(self):
        interview = Interview.objects.create(
            application=self.application,
            round="Coding Round",
            interview_type=InterviewType.TECHNICAL,
            scheduled_at=timezone.now(),
        )
        response = self.client.delete(f"/api/v1/interviews/{interview.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Interview.objects.filter(id=interview.id).count(), 0)
