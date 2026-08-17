from __future__ import annotations

from typing import Any

from apps.ai_coach.models import CareerRoadmap, PhaseStatus, RoadmapPhase, RoadmapStatus
from apps.jobs.models import SavedJob
from apps.jobs.skill_gap import extract_job_skills, perform_deterministic_skill_comparison


class CareerRoadmapGenerator:
    """Deterministic Career Roadmap Generator for CareerOS."""

    DEPENDENCY_WEIGHTS = {
        # Level 1: Languages & Fundamentals (Weight 10)
        "python": 10,
        "java": 10,
        "javascript": 10,
        "typescript": 10,
        "c++": 10,
        "go": 10,
        "rust": 10,
        "html": 10,
        "css": 10,
        "sql": 10,
        # Level 2: Core Frameworks & Databases (Weight 20)
        "django": 20,
        "flask": 20,
        "fastapi": 20,
        "spring boot": 20,
        "react": 20,
        "vue": 20,
        "angular": 20,
        "next.js": 20,
        "tailwind": 20,
        "postgresql": 20,
        "mysql": 20,
        "mongodb": 20,
        # Level 3: Architecture & In-Memory / Messaging (Weight 30)
        "redis": 30,
        "kafka": 30,
        "rest api": 30,
        "graphql": 30,
        "microservices": 30,
        "system design": 30,
        # Level 4: Containerization & Development Ops (Weight 40)
        "docker": 40,
        "ci/cd": 40,
        "unit testing": 40,
        "git": 40,
        "agile": 40,
        # Level 5: Cloud & Orchestration (Weight 50)
        "aws": 50,
        "gcp": 50,
        "azure": 50,
        "kubernetes": 50,
    }

    SKILL_ACTION_TEMPLATES: dict[str, dict[str, Any]] = {
        "docker": {
            "title": "Containerization with Docker",
            "objective": "Package applications and services into reproducible Docker containers.",
            "actions": [
                "Create an optimized Dockerfile for application services",
                "Set up Docker Compose for local multi-container development",
                "Configure volume mounts and environment variables",
                "Test containerized services locally",
            ],
            "duration": "2 weeks",
        },
        "aws": {
            "title": "Cloud Deployment with AWS",
            "objective": "Provision cloud infrastructure and deploy production applications on AWS.",
            "actions": [
                "Set up IAM policies and secure credentials",
                "Deploy compute services using EC2 or App Runner",
                "Configure S3 storage buckets for static and media assets",
                "Configure RDS database instances and security groups",
            ],
            "duration": "3 weeks",
        },
        "kubernetes": {
            "title": "Container Orchestration with Kubernetes",
            "objective": "Orchestrate, scale, and manage containerized microservices.",
            "actions": [
                "Create Kubernetes deployment and service manifests",
                "Configure ConfigMaps and Secrets for runtime configuration",
                "Set up ingress rules for cluster routing",
                "Monitor pod health and resource utilization",
            ],
            "duration": "3 weeks",
        },
        "postgresql": {
            "title": "Database Management with PostgreSQL",
            "objective": "Design, index, and query relational PostgreSQL databases.",
            "actions": [
                "Design relational schema and table indexes",
                "Write optimized SQL queries and joins",
                "Configure connection pooling and migrations",
                "Set up automated database backups",
            ],
            "duration": "2 weeks",
        },
        "redis": {
            "title": "Caching & In-Memory Storage with Redis",
            "objective": "Implement high-speed caching and session management.",
            "actions": [
                "Configure Redis client connection pool",
                "Implement caching strategy for high-latency endpoints",
                "Use Redis for session and rate limiting storage",
                "Benchmark API performance gains",
            ],
            "duration": "1 week",
        },
    }

    def generate(self, user: Any, job_id: str) -> CareerRoadmap:
        """Deterministically generates or retrieves a CareerRoadmap for a user's SavedJob."""
        # 1. Validate ownership & retrieve target job
        job = SavedJob.objects.get(career_profile__user=user, id=job_id)
        profile = job.career_profile

        # 2. Check for existing duplicate roadmap
        existing_roadmap = CareerRoadmap.objects.filter(career_profile=profile, target_job=job).first()
        if existing_roadmap:
            return existing_roadmap

        # 3. Obtain candidate's current skills
        user_skills = [s.name for s in profile.skills.all()]

        # 4. Extract required job skills deterministically
        required_skills = extract_job_skills(job.description, job.title)

        # 5. Deterministic skill comparison
        matched_skills, missing_skills = perform_deterministic_skill_comparison(user_skills, required_skills)

        # 6. Sort missing skills deterministically by dependency weight
        missing_skills_sorted = sorted(
            missing_skills,
            key=lambda s: (self.DEPENDENCY_WEIGHTS.get(s.lower(), 25), s.lower()),
        )

        # 7. Construct roadmap record
        roadmap = CareerRoadmap.objects.create(
            career_profile=profile,
            target_job=job,
            title=f"Career Roadmap for {job.title} at {job.company}",
            target_role=job.title,
            description=f"Deterministic skill gap and career progression roadmap targeting {job.title} position.",
            status=RoadmapStatus.IN_PROGRESS if missing_skills_sorted else RoadmapStatus.NOT_STARTED,
        )

        phases_to_create: list[RoadmapPhase] = []
        ordering_counter = 1

        if not missing_skills_sorted:
            # User already matches all extracted skills
            phases_to_create.append(
                RoadmapPhase(
                    roadmap=roadmap,
                    title=f"Target Role Preparation: {job.title}",
                    description=f"All key skills matched! Focus on portfolio, resume, and interview prep for {job.company}.",
                    objective=f"Finalize application materials and interview preparation for {job.title}.",
                    skills=matched_skills,
                    actions=[
                        f"Tailor resume metrics for {job.title} position at {job.company}",
                        "Review core technical concept questions",
                        "Prepare system design and architecture presentation",
                        f"Submit application to {job.company}",
                    ],
                    status=PhaseStatus.UPCOMING,
                    ordering=ordering_counter,
                    estimated_duration="1 week",
                )
            )
        else:
            # Group missing skills into logical phases based on dependency level
            grouped_phases: dict[int, list[str]] = {}
            for skill in missing_skills_sorted:
                weight = self.DEPENDENCY_WEIGHTS.get(skill.lower(), 25)
                level = (weight // 10) * 10
                grouped_phases.setdefault(level, []).append(skill)

            level_titles = {
                10: "Foundation & Core Language Skills",
                20: "Core Frameworks & Data Layer",
                30: "System Architecture & Integration",
                40: "Containerization & Development Ops",
                50: "Cloud & Production Infrastructure",
            }

            for level in sorted(grouped_phases.keys()):
                skills_in_level = grouped_phases[level]
                phase_title = level_titles.get(level, "Technical Gaps")

                actions = []
                for s in skills_in_level:
                    s_lower = s.lower()
                    if s_lower in self.SKILL_ACTION_TEMPLATES:
                        actions.extend(self.SKILL_ACTION_TEMPLATES[s_lower]["actions"])
                    else:
                        actions.extend([
                            f"Study core concepts and documentation for {s}",
                            f"Build a hands-on project component applying {s}",
                            f"Integrate {s} with target portfolio project codebase",
                        ])

                phases_to_create.append(
                    RoadmapPhase(
                        roadmap=roadmap,
                        title=f"Phase {ordering_counter}: {phase_title}",
                        description=f"Address missing technical capabilities: {', '.join(skills_in_level)}.",
                        objective=f"Develop competency in {', '.join(skills_in_level)} required for {job.title}.",
                        skills=skills_in_level,
                        actions=actions,
                        status=PhaseStatus.UPCOMING,
                        ordering=ordering_counter,
                        estimated_duration=f"{max(1, len(skills_in_level) * 2)} weeks",
                    )
                )
                ordering_counter += 1

            # Final Phase: Target Role Preparation
            phases_to_create.append(
                RoadmapPhase(
                    roadmap=roadmap,
                    title=f"Phase {ordering_counter}: Target Role Preparation",
                    description=f"Finalize portfolio and application strategy for {job.company}.",
                    objective=f"Apply acquired skills to complete target portfolio and interview prep for {job.title}.",
                    skills=matched_skills[:5],
                    actions=[
                        f"Refine resume to highlight newly acquired skills ({', '.join(missing_skills_sorted[:3])})",
                        f"Prepare portfolio project demonstrating integration of {', '.join(missing_skills_sorted[:2])}",
                        f"Conduct technical interview practice for {job.title} role",
                        f"Submit application to {job.company}",
                    ],
                    status=PhaseStatus.UPCOMING,
                    ordering=ordering_counter,
                    estimated_duration="1 week",
                )
            )

        RoadmapPhase.objects.bulk_create(phases_to_create)
        return roadmap
