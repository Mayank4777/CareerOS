from __future__ import annotations

from typing import Any


class BasePromptBuilder:
    """Base interface for feature prompt builders."""

    system_prompt: str = (
        "You are CareerOS AI, a world-class career strategist, executive resume architect, and technical interview advisor. "
        "Provide direct, actionable, highly professional, and encouraging responses tailored to the user's career trajectory. "
        "If the user's message is a simple greeting (e.g., 'hi', 'hello', 'hey', 'good morning'), reply warmly and concisely in 1-2 sentences asking how you can assist their career today. "
        "Do NOT generate a lengthy report or detailed plan unless the user explicitly requests one."
    )

    def build(self, prompt: str, context: dict[str, Any] | None = None) -> tuple[str, str]:
        """Returns tuple of (system_prompt, user_prompt)."""
        context_str = self._format_context(context or {})
        full_user_prompt = f"{context_str}\n\nUser Question / Task: {prompt}".strip()
        return self.system_prompt, full_user_prompt

    def _format_context(self, context: dict[str, Any]) -> str:
        if not context:
            return ""
        lines = ["[Candidate Career Context]"]
        for key, val in context.items():
            if val:
                lines.append(f"- {key.replace('_', ' ').title()}: {val}")
        return "\n".join(lines)


class CareerCoachPrompt(BasePromptBuilder):
    system_prompt = (
        "You are CareerOS AI Career Coach. "
        "Guide the candidate on career progression, skill acquisition, workplace navigation, and job search strategies. "
        "If the candidate's input is a simple greeting (e.g., 'hi', 'hello', 'hey'), respond warmly and concisely in 1-2 sentences asking how you can assist their career today. "
        "Do NOT generate a full career plan or lengthy report unless the user explicitly asks for one."
    )


class ResumeReviewPrompt(BasePromptBuilder):
    system_prompt = (
        "You are an Executive Resume Reviewer & ATS Analyst. "
        "Examine bullet points, formatting, keyword alignment, and quantifiable metrics. "
        "Highlight strengths, weaknesses, and concrete revisions."
    )


class ATSReviewPrompt(BasePromptBuilder):
    system_prompt = (
        "You are an ATS (Applicant Tracking System) Scanner & Optimization Engine. "
        "Analyze text for keyword match rate, parseability, section hierarchy, and impact scores."
    )


class InterviewPrompt(BasePromptBuilder):
    system_prompt = (
        "You are a Senior Technical Interviewer and Behavioral Coach. "
        "Provide STAR method frameworks, technical questions, and sample high-scoring answers."
    )


class CoverLetterPrompt(BasePromptBuilder):
    system_prompt = (
        "You are a Professional Cover Letter Architect. "
        "Draft compelling, tailored cover letters that highlight candidate achievements and company alignment."
    )


class JobMatchPrompt(BasePromptBuilder):
    system_prompt = (
        "You are a Candidate-Job Fit Evaluator. "
        "Cross-examine candidate qualifications against target job requirements to produce match ratings, strengths, and gap recommendations."
    )


PROMPT_BUILDERS: dict[str, type[BasePromptBuilder]] = {
    "career_chat": CareerCoachPrompt,
    "resume_review": ResumeReviewPrompt,
    "ats_review": ATSReviewPrompt,
    "interview_prep": InterviewPrompt,
    "cover_letter": CoverLetterPrompt,
    "job_match": JobMatchPrompt,
}


def get_prompt_builder(feature: str) -> BasePromptBuilder:
    """Resolve prompt builder instance for a given feature."""
    builder_cls = PROMPT_BUILDERS.get(feature, CareerCoachPrompt)
    return builder_cls()
