from __future__ import annotations

import uuid

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from apps.career_profile.models import CareerProfile
from apps.jobs.models import SavedJob
from apps.ai_coach.models import CareerRoadmap, RoadmapPhase

User = get_user_model()


class CareerRoadmapDomainTestCase(APITestCase):
    def setUp(self) -> None:
        self.user1 = User.objects.create_user(email="roadmap_user1@example.com", password="Password123!")
        self.profile1 = CareerProfile.objects.create(
            user=self.user1,
            first_name="Alice",
            last_name="Architect",
            headline="Solutions Architect",
        )
        self.job1 = SavedJob.objects.create(
            career_profile=self.profile1,
            title="Lead Architect",
            company="Enterprise Corp",
        )

        self.user2 = User.objects.create_user(email="roadmap_user2@example.com", password="Password123!")
        self.profile2 = CareerProfile.objects.create(user=self.user2, first_name="Bob", last_name="Engineer")
        self.job2 = SavedJob.objects.create(
            career_profile=self.profile2,
            title="Bob Target Role",
            company="Acme Corp",
        )

        self.client.force_authenticate(user=self.user1)

    def test_roadmap_creation_with_phases(self) -> None:
        payload = {
            "title": "Cloud Architect Progression",
            "description": "Step by step path to Lead Architect",
            "target_role": "Lead Architect",
            "target_job_id": str(self.job1.id),
            "status": "in_progress",
            "phases": [
                {
                    "title": "Phase 2: Distributed Systems",
                    "description": "Learn event-driven architectures",
                    "objective": "Build event stream pipelines",
                    "skills": ["Kafka", "Redis"],
                    "actions": ["Implement Kafka consumer"],
                    "status": "upcoming",
                    "ordering": 2,
                    "estimated_duration": "3 weeks",
                },
                {
                    "title": "Phase 1: AWS Certification",
                    "description": "Complete Solutions Architect Professional exam",
                    "objective": "Pass AWS exam",
                    "skills": ["AWS", "CloudFormation"],
                    "actions": ["Take practice exams"],
                    "status": "in_progress",
                    "ordering": 1,
                    "estimated_duration": "4 weeks",
                },
            ],
        }

        response = self.client.post("/api/v1/ai/roadmap/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["success"])
        data = response.data["data"]

        self.assertEqual(data["title"], "Cloud Architect Progression")
        self.assertEqual(len(data["phases"]), 2)

        # Verify phase ordering in created response
        self.assertEqual(data["phases"][0]["title"], "Phase 1: AWS Certification")
        self.assertEqual(data["phases"][0]["ordering"], 1)
        self.assertEqual(data["phases"][1]["title"], "Phase 2: Distributed Systems")
        self.assertEqual(data["phases"][1]["ordering"], 2)

        # DB checks
        roadmap = CareerRoadmap.objects.get(id=data["id"])
        self.assertEqual(roadmap.career_profile, self.profile1)
        self.assertEqual(roadmap.target_job, self.job1)
        self.assertEqual(roadmap.phases.count(), 2)

    def test_roadmap_retrieval_with_ordered_phases(self) -> None:
        roadmap = CareerRoadmap.objects.create(
            career_profile=self.profile1,
            title="DevOps Engineer Path",
        )
        RoadmapPhase.objects.create(
            roadmap=roadmap,
            title="Phase B: Kubernetes",
            ordering=2,
        )
        RoadmapPhase.objects.create(
            roadmap=roadmap,
            title="Phase A: Linux Fundamentals",
            ordering=1,
        )

        response = self.client.get(f"/api/v1/ai/roadmap/{roadmap.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        phases = response.data["data"]["phases"]
        self.assertEqual(len(phases), 2)
        self.assertEqual(phases[0]["title"], "Phase A: Linux Fundamentals")
        self.assertEqual(phases[1]["title"], "Phase B: Kubernetes")

    def test_empty_roadmap_handling(self) -> None:
        roadmap = CareerRoadmap.objects.create(
            career_profile=self.profile1,
            title="Empty Roadmap",
        )
        response = self.client.get(f"/api/v1/ai/roadmap/{roadmap.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["phases"], [])

    def test_cross_user_roadmap_isolation(self) -> None:
        bob_roadmap = CareerRoadmap.objects.create(
            career_profile=self.profile2,
            title="Bob Private Roadmap",
        )
        RoadmapPhase.objects.create(
            roadmap=bob_roadmap,
            title="Bob Phase 1",
            ordering=1,
        )

        # User 1 attempting GET, PATCH, DELETE on Bob's roadmap -> 404
        response_get = self.client.get(f"/api/v1/ai/roadmap/{bob_roadmap.id}/")
        self.assertEqual(response_get.status_code, status.HTTP_404_NOT_FOUND)

        response_patch = self.client.patch(
            f"/api/v1/ai/roadmap/{bob_roadmap.id}/",
            {"title": "Hacked Title"},
            format="json",
        )
        self.assertEqual(response_patch.status_code, status.HTTP_404_NOT_FOUND)

        response_delete = self.client.delete(f"/api/v1/ai/roadmap/{bob_roadmap.id}/")
        self.assertEqual(response_delete.status_code, status.HTTP_404_NOT_FOUND)

    def test_cross_user_phase_isolation(self) -> None:
        bob_roadmap = CareerRoadmap.objects.create(
            career_profile=self.profile2,
            title="Bob Private Roadmap",
        )
        bob_phase = RoadmapPhase.objects.create(
            roadmap=bob_roadmap,
            title="Bob Secret Phase",
            ordering=1,
        )

        # User 1 attempting to add phase to Bob's roadmap -> 404
        res_add = self.client.post(
            f"/api/v1/ai/roadmap/{bob_roadmap.id}/phases/",
            {"title": "Unauthorized Phase", "ordering": 2},
            format="json",
        )
        self.assertEqual(res_add.status_code, status.HTTP_404_NOT_FOUND)

        # User 1 attempting PATCH or DELETE on Bob's phase -> 404
        res_patch = self.client.patch(
            f"/api/v1/ai/roadmap/{bob_roadmap.id}/phases/{bob_phase.id}/",
            {"title": "Compromised Phase"},
            format="json",
        )
        self.assertEqual(res_patch.status_code, status.HTTP_404_NOT_FOUND)

        res_del = self.client.delete(f"/api/v1/ai/roadmap/{bob_roadmap.id}/phases/{bob_phase.id}/")
        self.assertEqual(res_del.status_code, status.HTTP_404_NOT_FOUND)

    def test_invalid_target_job_reference_rejection(self) -> None:
        # User 1 referencing User 2's target job
        payload = {
            "title": "Invalid Target Job Roadmap",
            "target_job_id": str(self.job2.id),
        }
        response = self.client.post("/api/v1/ai/roadmap/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # User 1 referencing nonexistent job UUID
        payload_nonexistent = {
            "title": "Nonexistent Job Roadmap",
            "target_job_id": str(uuid.uuid4()),
        }
        response_nonexistent = self.client.post("/api/v1/ai/roadmap/", payload_nonexistent, format="json")
        self.assertEqual(response_nonexistent.status_code, status.HTTP_400_BAD_REQUEST)

    def test_roadmap_update_and_delete_ownership(self) -> None:
        roadmap = CareerRoadmap.objects.create(
            career_profile=self.profile1,
            title="Initial Title",
        )

        # Patch update
        patch_res = self.client.patch(
            f"/api/v1/ai/roadmap/{roadmap.id}/",
            {"title": "Updated Title", "status": "completed"},
            format="json",
        )
        self.assertEqual(patch_res.status_code, status.HTTP_200_OK)
        self.assertEqual(patch_res.data["data"]["title"], "Updated Title")

        # Delete
        del_res = self.client.delete(f"/api/v1/ai/roadmap/{roadmap.id}/")
        self.assertEqual(del_res.status_code, status.HTTP_200_OK)
        self.assertFalse(CareerRoadmap.objects.filter(id=roadmap.id).exists())

    def test_roadmap_list_returns_user_roadmaps_only(self) -> None:
        CareerRoadmap.objects.create(career_profile=self.profile1, title="Alice Roadmap 1")
        CareerRoadmap.objects.create(career_profile=self.profile1, title="Alice Roadmap 2")
        CareerRoadmap.objects.create(career_profile=self.profile2, title="Bob Roadmap")

        response = self.client.get("/api/v1/ai/roadmap/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data["data"]
        self.assertEqual(len(data), 2)
        titles = [r["title"] for r in data]
        self.assertIn("Alice Roadmap 1", titles)
        self.assertIn("Alice Roadmap 2", titles)
        self.assertNotIn("Bob Roadmap", titles)

    def test_deterministic_roadmap_generation_success(self) -> None:
        from apps.skills.models import Skill

        # Profile 1 has Python and Django
        Skill.objects.create(career_profile=self.profile1, name="Python", category="Backend")
        Skill.objects.create(career_profile=self.profile1, name="Django", category="Backend")

        # Job 1 requires Python, Django, AWS, and Docker
        self.job1.description = "Required skills: Python, Django, AWS, Docker."
        self.job1.save()

        payload = {"job_id": str(self.job1.id)}
        response = self.client.post("/api/v1/ai/roadmap/generate/", payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        data = response.data["data"]

        self.assertIn("Lead Architect", data["title"])
        self.assertTrue(len(data["phases"]) >= 2)

        # Check phase attributes & ordering
        orderings = [p["ordering"] for p in data["phases"]]
        self.assertEqual(orderings, sorted(orderings))

        for p in data["phases"]:
            self.assertTrue(len(p["title"]) > 0)
            self.assertTrue(len(p["objective"]) > 0)
            self.assertTrue(len(p["actions"]) > 0)
            self.assertIsInstance(p["actions"], list)

        # Database persistence check
        self.assertEqual(CareerRoadmap.objects.filter(career_profile=self.profile1, target_job=self.job1).count(), 1)

    def test_deterministic_generation_duplicate_prevention(self) -> None:
        self.job1.description = "Required skills: Python, AWS."
        self.job1.save()

        payload = {"job_id": str(self.job1.id)}
        res1 = self.client.post("/api/v1/ai/roadmap/generate/", payload, format="json")
        self.assertEqual(res1.status_code, status.HTTP_200_OK)

        count_after_first = CareerRoadmap.objects.filter(career_profile=self.profile1, target_job=self.job1).count()
        self.assertEqual(count_after_first, 1)

        # Second call returns existing roadmap without creating duplicate
        res2 = self.client.post("/api/v1/ai/roadmap/generate/", payload, format="json")
        self.assertEqual(res2.status_code, status.HTTP_200_OK)
        self.assertEqual(res2.data["data"]["id"], res1.data["data"]["id"])
        self.assertEqual(CareerRoadmap.objects.filter(career_profile=self.profile1, target_job=self.job1).count(), 1)

    def test_deterministic_generation_user_with_all_skills(self) -> None:
        from apps.skills.models import Skill
        Skill.objects.create(career_profile=self.profile1, name="Python", category="Backend")
        Skill.objects.create(career_profile=self.profile1, name="Django", category="Backend")

        self.job1.description = "Python and Django developer needed."
        self.job1.save()

        payload = {"job_id": str(self.job1.id)}
        response = self.client.post("/api/v1/ai/roadmap/generate/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data["data"]

        self.assertEqual(len(data["phases"]), 1)
        self.assertIn("Target Role Preparation", data["phases"][0]["title"])

    def test_deterministic_generation_user_with_no_skills(self) -> None:
        self.job1.description = "Python and Docker required."
        self.job1.save()

        payload = {"job_id": str(self.job1.id)}
        response = self.client.post("/api/v1/ai/roadmap/generate/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data["data"]

        # User has 0 skills -> missing Python and Docker -> multi-phase roadmap
        self.assertTrue(len(data["phases"]) >= 2)

    def test_deterministic_generation_job_ownership_isolation(self) -> None:
        payload = {"job_id": str(self.job2.id)}
        response = self.client.post("/api/v1/ai/roadmap/generate/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_deterministic_generation_nonexistent_job(self) -> None:
        payload = {"job_id": str(uuid.uuid4())}
        response = self.client.post("/api/v1/ai/roadmap/generate/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_deterministic_generation_dependency_ordering(self) -> None:
        # Job requires Python (Level 10), Django (Level 20), Docker (Level 40), AWS (Level 50)
        self.job1.description = "Looking for Python, Django, Docker, and AWS."
        self.job1.save()

        payload = {"job_id": str(self.job1.id)}
        response = self.client.post("/api/v1/ai/roadmap/generate/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        phases = response.data["data"]["phases"]

        # Phase 1 should cover Python (Foundation), Phase 2 Django (Framework), Phase 3 Docker (Ops), Phase 4 AWS (Cloud)
        titles = [p["title"] for p in phases]
        self.assertTrue(any("Language" in t or "Foundation" in t for t in [titles[0]]))
        self.assertTrue(any("Cloud" in t or "Preparation" in t for t in [titles[-1], titles[-2]]))

