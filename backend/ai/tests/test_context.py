from __future__ import annotations

import uuid
from django.contrib.auth import get_user_model
from django.test import TestCase

from ai.context import UserContextBuilder
from apps.applications.models import Application
from apps.career_profile.models import CareerProfile
from apps.interviews.models import Interview
from apps.jobs.models import SavedJob
from apps.resumes.models import Resume

User = get_user_model()


class UserContextBuilderTests(TestCase):
    def setUp(self) -> None:
        self.user1 = User.objects.create_user(email="user1@example.com", password="Password123!")
        self.profile1 = CareerProfile.objects.create(
            user=self.user1,
            first_name="Alice",
            last_name="Smith",
            headline="Software Engineer",
            summary="Experienced backend dev",
        )
        self.user2 = User.objects.create_user(email="user2@example.com", password="Password123!")
        self.profile2 = CareerProfile.objects.create(
            user=self.user2,
            first_name="Bob",
            last_name="Jones",
            headline="Product Manager",
        )
        self.builder = UserContextBuilder()

    def test_build_user_context_success(self) -> None:
        ctx = self.builder.build_user_context(self.user1)
        self.assertEqual(ctx["candidate_name"], "Alice Smith")
        self.assertEqual(ctx["headline"], "Software Engineer")
        self.assertEqual(ctx["summary"], "Experienced backend dev")

    def test_build_resume_context_ownership_isolation(self) -> None:
        resume1 = Resume.objects.create(career_profile=self.profile1, title="Alice Resume")
        resume2 = Resume.objects.create(career_profile=self.profile2, title="Bob Resume")

        ctx = self.builder.build_resume_context(self.user1, str(resume1.id))
        self.assertEqual(ctx["title"], "Alice Resume")

        # User 1 cannot access User 2's resume context
        with self.assertRaises(ValueError):
            self.builder.build_resume_context(self.user1, str(resume2.id))

    def test_build_job_context_ownership_isolation(self) -> None:
        job1 = SavedJob.objects.create(career_profile=self.profile1, company="Google", title="SDE")
        job2 = SavedJob.objects.create(career_profile=self.profile2, company="Apple", title="iOS Dev")

        ctx = self.builder.build_job_context(self.user1, str(job1.id))
        self.assertEqual(ctx["company"], "Google")

        with self.assertRaises(ValueError):
            self.builder.build_job_context(self.user1, str(job2.id))

    def test_nonexistent_entity_handling(self) -> None:
        random_uuid = str(uuid.uuid4())
        with self.assertRaises(ValueError):
            self.builder.build_resume_context(self.user1, random_uuid)
        with self.assertRaises(ValueError):
            self.builder.build_job_context(self.user1, random_uuid)
        with self.assertRaises(ValueError):
            self.builder.build_application_context(self.user1, random_uuid)
        with self.assertRaises(ValueError):
            self.builder.build_interview_context(self.user1, random_uuid)
