from __future__ import annotations

from typing import Any

from django.db import transaction
from rest_framework.exceptions import NotFound

from apps.career_profile.selectors import get_profile_by_user

from .generation import ResumeGenerationEngine
from .models import Resume, ResumeAnalysis, ResumeVersion
from .review import ResumeReviewEngine
from .selectors import get_resume, list_resumes


class ResumeService:
    def create_resume(self, *, user, data: dict[str, Any]) -> Resume:
        profile = get_profile_by_user(user)
        if profile is None:
            raise NotFound("Career profile not found.")

        with transaction.atomic():
            return Resume.objects.create(career_profile=profile, **data)

    def generate_resume(self, *, user, data: dict[str, Any]) -> Resume:
        profile = get_profile_by_user(user)
        if profile is None:
            raise NotFound("Career profile not found.")

        title = data.get("title", "New Resume").strip()
        target_role = data.get("target_role", "").strip()
        job_description = data.get("job_description", "").strip()
        template = data.get("template", "modern").strip()

        engine = ResumeGenerationEngine(
            career_profile=profile,
            target_role=target_role,
            job_description=job_description,
        )
        content_data = engine.generate()

        with transaction.atomic():
            resume = Resume.objects.create(
                career_profile=profile,
                title=title,
                target_role=target_role,
                job_description=job_description,
                template=template,
                content_data=content_data,
            )
            # Create initial version baseline
            ResumeVersion.objects.create(
                resume=resume,
                version_number="v1.0",
                title="Baseline Resume",
                commit_message="Automatically generated from Career Profile.",
                tags=["Baseline"],
                snapshot_data=content_data,
            )
            return resume

    def list_resumes(self, *, user):
        return list_resumes(user=user)

    def retrieve_resume(self, *, user, resume_id) -> Resume:
        resume = get_resume(user=user, resume_id=resume_id)
        if resume is None:
            raise NotFound("Resume not found.")
        return resume

    def update_resume(self, *, user, resume_id, data: dict[str, Any]) -> Resume:
        resume = get_resume(user=user, resume_id=resume_id)
        if resume is None:
            raise NotFound("Resume not found.")

        for field, value in data.items():
            setattr(resume, field, value)

        with transaction.atomic():
            resume.save(update_fields=[*data.keys(), "updated_at"])

        return resume

    def delete_resume(self, *, user, resume_id) -> None:
        resume = get_resume(user=user, resume_id=resume_id)
        if resume is None:
            raise NotFound("Resume not found.")

        with transaction.atomic():
            resume.delete()

    def review_resume(self, *, user, resume_id) -> dict[str, Any]:
        resume = self.retrieve_resume(user=user, resume_id=resume_id)
        engine = ResumeReviewEngine(resume=resume)
        report = engine.analyze()
        ResumeAnalysis.objects.create(
            resume=resume,
            score=report.get("overallScore", 0),
            strengths=report.get("strengths", []),
            weaknesses=report.get("improvements", []),
            recommendations=report.get("atsSuggestions", []),
        )
        return report

    def apply_suggestion(self, *, user, resume_id, suggestion_data: dict[str, Any]) -> Resume:
        resume = self.retrieve_resume(user=user, resume_id=resume_id)
        content = resume.content_data or {}
        orig = suggestion_data.get("original_text", "")
        sug = suggestion_data.get("suggested_text", "")

        # Replace text in summary or bullets
        if "summary" in content and orig in content["summary"]:
            content["summary"] = content["summary"].replace(orig, sug)
        else:
            for sec in content.get("sections", []):
                for item in sec.get("items", []):
                    if isinstance(item, dict) and "bullets" in item:
                        item["bullets"] = [
                            sug if b == orig else b for b in item["bullets"]
                        ]
                    if isinstance(item, dict) and "description" in item and orig in item["description"]:
                        item["description"] = item["description"].replace(orig, sug)

        resume.content_data = content
        resume.save(update_fields=["content_data", "updated_at"])
        return resume

    def list_versions(self, *, user, resume_id):
        resume = self.retrieve_resume(user=user, resume_id=resume_id)
        return resume.versions.all()

    def create_version(self, *, user, resume_id, data: dict[str, Any]) -> ResumeVersion:
        resume = self.retrieve_resume(user=user, resume_id=resume_id)
        current_count = resume.versions.count()
        ver_num = f"v1.{current_count}"

        with transaction.atomic():
            return ResumeVersion.objects.create(
                resume=resume,
                version_number=ver_num,
                title=data.get("title", f"Version {ver_num}"),
                commit_message=data.get("commit_message", ""),
                tags=data.get("tags", ["Snapshot"]),
                snapshot_data=resume.content_data,
            )

    def restore_version(self, *, user, resume_id, version_id) -> Resume:
        resume = self.retrieve_resume(user=user, resume_id=resume_id)
        try:
            ver = resume.versions.get(id=version_id)
        except ResumeVersion.DoesNotExist as exc:
            raise NotFound("Resume version not found.") from exc

        with transaction.atomic():
            resume.content_data = ver.snapshot_data
            resume.save(update_fields=["content_data", "updated_at"])
        return resume


