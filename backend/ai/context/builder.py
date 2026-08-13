from __future__ import annotations

from typing import Any
from django.core.exceptions import ObjectDoesNotExist

from apps.career_profile.models import CareerProfile
from apps.resumes.models import Resume
from apps.jobs.models import SavedJob
from apps.applications.models import Application
from apps.interviews.models import Interview


class UserContextBuilder:
    """Service for building targeted, entity-aware career context isolated to the authenticated user."""

    def build_user_context(self, user: Any) -> dict[str, Any]:
        """Assemble core professional profile context for authenticated user."""
        try:
            profile = CareerProfile.objects.get(user=user)
        except CareerProfile.DoesNotExist:
            return {
                "candidate_name": user.email if hasattr(user, "email") else str(user),
                "headline": "",
                "summary": "",
                "skills": [],
                "experiences": [],
                "educations": [],
                "projects": [],
                "certifications": [],
            }

        skills = list(profile.skills.values_list("name", flat=True))
        experiences = [
            f"{e.designation} at {e.company} ({e.start_date} - {e.end_date or 'Present'})"
            for e in profile.experiences.all()
        ]
        educations = [
            f"{ed.degree} in {ed.field_of_study} at {ed.institution}"
            for ed in profile.educations.all()
        ]
        projects = [
            f"{p.title}: {p.description}"
            for p in profile.projects.all()
        ]
        certifications = [
            f"{c.title} by {c.issuer}"
            for c in profile.certifications.all()
        ]

        full_name = f"{profile.first_name} {profile.last_name}".strip()

        return {
            "candidate_name": full_name or user.email if hasattr(user, "email") else str(user),
            "headline": profile.headline or "",
            "summary": profile.summary or "",
            "skills": skills,
            "experiences": experiences,
            "educations": educations,
            "projects": projects,
            "certifications": certifications,
        }

    def build_resume_context(self, user: Any, resume_id: str) -> dict[str, Any]:
        """Fetch targeted resume context ensuring user ownership."""
        try:
            resume = Resume.objects.get(career_profile__user=user, id=resume_id)
        except (Resume.DoesNotExist, ObjectDoesNotExist, ValueError) as exc:
            raise ValueError(f"Resume with id '{resume_id}' not found for user.") from exc

        return {
            "id": str(resume.id),
            "title": resume.title,
            "target_role": resume.target_role,
            "job_description": resume.job_description,
            "template": resume.template,
            "status": resume.status,
            "content_data": resume.content_data,
        }

    def build_job_context(self, user: Any, job_id: str) -> dict[str, Any]:
        """Fetch targeted saved job context ensuring user ownership."""
        try:
            job = SavedJob.objects.get(career_profile__user=user, id=job_id)
        except (SavedJob.DoesNotExist, ObjectDoesNotExist, ValueError) as exc:
            raise ValueError(f"Saved job with id '{job_id}' not found for user.") from exc

        return {
            "id": str(job.id),
            "title": job.title,
            "company": job.company,
            "location": job.location,
            "salary_range": job.salary_range,
            "description": job.description,
        }

    def build_application_context(self, user: Any, application_id: str) -> dict[str, Any]:
        """Fetch targeted application context ensuring user ownership."""
        try:
            app = Application.objects.select_related("resume", "job").get(career_profile__user=user, id=application_id)
        except (Application.DoesNotExist, ObjectDoesNotExist, ValueError) as exc:
            raise ValueError(f"Application with id '{application_id}' not found for user.") from exc

        return {
            "id": str(app.id),
            "company": app.company,
            "position": app.position,
            "status": app.status,
            "applied_at": str(app.applied_at) if app.applied_at else None,
            "job_id": str(app.job_id) if app.job_id else None,
            "resume_id": str(app.resume_id) if app.resume_id else None,
            "notes": app.notes,
        }

    def build_interview_context(self, user: Any, interview_id: str) -> dict[str, Any]:
        """Fetch targeted interview context ensuring user ownership."""
        try:
            interview = Interview.objects.select_related("application").get(application__career_profile__user=user, id=interview_id)
        except (Interview.DoesNotExist, ObjectDoesNotExist, ValueError) as exc:
            raise ValueError(f"Interview with id '{interview_id}' not found for user.") from exc

        return {
            "id": str(interview.id),
            "company": interview.application.company,
            "position": interview.application.position,
            "round": interview.round,
            "interview_type": interview.interview_type,
            "scheduled_at": interview.scheduled_at.isoformat() if interview.scheduled_at else None,
            "status": interview.status,
            "interviewer_name": interview.interviewer_name,
            "notes": interview.notes,
            "prep_notes": interview.prep_notes,
            "ai_prep_data": interview.ai_prep_data,
        }
