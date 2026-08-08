from __future__ import annotations

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from apps.career_profile.models import CareerProfile
from apps.jobs.models import JobStatus, SavedJob

User = get_user_model()


class SavedJobAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="jobuser@example.com",
            password="Password123!",
        )
        self.profile = CareerProfile.objects.create(user=self.user)
        self.client.force_authenticate(user=self.user)

    def test_create_saved_job(self):
        payload = {
            "title": "Senior Frontend Engineer",
            "company": "Acme Corp",
            "location": "Remote",
            "salary_range": "$140k - $180k",
            "source": "LinkedIn",
            "url": "https://example.com/jobs/1",
            "status": "saved",
            "description": "Looking for React & TypeScript expert.",
        }
        response = self.client.post("/api/v1/saved-jobs/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["data"]["title"], "Senior Frontend Engineer")
        self.assertEqual(response.data["data"]["company"], "Acme Corp")

    def test_list_saved_jobs(self):
        SavedJob.objects.create(
            career_profile=self.profile,
            title="Backend Engineer",
            company="TechCorp",
            status=JobStatus.SAVED,
        )
        response = self.client.get("/api/v1/saved-jobs/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["data"]), 1)

    def test_update_saved_job(self):
        job = SavedJob.objects.create(
            career_profile=self.profile,
            title="Fullstack Developer",
            company="Startup Inc",
            status=JobStatus.SAVED,
        )
        response = self.client.patch(
            f"/api/v1/saved-jobs/{job.id}/",
            {"status": "applied"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["status"], "applied")

    def test_delete_saved_job(self):
        job = SavedJob.objects.create(
            career_profile=self.profile,
            title="DevOps Lead",
            company="Cloud Co",
        )
        response = self.client.delete(f"/api/v1/saved-jobs/{job.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(SavedJob.objects.filter(id=job.id).count(), 0)
