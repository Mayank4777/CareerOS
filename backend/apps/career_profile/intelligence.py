from __future__ import annotations

from typing import Any

from apps.applications.models import Application
from apps.career_profile.models import CareerProfile, Education
from apps.experience.models import Experience
from apps.interviews.models import Interview
from apps.projects.models import Project
from apps.resumes.models import Resume
from apps.skills.models import Skill


class DashboardIntelligenceEngine:
    def __init__(self, career_profile: CareerProfile) -> None:
        self.profile = career_profile

    def compute(self) -> dict[str, Any]:
        p = self.profile

        # Calculate profile field completion
        linkedin_val = getattr(p, "linkedin_url", getattr(p, "linkedin", ""))
        github_val = getattr(p, "github_url", getattr(p, "github", ""))
        fields = [p.first_name, p.last_name, p.headline, p.phone, p.location, p.website, linkedin_val, github_val, p.summary]
        filled_fields = sum(1 for f in fields if f and str(f).strip())
        field_score = int((filled_fields / len(fields)) * 100)

        exp_count = Experience.objects.filter(career_profile=p).count()
        edu_count = Education.objects.filter(career_profile=p).count()
        skill_count = Skill.objects.filter(career_profile=p).count()
        proj_count = Project.objects.filter(career_profile=p).count()

        sections_score = 0
        if exp_count > 0:
            sections_score += 25
        if edu_count > 0:
            sections_score += 25
        if skill_count > 0:
            sections_score += 25
        if proj_count > 0:
            sections_score += 25

        overall_completion = int((field_score * 0.4) + (sections_score * 0.6))

        # Missing items with navigation paths
        missing_items = []
        if not p.phone or not p.location or not p.summary:
            missing_items.append({
                "title": "Complete Personal Information",
                "section": "personal-information",
                "description": "Fill in your phone, location, and professional summary.",
                "path": "/career-profile/personal-information",
                "severity": "medium",
            })
        if exp_count == 0:
            missing_items.append({
                "title": "Add Work Experience",
                "section": "experience",
                "description": "Add your recent work history or internship experience.",
                "path": "/career-profile/experience",
                "severity": "high",
            })
        if skill_count < 3:
            missing_items.append({
                "title": "Add Key Skills",
                "section": "skills",
                "description": "Add at least 5 technical and soft skills for ATS matching.",
                "path": "/career-profile/skills",
                "severity": "high",
            })
        if proj_count == 0:
            missing_items.append({
                "title": "Add Key Projects",
                "section": "projects",
                "description": "Highlight top projects or portfolio items.",
                "path": "/career-profile/projects",
                "severity": "medium",
            })

        # Resumes & ATS readiness
        user_resumes = Resume.objects.filter(career_profile=p)
        resume_count = user_resumes.count()
        ats_readiness = 85 if resume_count > 0 else 0

        # Applications & Interviews
        active_apps = Application.objects.filter(career_profile=p).count()
        upcoming_interviews = Interview.objects.filter(application__career_profile=p).count()

        # Recommended Next Actions
        recommended_actions = []
        if overall_completion < 80:
            recommended_actions.append({
                "id": "act-1",
                "title": "Boost Profile Completeness",
                "description": f"Your career profile is {overall_completion}% complete. Complete missing sections to improve AI resume generation.",
                "actionLabel": "Update Career Profile",
                "actionPath": "/career-profile",
                "badge": "High Priority",
            })
        
        recommended_actions.append({
            "id": "act-2",
            "title": "Generate AI Tailored Resume",
            "description": "Create a new resume tailored specifically to your target role and job description.",
            "actionLabel": "Create Resume",
            "actionPath": "/resumes",
            "badge": "Recommended",
        })

        if resume_count > 0:
            recommended_actions.append({
                "id": "act-3",
                "title": "Run AI ATS Review",
                "description": "Audit your active resume for missing keywords, weak verbs, and ATS compatibility.",
                "actionLabel": "Review Resume",
                "actionPath": "/resumes/review",
                "badge": "AI Audit",
            })

        return {
            "careerScore": max(50, overall_completion),
            "profileCompleteness": overall_completion,
            "resumesCount": resume_count,
            "atsReadiness": ats_readiness,
            "activeApplications": active_apps,
            "upcomingInterviews": upcoming_interviews,
            "missingItems": missing_items,
            "recommendedActions": recommended_actions,
            "recentActivity": [
                {
                    "id": "act-1",
                    "title": "Career Profile Synced",
                    "timestamp": "Just now",
                    "description": "Profile data ready for automatic resume composition.",
                }
            ],
        }
