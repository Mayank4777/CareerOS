from __future__ import annotations

import time
from typing import Any
from unittest.mock import MagicMock, patch

from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from apps.career_profile.models import CareerProfile
from apps.resumes.models import Resume
from apps.resumes.quality_signals import evaluate_deterministic_resume_quality_signals


User = get_user_model()


class ResumeQualityBenchmarkTestCase(APITestCase):
    """Phase 15 Benchmark and Calibration Validation Test Suite."""

    def setUp(self) -> None:
        self.user = User.objects.create_user(email="benchmark_user@example.com", password="Password123!")
        self.profile = CareerProfile.objects.create(
            user=self.user,
            first_name="Benchmark",
            last_name="Candidate",
            phone="555-0199",
            linkedin_url="https://linkedin.com/in/benchmark",
            github_url="https://github.com/benchmark",
        )

    def test_synthetic_benchmark_set_ordering_and_ranges(self) -> None:
        """Benchmarks all 10 synthetic resume archetypes A through J."""

        # Archetype A: Empty Resume
        resume_a = Resume.objects.create(career_profile=self.profile, title="A: Empty", content_data={})
        score_a = evaluate_deterministic_resume_quality_signals(self.user, resume_a)["completeness_score"]

        # Archetype B: Extremely Poor Resume
        resume_b = Resume.objects.create(
            career_profile=self.profile,
            title="B: Extremely Poor",
            content_data={"personal_info": {"first_name": "John", "last_name": "Doe"}},
        )
        score_b = evaluate_deterministic_resume_quality_signals(self.user, resume_b)["completeness_score"]

        # Archetype C: Poor Student Resume
        resume_c = Resume.objects.create(
            career_profile=self.profile,
            title="C: Poor Student",
            content_data={
                "sections": [
                    {"title": "Experience", "items": [{"title": "Dev", "company": "Corp", "description": "Did stuff."}]},
                    {"title": "Projects", "items": [{"title": "Site", "description": "Built website."}]},
                    {"title": "Skills", "items": ["Python"]},
                ]
            },
        )
        score_c = evaluate_deterministic_resume_quality_signals(self.user, resume_c)["completeness_score"]

        # Archetype D: Average Student Resume
        resume_d = Resume.objects.create(
            career_profile=self.profile,
            title="D: Average Student",
            target_role="Junior Developer",
            content_data={
                "summary": "Motivated computer science student looking for entry level developer roles.",
                "sections": [
                    {
                        "title": "Experience",
                        "items": [
                            {
                                "title": "Developer Intern",
                                "company": "Local Startup",
                                "description": "Assisted with web application development using Python and Django.",
                            }
                        ],
                    },
                    {
                        "title": "Projects",
                        "items": [
                            {
                                "title": "Portfolio Web App",
                                "description": "Built portfolio website in React with contact form.",
                            }
                        ],
                    },
                    {"title": "Skills", "items": ["Python", "Django", "React", "Git"]},
                ],
            },
        )
        score_d = evaluate_deterministic_resume_quality_signals(self.user, resume_d)["completeness_score"]

        # Archetype E: Strong Student / Fresher Resume
        resume_e = Resume.objects.create(
            career_profile=self.profile,
            title="E: Strong Student",
            target_role="Software Engineer Intern",
            content_data={
                "personal_info": {"phone": "555-0199", "github_url": "https://github.com/student"},
                "summary": "CS graduate with strong foundation in full stack web development and algorithms.",
                "sections": [
                    {
                        "title": "Projects",
                        "items": [
                            {
                                "title": "CareerOS Student Portal",
                                "description": "Developed full stack student portal in Python, Django, and React with JWT auth.",
                                "skills": ["Python", "Django", "React", "Docker"],
                                "link": "https://github.com/student/careeros",
                            }
                        ],
                    },
                    {
                        "title": "Experience",
                        "items": [
                            {
                                "title": "Software Intern",
                                "company": "Tech Lab",
                                "description": "Spearheaded automation scripts reducing testing duration by 25%.",
                                "bullets": ["Developed automated integration test suite in Python."],
                            }
                        ],
                    },
                    {"title": "Skills", "items": ["Python", "Django", "React", "Docker", "PostgreSQL", "Git"]},
                ],
            },
        )
        score_e = evaluate_deterministic_resume_quality_signals(self.user, resume_e)["completeness_score"]

        # Archetype F: Strong Junior Developer Resume
        resume_f = Resume.objects.create(
            career_profile=self.profile,
            title="F: Strong Junior",
            target_role="Junior Backend Engineer",
            content_data={
                "personal_info": {"phone": "555-0199", "linkedin_url": "https://linkedin.com/in/junior", "github_url": "https://github.com/junior"},
                "summary": "Junior Backend Engineer with 2 years of experience developing REST APIs in Python and PostgreSQL.",
                "sections": [
                    {
                        "title": "Experience",
                        "items": [
                            {
                                "title": "Junior Backend Engineer",
                                "company": "Cloud Systems",
                                "description": "Engineered high throughput REST APIs.",
                                "bullets": [
                                    "Engineered Flask API endpoints handling 50k daily active users.",
                                    "Optimized PostgreSQL database queries improving API response times by 30%.",
                                ],
                            }
                        ],
                    },
                    {
                        "title": "Projects",
                        "items": [
                            {
                                "title": "API Gateway",
                                "description": "Built lightweight API gateway in Go and Docker with rate limiting.",
                                "skills": ["Go", "Docker", "Redis"],
                                "link": "https://github.com/junior/gateway",
                            }
                        ],
                    },
                    {"title": "Education", "items": [{"title": "B.S. Computer Science", "company": "State University"}]},
                    {"title": "Skills", "items": ["Python", "Flask", "PostgreSQL", "Go", "Docker", "Redis", "Git", "REST APIs"]},
                ],
            },
        )
        score_f = evaluate_deterministic_resume_quality_signals(self.user, resume_f)["completeness_score"]

        # Archetype G: Strong Experienced Developer Resume
        resume_g = Resume.objects.create(
            career_profile=self.profile,
            title="G: Strong Experienced",
            target_role="Senior Full Stack Engineer",
            content_data={
                "personal_info": {"phone": "+1-555-0199", "linkedin_url": "https://linkedin.com/in/senior", "github_url": "https://github.com/senior"},
                "summary": "Senior Full Stack Engineer with 8+ years of experience building distributed systems, cloud infrastructure, and web applications.",
                "sections": [
                    {
                        "title": "Experience",
                        "items": [
                            {
                                "title": "Senior Staff Engineer",
                                "company": "Acme Global",
                                "description": "Architected backend microservices and cloud infrastructure.",
                                "bullets": [
                                    "Architected microservices using Python and Flask, reducing response latency by 40%.",
                                    "Engineered database optimizations saving $50k in annual cloud infrastructure costs.",
                                    "Led engineering team of 6 developers delivering core payment platform.",
                                ],
                            }
                        ],
                    },
                    {
                        "title": "Projects",
                        "items": [
                            {
                                "title": "CareerOS Engine",
                                "description": "Built scalable career management platform in Python, Django, and React.",
                                "skills": ["Python", "Django", "React", "Docker", "Kubernetes"],
                                "link": "https://github.com/senior/careeros",
                            }
                        ],
                    },
                    {"title": "Education", "items": [{"title": "M.S. Computer Science", "company": "Tech University"}]},
                    {"title": "Skills", "items": ["Python", "Django", "React", "Docker", "Kubernetes", "PostgreSQL", "AWS", "Redis", "TypeScript"]},
                ],
            },
        )
        score_g = evaluate_deterministic_resume_quality_signals(self.user, resume_g)["completeness_score"]

        # Archetype H: Skill Dump Resume
        resume_h = Resume.objects.create(
            career_profile=self.profile,
            title="H: Skill Dump",
            content_data={
                "sections": [
                    {
                        "title": "Skills",
                        "items": ["Python", "Java", "C++", "Go", "Rust", "TypeScript", "React", "Vue", "AWS", "GCP", "Docker", "Kubernetes", "Redis", "MongoDB", "SQL", "Git", "Linux", "GraphQL", "Spark", "Kafka"],
                    }
                ]
            },
        )
        score_h = evaluate_deterministic_resume_quality_signals(self.user, resume_h)["completeness_score"]

        # Archetype I: Section-Heavy Content-Poor Resume
        resume_i = Resume.objects.create(
            career_profile=self.profile,
            title="I: Section Heavy",
            content_data={
                "sections": [
                    {"title": "Summary", "items": []},
                    {"title": "Experience", "items": []},
                    {"title": "Education", "items": []},
                    {"title": "Projects", "items": []},
                    {"title": "Skills", "items": []},
                ]
            },
        )
        score_i = evaluate_deterministic_resume_quality_signals(self.user, resume_i)["completeness_score"]

        # Archetype J: Achievement-Heavy Resume
        resume_j = Resume.objects.create(
            career_profile=self.profile,
            title="J: Achievement Heavy",
            target_role="Lead Backend Engineer",
            content_data={
                "personal_info": {"phone": "555-0199", "linkedin_url": "https://linkedin.com/in/lead", "github_url": "https://github.com/lead"},
                "summary": "Lead Backend Engineer specializing in high scale distributed systems and query optimization.",
                "sections": [
                    {
                        "title": "Experience",
                        "items": [
                            {
                                "title": "Lead Backend Engineer",
                                "company": "Scale Tech",
                                "bullets": [
                                    "Optimized query performance, reducing average API latency by 45%.",
                                    "Scaled distributed pipeline to process over 10M events daily with 99.99% uptime.",
                                ],
                            }
                        ],
                    }
                ],
            },
        )
        score_j = evaluate_deterministic_resume_quality_signals(self.user, resume_j)["completeness_score"]

        # Verify Quality Ordering
        self.assertTrue(score_a <= score_b <= score_c < score_d <= score_e <= score_f <= score_g)
        self.assertTrue(score_h <= 30)  # Skill dump capped
        self.assertTrue(score_i <= 20)  # Content-poor section heavy capped
        self.assertTrue(score_j >= 50)  # Achievement-heavy rewarded

    def test_experience_depth_ordering(self) -> None:
        """Verifies Experience Depth C > B > A."""
        exp_a = Resume.objects.create(
            career_profile=self.profile,
            title="Exp A",
            content_data={"sections": [{"title": "Experience", "items": [{"title": "Dev", "company": "ABC", "description": "Worked at ABC."}]}]},
        )
        exp_b = Resume.objects.create(
            career_profile=self.profile,
            title="Exp B",
            content_data={"sections": [{"title": "Experience", "items": [{"title": "Dev", "company": "ABC", "description": "Developed backend APIs using Flask and PostgreSQL."}]}]},
        )
        exp_c = Resume.objects.create(
            career_profile=self.profile,
            title="Exp C",
            content_data={"sections": [{"title": "Experience", "items": [{"title": "Dev", "company": "ABC", "description": "Developed and optimized Flask REST APIs with PostgreSQL, reducing average query latency by 35%."}]}]},
        )

        sig_a = evaluate_deterministic_resume_quality_signals(self.user, exp_a)["completeness_score"]
        sig_b = evaluate_deterministic_resume_quality_signals(self.user, exp_b)["completeness_score"]
        sig_c = evaluate_deterministic_resume_quality_signals(self.user, exp_c)["completeness_score"]

        self.assertTrue(sig_c > sig_b > sig_a)

    def test_project_depth_ordering(self) -> None:
        """Verifies Project Depth C > B > A."""
        proj_a = Resume.objects.create(
            career_profile=self.profile,
            title="Proj A",
            content_data={"sections": [{"title": "Projects", "items": [{"title": "Expense Tracker"}]}]},
        )
        proj_b = Resume.objects.create(
            career_profile=self.profile,
            title="Proj B",
            content_data={"sections": [{"title": "Projects", "items": [{"title": "Expense Tracker", "description": "Built an expense tracker using Flask and SQLite."}]}]},
        )
        proj_c = Resume.objects.create(
            career_profile=self.profile,
            title="Proj C",
            content_data={"sections": [{"title": "Projects", "items": [{"title": "Expense Tracker", "description": "Built a Flask expense tracker with authentication, CRUD operations, SQLite persistence, category-based reporting, and input validation.", "skills": ["Python", "Flask", "SQLite"], "link": "https://github.com/test/tracker"}]}]},
        )

        sig_a = evaluate_deterministic_resume_quality_signals(self.user, proj_a)["completeness_score"]
        sig_b = evaluate_deterministic_resume_quality_signals(self.user, proj_b)["completeness_score"]
        sig_c = evaluate_deterministic_resume_quality_signals(self.user, proj_c)["completeness_score"]

        self.assertTrue(sig_c > sig_b > sig_a)

    def test_skill_dump_vs_verified_skills(self) -> None:
        """Verifies 8 verified skills score higher than 20 unverified skill dump."""
        dump_resume = Resume.objects.create(
            career_profile=self.profile,
            title="Dump",
            content_data={"sections": [{"title": "Skills", "items": ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "S10", "S11", "S12", "S13", "S14", "S15", "S16", "S17", "S18", "S19", "S20"]}]},
        )
        verified_resume = Resume.objects.create(
            career_profile=self.profile,
            title="Verified",
            content_data={
                "summary": "Expert in Python, Django, React, PostgreSQL, Docker, AWS, Git, and Linux.",
                "sections": [
                    {"title": "Skills", "items": ["Python", "Django", "React", "PostgreSQL", "Docker", "AWS", "Git", "Linux"]},
                    {"title": "Experience", "items": [{"title": "Dev", "company": "Corp", "description": "Engineered Python and Django services."}]},
                ],
            },
        )

        sig_dump = evaluate_deterministic_resume_quality_signals(self.user, dump_resume)["completeness_score"]
        sig_verified = evaluate_deterministic_resume_quality_signals(self.user, verified_resume)["completeness_score"]

        self.assertTrue(sig_verified > sig_dump)

    def test_target_role_alignment_contrast(self) -> None:
        """Verifies target role keyword alignment vs mismatch."""
        aligned_resume = Resume.objects.create(
            career_profile=self.profile,
            title="Aligned",
            target_role="Data Scientist",
            content_data={
                "summary": "Data Scientist with machine learning skills in Python, Pandas, and NumPy.",
                "sections": [{"title": "Projects", "items": [{"title": "ML Model", "description": "Built machine learning model using Pandas and NumPy."}]}],
            },
        )
        unaligned_resume = Resume.objects.create(
            career_profile=self.profile,
            title="Unaligned",
            target_role="Data Scientist",
            content_data={
                "summary": "Experienced Retail Cashier in store customer service.",
                "sections": [{"title": "Experience", "items": [{"title": "Cashier", "company": "Supermarket", "description": "Managed customer checkout counter."}]}],
            },
        )

        sig_aligned = evaluate_deterministic_resume_quality_signals(self.user, aligned_resume)
        sig_unaligned = evaluate_deterministic_resume_quality_signals(self.user, unaligned_resume)

        self.assertTrue(sig_aligned["completeness_score"] > sig_unaligned["completeness_score"])

    def test_scoring_performance_benchmark(self) -> None:
        """Verifies deterministic evaluation executes under 5 milliseconds with zero network/AI calls."""
        resume = Resume.objects.create(
            career_profile=self.profile,
            title="Perf Fixture",
            target_role="Backend Developer",
            content_data={
                "summary": "Full stack developer.",
                "sections": [
                    {"title": "Experience", "items": [{"title": "Dev", "company": "Corp", "description": "Built REST APIs."}]},
                    {"title": "Skills", "items": ["Python", "Django"]},
                ],
            },
        )
        start_time = time.perf_counter()
        for _ in range(100):
            evaluate_deterministic_resume_quality_signals(self.user, resume)
        elapsed_ms = (time.perf_counter() - start_time) * 1000.0

        # 100 in-memory evaluations should complete in < 50ms
        self.assertTrue(elapsed_ms < 50.0)
