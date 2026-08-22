from __future__ import annotations

from typing import Any

from django.db import transaction

from ai.context.builder import UserContextBuilder
from ai.orchestrator.orchestrator import AIOrchestrator

from ai.parsers import AISchemaValidationError, JSONResponseParser
from ai.prompts import JobMatchPromptTemplate, ResumeReviewPromptTemplate, SkillGapPromptTemplate
from apps.jobs.models import JobMatchAnalysis, SavedJob, SkillGapAnalysis
from apps.jobs.skill_gap import (
    calculate_deterministic_skill_gap,
    extract_job_skills,
    normalize_skill,
    perform_deterministic_skill_comparison,
)
from apps.resumes.models import Resume, ResumeAnalysis

from .models import AIHistory
from .prompts import get_prompt_builder
from .serializers import (
    JobMatchResultSerializer,
    ResumeReviewRawAIResponseSerializer,
    ResumeReviewResultSerializer,
    SkillGapResultSerializer,
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

    def get_career_advice(self, user, target_role: str, industry: str) -> dict:
        prompt = f"Provide strategic career growth advice for becoming a {target_role} in the {industry} industry."
        return self.chat(user=user, feature="career_chat", prompt=prompt)

    @transaction.atomic
    def get_job_match(self, user: Any, job_id: str, resume_id: str) -> dict[str, Any]:
        """Perform contextual Job Match evaluation between a target SavedJob and Resume."""
        job = SavedJob.objects.get(career_profile__user=user, id=job_id)
        resume = Resume.objects.get(career_profile__user=user, id=resume_id)

        user_context = self.context_builder.build_user_context(user)
        user_skills = user_context.get("skills", [])
        if not isinstance(user_skills, list):
            user_skills = []

        from apps.jobs.skill_gap import calculate_deterministic_job_match
        det_match = calculate_deterministic_job_match(
            user_skills=user_skills,
            job_description=job.description,
            job_title=job.title,
        )

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

        # Enforce deterministic factual authority over score, missing skills, and matched skills
        authoritative_score = det_match["baseline_score"]
        authoritative_missing = det_match["missing_skills"]
        authoritative_matched = det_match["matched_skills"]

        analysis = JobMatchAnalysis.objects.create(
            job=job,
            resume=resume,
            match_score=authoritative_score,
            strengths=validated_result["strengths"],
            missing_skills=authoritative_missing,
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
            "match_score": authoritative_score,
            "strengths": analysis.strengths,
            "missing_skills": authoritative_missing,
            "matched_skills": authoritative_matched,
            "coverage_percentage": det_match["coverage_percentage"],
            "gaps": analysis.gaps,
            "recommendations": analysis.recommendations,
            "analyzed_at": analysis.analyzed_at.isoformat(),
        }

    @transaction.atomic
    def review_resume(self, user: Any, resume_id: str, enhance_with_ai: bool = False) -> dict[str, Any]:
        """Perform contextual Resume Review evaluation for a target Resume with deterministic feedback & optional AI enhancement."""
        resume = Resume.objects.get(career_profile__user=user, id=resume_id)

        from apps.resumes.quality_signals import (
            evaluate_deterministic_resume_quality_signals,
            generate_deterministic_resume_feedback,
            merge_feedback_items,
        )
        signals = evaluate_deterministic_resume_quality_signals(user=user, resume=resume)
        deterministic_score = signals["completeness_score"]
        det_feedback = generate_deterministic_resume_feedback(user=user, resume=resume, signals=signals)

        final_strengths = det_feedback["strengths"]
        final_weaknesses = det_feedback["weaknesses"]
        final_recommendations = det_feedback["recommendations"]

        provider_name = "deterministic"
        model_name = "deterministic_rules"
        prompt_tokens = 0
        completion_tokens = 0
        total_tokens = 0

        if enhance_with_ai:
            context = self.context_builder.build_resume_review_context(user=user, resume_id=resume_id)
            prompt_template = ResumeReviewPromptTemplate()
            system_prompt, user_prompt = prompt_template.format(context)

            parser = JSONResponseParser(required_fields=["strengths", "weaknesses", "recommendations"])

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

            final_strengths = merge_feedback_items(final_strengths, validated_raw["strengths"])
            final_weaknesses = merge_feedback_items(final_weaknesses, validated_raw["weaknesses"])
            final_recommendations = merge_feedback_items(final_recommendations, validated_raw["recommendations"])

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
                    "score": deterministic_score,
                    "enhance_with_ai": True,
                },
            )

        analysis = ResumeAnalysis.objects.create(
            resume=resume,
            score=deterministic_score,
            strengths=final_strengths,
            weaknesses=final_weaknesses,
            recommendations=final_recommendations,
        )

        return {
            "id": str(analysis.id),
            "resume_id": str(resume.id),
            "score": deterministic_score,
            "strengths": analysis.strengths,
            "weaknesses": analysis.weaknesses,
            "recommendations": analysis.recommendations,
            "analyzed_at": analysis.analyzed_at.isoformat(),
        }


    def get_history(self, user):
        return AIHistory.objects.filter(user=user)

    @transaction.atomic
    def analyze_job_skill_gap(self, user: Any, job_id: str) -> dict[str, Any]:
        """Perform 100% deterministic, zero-LLM Skill Gap analysis for a target SavedJob."""
        job = SavedJob.objects.get(career_profile__user=user, id=job_id)
        career_profile = job.career_profile

        det_result = calculate_deterministic_skill_gap(career_profile=career_profile, job=job)

        analysis = SkillGapAnalysis.objects.create(
            career_profile=career_profile,
            job=job,
            matched_skills=det_result["matched_skills"],
            missing_skills=det_result["missing_skills"],
            partial_skills=det_result["partial_skills"],
            recommendations=det_result["recommendations"],
        )

        return {
            "id": str(analysis.id),
            "job_id": str(job.id),
            "matched_skills": analysis.matched_skills,
            "missing_skills": analysis.missing_skills,
            "partial_skills": analysis.partial_skills,
            "recommendations": analysis.recommendations,
            "evidence": det_result.get("evidence", {}),
            "analyzed_at": analysis.analyzed_at.isoformat(),
        }
