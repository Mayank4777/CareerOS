from __future__ import annotations

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from apps.applications.models import Application, ApplicationStatus
from apps.career_profile.models import CareerProfile

User = get_user_model()


class ApplicationAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="appuser@example.com",
            password="Password123!",
        )
        self.profile = CareerProfile.objects.create(user=self.user)
        self.client.force_authenticate(user=self.user)

    def test_create_application(self):
        payload = {
            "company": "Google",
            "position": "Software Engineer",
            "status": "applied",
            "location": "Mountain View, CA",
            "salary": "$160,000",
            "job_url": "https://careers.google.com/jobs/123",
            "notes": "Applied via referral.",
        }
        response = self.client.post("/api/v1/applications/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["data"]["company"], "Google")
        self.assertEqual(response.data["data"]["position"], "Software Engineer")

    def test_list_applications(self):
        Application.objects.create(
            career_profile=self.profile,
            company="Microsoft",
            position="Product Manager",
            status=ApplicationStatus.INTERVIEWING,
        )
        response = self.client.get("/api/v1/applications/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["data"]), 1)

    def test_update_application_status(self):
        app = Application.objects.create(
            career_profile=self.profile,
            company="Meta",
            position="Frontend Architect",
            status=ApplicationStatus.APPLIED,
        )
        response = self.client.patch(
            f"/api/v1/applications/{app.id}/",
            {"status": "interviewing"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["status"], "interviewing")

    def test_delete_application(self):
        app = Application.objects.create(
            career_profile=self.profile,
            company="Amazon",
            position="SDE II",
        )
        response = self.client.delete(f"/api/v1/applications/{app.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Application.objects.filter(id=app.id).count(), 0)

    def test_application_with_saved_job_relationship(self):
        from apps.jobs.models import SavedJob
        job = SavedJob.objects.create(
            career_profile=self.profile,
            company="Apple",
            title="iOS Engineer",
        )
        payload = {
            "company": "Apple",
            "position": "iOS Engineer",
            "status": "applied",
            "job": str(job.id),
        }
        response = self.client.post("/api/v1/applications/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(str(response.data["data"]["job"]), str(job.id))

        # Application without saved job works seamlessly
        payload_no_job = {
            "company": "Netflix",
            "position": "Backend Engineer",
            "status": "applied",
        }
        resp_no_job = self.client.post("/api/v1/applications/", payload_no_job, format="json")
        self.assertEqual(resp_no_job.status_code, status.HTTP_201_CREATED)
        self.assertIsNone(resp_no_job.data["data"]["job"])

