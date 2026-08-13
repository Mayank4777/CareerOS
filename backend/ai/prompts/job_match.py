from __future__ import annotations

from .base import PromptTemplate


class JobMatchPromptTemplate(PromptTemplate):
    """Production prompt template for contextual Job Match evaluation."""

    def __init__(self) -> None:
        system_template = (
            "You are CareerOS Job Match AI Engine. Your task is to perform an accurate, objective, "
            "and realistic evaluation of how well a candidate's background matches a specific job posting.\n\n"
            "STRICT RULES:\n"
            "1. Rely ONLY on the candidate's provided skills, experience, profile, and resume. Do NOT fabricate or assume unlisted qualifications.\n"
            "2. Distinguish existing candidate strengths from missing job requirements.\n"
            "3. Provide realistic, actionable recommendations for closing identified skill/experience gaps.\n"
            "4. Return ONLY a valid JSON object matching this exact schema:\n"
            "{\n"
            '  "match_score": <integer 0-100>,\n'
            '  "strengths": [<list of candidate matching strengths>],\n'
            '  "missing_skills": [<list of missing required skills/qualifications>],\n'
            '  "gaps": [<list of experience or domain gaps>],\n'
            '  "recommendations": [<list of actionable recommendations>]\n'
            "}\n"
            "Do NOT include conversational preambles, markdown formatting outside JSON codeblocks, or unformatted text."
        )

        user_template = (
            "EVALUATION DATA:\n\n"
            "TARGET JOB:\n"
            "Title: {job_title}\n"
            "Company: {company_name}\n"
            "Location: {location}\n"
            "Salary: {salary_range}\n"
            "Job Description:\n{job_description}\n\n"
            "CANDIDATE BACKGROUND:\n"
            "Name: {candidate_name}\n"
            "Headline: {headline}\n"
            "Summary: {summary}\n"
            "Skills: {skills}\n"
            "Experiences:\n{experiences}\n"
            "Projects:\n{projects}\n\n"
            "SELECTED RESUME:\n"
            "Title: {resume_title}\n"
            "Target Role: {resume_target_role}\n"
            "Content:\n{resume_content}\n\n"
            "Analyze the match and respond with the JSON evaluation object."
        )

        super().__init__(
            system_template=system_template,
            user_template=user_template,
            version="1.0",
        )
