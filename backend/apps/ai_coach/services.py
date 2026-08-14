from __future__ import annotations

from typing import Any

from ai.context.builder import UserContextBuilder
from ai.orchestrator.orchestrator import AIOrchestrator

from ai.parsers import AISchemaValidationError, JSONResponseParser
from ai.prompts import JobMatchPromptTemplate, ResumeReviewPromptTemplate, SkillGapPromptTemplate
from apps.jobs.models import JobMatchAnalysis, SavedJob, SkillGapAnalysis
from apps.jobs.skill_gap import extract_job_skills, perform_deterministic_skill_comparison, normalize_skill
from apps.resumes.models import Resume, ResumeAnalysis

from .models import AIHistory
from .prompts import get_prompt_builder
from .serializers import (
    JobMatchResultSerializer,
    ResumeReviewRawAIResponseSerializer,
    ResumeReviewResultSerializer,
    SkillGapResultSerializer,
    calculate_resume_review_score,
)





class AICoachService:
    """Service layer for AI features delegating through centralized AIOrchestrator."""

    def __init__(
        self,
        orchestrator: AIOrchestrator | None = None,
        context_builder: UserContextBuilder | None = None,
    ) -> None:
        self.orchestrator = orchestrator or AIOrchestrator()
        self.context_builder = context_builder or UserContextBuilder()

    def chat(self, user: Any, feature: str, prompt: str) -> dict[str, Any]:
        """Generic AI chat endpoint delegating through AIOrchestrator."""
        user_context = self.context_builder.build_user_context(user)
        skills = user_context.get("skills", [])
        context = {
            "candidate_name": user_context.get("candidate_name", ""),
            "headline": user_context.get("headline", ""),
            "skills": ", ".join(skills) if isinstance(skills, list) else str(skills),
            "summary": user_context.get("summary", ""),
        }

        builder = get_prompt_builder(feature)
        system_prompt, user_prompt = builder.build(prompt, context=context)

        ai_response = self.orchestrator.generate(
            prompt=user_prompt,
            system_prompt=system_prompt,
        )

        history = AIHistory.objects.create(
            user=user,
            feature=feature,
            provider=ai_response.provider_name,
            model=ai_response.model_name,
            prompt_tokens=ai_response.prompt_tokens,
            completion_tokens=ai_response.completion_tokens,
            total_tokens=ai_response.total_tokens,
            response_data={
                "prompt": prompt,
                "response": ai_response.content,
                "feature": feature,
            },
        )

        return {
            "feature": feature,
            "model": ai_response.model_name,
            "response": ai_response.content,
            "tokens": {
                "prompt_tokens": ai_response.prompt_tokens,
                "completion_tokens": ai_response.completion_tokens,
                "total_tokens": ai_response.total_tokens,
            },
            "history_id": str(history.id),
        }

    def generate_cover_letter(self, user, company_name: str, job_title: str, job_description: str, tone: str) -> dict:
        prompt = (
            f"Draft a {tone} cover letter for position '{job_title}' at company '{company_name}'. "
            f"Key details: {job_description}"
        )
        return self.chat(user=user, feature="cover_letter", prompt=prompt)

    def analyze_skill_gap(self, user, target_role: str, required_skills: list[str]) -> dict:
        prompt = (
            f"Analyze skill gap for target role '{target_role}'. Required skills: {', '.join(required_skills)}. "
            f"Provide readiness score (0-100), missing skills list, and recommendations."
        )
        return self.chat(user=user, feature="ats_review", prompt=prompt)

    def get_career_advice(self, user, target_role: str, industry: str) -> dict:
        prompt = f"Provide strategic career growth advice for becoming a {target_role} in the {industry} industry."
        return self.chat(user=user, feature="career_chat", prompt=prompt)

    def get_job_match(self, user: Any, job_id: str, resume_id: str) -> dict[str, Any]:
        """Perform contextual Job Match evaluation between a target SavedJob and Resume."""
        context = self.context_builder.build_job_match_context(user=user, job_id=job_id, resume_id=resume_id)
        prompt_template = JobMatchPromptTemplate()
        system_prompt, user_prompt = prompt_template.format(context)

        parser = JSONResponseParser(required_fields=["match_score", "strengths", "missing_skills", "gaps", "recommendations"])

        ai_response = self.orchestrator.generate(
            prompt=user_prompt,
            system_prompt=system_prompt,
            parser=parser,
        )

        parsed_data = ai_response.raw_response.get("parsed", {})

        result_serializer = JobMatchResultSerializer(data=parsed_data)
        if not result_serializer.is_valid():
            errors_summary = "; ".join(
                [f"{field}: {', '.join(errs) if isinstance(errs, list) else str(errs)}" for field, errs in result_serializer.errors.items()]
            )
            raise AISchemaValidationError(f"AI response failed schema validation: {errors_summary}")

        validated_result = result_serializer.validated_data

        job = SavedJob.objects.get(career_profile__user=user, id=job_id)
        resume = Resume.objects.get(career_profile__user=user, id=resume_id)

        analysis = JobMatchAnalysis.objects.create(
            job=job,
            resume=resume,
            match_score=validated_result["match_score"],
            strengths=validated_result["strengths"],
            missing_skills=validated_result["missing_skills"],
            gaps=validated_result["gaps"],
            recommendations=validated_result["recommendations"],
        )

        AIHistory.objects.create(
            user=user,
            feature="job_match",
            provider=ai_response.provider_name,
            model=ai_response.model_name,
            prompt_tokens=ai_response.prompt_tokens,
            completion_tokens=ai_response.completion_tokens,
            total_tokens=ai_response.total_tokens,
            response_data={
                "job_id": str(job_id),
                "resume_id": str(resume_id),
                "analysis_id": str(analysis.id),
                "match_score": analysis.match_score,
            },
        )

        return {
            "id": str(analysis.id),
            "job_id": str(job.id),
            "resume_id": str(resume.id),
            "match_score": analysis.match_score,
            "strengths": analysis.strengths,
            "missing_skills": analysis.missing_skills,
            "gaps": analysis.gaps,
            "recommendations": analysis.recommendations,
            "analyzed_at": analysis.analyzed_at.isoformat(),
        }

    def review_resume(self, user: Any, resume_id: str) -> dict[str, Any]:
        """Perform contextual Resume Review evaluation for a target Resume."""
        context = self.context_builder.build_resume_review_context(user=user, resume_id=resume_id)
        prompt_template = ResumeReviewPromptTemplate()
        system_prompt, user_prompt = prompt_template.format(context)

        parser = JSONResponseParser(required_fields=["dimensions", "strengths", "weaknesses", "recommendations"])

        ai_response = self.orchestrator.generate(
            prompt=user_prompt,
            system_prompt=system_prompt,
            parser=parser,
        )

        parsed_data = ai_response.raw_response.get("parsed", {})

        raw_serializer = ResumeReviewRawAIResponseSerializer(data=parsed_data)
        if not raw_serializer.is_valid():
            errors_summary = "; ".join(
                [f"{field}: {', '.join(errs) if isinstance(errs, list) else str(errs)}" for field, errs in raw_serializer.errors.items()]
            )
            raise AISchemaValidationError(f"AI response failed schema validation: {errors_summary}")

        validated_raw = raw_serializer.validated_data

        # Calculate deterministic 0-100 score from 7 validated 0-10 integer dimensions
        calculated_score = calculate_resume_review_score(validated_raw["dimensions"])

        resume = Resume.objects.get(career_profile__user=user, id=resume_id)

        analysis = ResumeAnalysis.objects.create(
            resume=resume,
            score=calculated_score,
            strengths=validated_raw["strengths"],
            weaknesses=validated_raw["weaknesses"],
            recommendations=validated_raw["recommendations"],
        )

        AIHistory.objects.create(
            user=user,
            feature="resume_review",
            provider=ai_response.provider_name,
            model=ai_response.model_name,
            prompt_tokens=ai_response.prompt_tokens,
            completion_tokens=ai_response.completion_tokens,
            total_tokens=ai_response.total_tokens,
            response_data={
                "resume_id": str(resume_id),
                "analysis_id": str(analysis.id),
                "score": analysis.score,
            },
        )

        return {
            "id": str(analysis.id),
            "resume_id": str(resume.id),
            "score": analysis.score,
            "strengths": analysis.strengths,
            "weaknesses": analysis.weaknesses,
            "recommendations": analysis.recommendations,
            "analyzed_at": analysis.analyzed_at.isoformat(),
        }


    def get_history(self, user):
        return AIHistory.objects.filter(user=user)

    def analyze_job_skill_gap(self, user: Any, job_id: str) -> dict[str, Any]:
        """Perform contextual Skill Gap analysis for a target SavedJob, with deterministic skill matching."""
        job = SavedJob.objects.get(career_profile__user=user, id=job_id)

        user_context = self.context_builder.build_user_context(user)
        user_skills = user_context.get("skills", [])
        if not isinstance(user_skills, list):
            user_skills = []

        required_skills = extract_job_skills(job.description, job.title)
        pre_matched, unmatched = perform_deterministic_skill_comparison(user_skills, required_skills)

        prompt_template = SkillGapPromptTemplate()
        context = {
            "candidate_name": user_context.get("candidate_name", ""),
            "headline": user_context.get("headline", ""),
            "summary": user_context.get("summary", ""),
            "user_skills": ", ".join(user_skills),
            "experiences": "\n".join(user_context.get("experiences", [])),
            "projects": "\n".join(user_context.get("projects", [])),
            "job_title": job.title,
            "company_name": job.company,
            "job_description": job.description,
            "pre_matched_skills": ", ".join(pre_matched),
            "unmatched_skills": ", ".join(unmatched),
        }
        system_prompt, user_prompt = prompt_template.format(context)

        parser = JSONResponseParser(required_fields=["matched_skills", "missing_skills", "partial_skills"])

        ai_response = self.orchestrator.generate(
            prompt=user_prompt,
            system_prompt=system_prompt,
            parser=parser,
        )

        parsed_data = ai_response.raw_response.get("parsed", {})

        result_serializer = SkillGapResultSerializer(data=parsed_data)
        if not result_serializer.is_valid():
            errors_summary = "; ".join(
                [f"{field}: {', '.join(errs) if isinstance(errs, list) else str(errs)}" for field, errs in result_serializer.errors.items()]
            )
            raise AISchemaValidationError(f"AI response failed schema validation: {errors_summary}")

        validated_result = result_serializer.validated_data

        # Enforce deterministic matched skills rule
        final_matched = list(dict.fromkeys(pre_matched + validated_result["matched_skills"]))
        final_matched_norms = {normalize_skill(s) for s in final_matched}

        final_missing = [
            item for item in validated_result["missing_skills"]
            if normalize_skill(item["skill"]) not in final_matched_norms
        ]
        final_missing_norms = {normalize_skill(item["skill"]) for item in final_missing}

        final_partial = [
            item for item in validated_result["partial_skills"]
            if normalize_skill(item["skill"]) not in final_matched_norms
            and normalize_skill(item["skill"]) not in final_missing_norms
        ]

        recommendations = [
            item["recommendation"]
            for item in final_missing + final_partial
            if item.get("recommendation")
        ]

        analysis = SkillGapAnalysis.objects.create(
            career_profile=job.career_profile,
            job=job,
            matched_skills=final_matched,
            missing_skills=final_missing,
            partial_skills=final_partial,
            recommendations=recommendations,
        )

        AIHistory.objects.create(
            user=user,
            feature="skill_gap",
            provider=ai_response.provider_name,
            model=ai_response.model_name,
            prompt_tokens=ai_response.prompt_tokens,
            completion_tokens=ai_response.completion_tokens,
            total_tokens=ai_response.total_tokens,
            response_data={
                "job_id": str(job_id),
                "analysis_id": str(analysis.id),
            },
        )

        return {
            "id": str(analysis.id),
            "job_id": str(job.id),
            "matched_skills": analysis.matched_skills,
            "missing_skills": analysis.missing_skills,
            "partial_skills": analysis.partial_skills,
            "recommendations": analysis.recommendations,
            "analyzed_at": analysis.analyzed_at.isoformat(),
        }
