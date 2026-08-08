from __future__ import annotations

from typing import Any

from apps.career_profile.models import CareerProfile

from .client import OllamaClient
from .models import AIHistory
from .prompts import get_prompt_builder


class AICoachService:
    """Service layer for AI features, coordinating prompt builders, Ollama client, and history logging."""

    def __init__(self, ollama_client: OllamaClient | None = None) -> None:
        self.ollama_client = ollama_client or OllamaClient()

    def chat(self, user: Any, feature: str, prompt: str) -> dict[str, Any]:
        """Generic AI chat endpoint powered by local Ollama."""
        profile, _ = CareerProfile.objects.get_or_create(user=user)
        user_name = f"{profile.first_name} {profile.last_name}".strip()
        user_skills = list(profile.skills.values_list("name", flat=True))

        context = {
            "candidate_name": user_name or user.email,
            "headline": profile.headline or "",
            "skills": ", ".join(user_skills) if user_skills else "",
            "summary": profile.summary or "",
        }

        builder = get_prompt_builder(feature)
        system_prompt, user_prompt = builder.build(prompt, context=context)

        result = self.ollama_client.generate(prompt=user_prompt, system=system_prompt)

        response_text = result["response"]
        model_used = result["model"]
        prompt_tokens = result["prompt_tokens"]
        completion_tokens = result["completion_tokens"]
        total_tokens = result["total_tokens"]

        history = AIHistory.objects.create(
            user=user,
            feature=feature,
            provider="ollama",
            model=model_used,
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            total_tokens=total_tokens,
            response_data={
                "prompt": prompt,
                "response": response_text,
                "feature": feature,
            },
        )

        return {
            "feature": feature,
            "model": model_used,
            "response": response_text,
            "tokens": {
                "prompt_tokens": prompt_tokens,
                "completion_tokens": completion_tokens,
                "total_tokens": total_tokens,
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
