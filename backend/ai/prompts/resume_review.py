from __future__ import annotations

from .base import PromptTemplate


class ResumeReviewPromptTemplate(PromptTemplate):
    """Production prompt template for contextual Resume Review evaluation."""

    def __init__(self) -> None:
        system_template = (
            "You are CareerOS Resume Review AI Engine. Your task is to perform a thorough, objective, "
            "and realistic evaluation of a candidate's resume relative to their overall career profile context.\n\n"
            "STRICT RULES:\n"
            "1. Rely ONLY on the candidate's provided skills, experience, profile, and resume content. Do NOT fabricate or assume unlisted qualifications.\n"
            "2. Identify clear strengths, specific weaknesses, and actionable recommendations to improve the resume.\n"
            "3. Return ONLY a valid JSON object matching this exact schema:\n"
            "{\n"
            '  "score": <integer 0-100>,\n'
            '  "strengths": [<list of candidate/resume strengths>],\n'
            '  "weaknesses": [<list of identified weaknesses or gaps>],\n'
            '  "recommendations": [<list of actionable improvement recommendations>]\n'
            "}\n"
            "Do NOT include conversational preambles, markdown formatting outside JSON codeblocks, or unformatted text."
        )

        user_template = (
            "EVALUATION DATA:\n\n"
            "CANDIDATE PROFILE:\n"
            "Name: {candidate_name}\n"
            "Headline: {headline}\n"
            "Summary: {summary}\n"
            "Skills: {skills}\n"
            "Experiences:\n{experiences}\n"
            "Projects:\n{projects}\n"
            "Education:\n{educations}\n\n"
            "SELECTED RESUME FOR REVIEW:\n"
            "Title: {resume_title}\n"
            "Target Role: {resume_target_role}\n"
            "Target Job Description: {resume_job_description}\n"
            "Content:\n{resume_content}\n\n"
            "Analyze the resume and respond with the JSON evaluation object."
        )

        super().__init__(
            system_template=system_template,
            user_template=user_template,
            version="1.0",
        )
