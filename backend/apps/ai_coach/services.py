from __future__ import annotations

from typing import Any

from ai.context.builder import UserContextBuilder
from ai.orchestrator.orchestrator import AIOrchestrator

from .models import AIHistory
from .prompts import get_prompt_builder


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

    def get_job_match(self, user, job_title: str, company_name: str, job_description: str) -> dict:
        prompt = f"Evaluate job match for {job_title} at {company_name}. Job description: {job_description}"
        return self.chat(user=user, feature="job_match", prompt=prompt)

    def get_history(self, user):
        return AIHistory.objects.filter(user=user)
