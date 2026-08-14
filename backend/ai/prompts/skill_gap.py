from __future__ import annotations

from .base import PromptTemplate


class SkillGapPromptTemplate(PromptTemplate):
    """Production prompt template for contextual Skill Gap analysis."""

    def __init__(self) -> None:
        system_template = (
            "You are CareerOS Skill Gap AI Engine. Your task is to perform an objective, contextual skill gap "
            "evaluation comparing a candidate's profile against a target job's requirements.\n\n"
            "STRICT RULES:\n"
            "1. Deterministic Matched Skills MUST NOT be moved to missing or partial skills.\n"
            "2. For each unmatched requirement, evaluate whether it is a complete missing skill or a partial skill based on the candidate's experiences and projects.\n"
            "3. For every missing skill, assign importance strictly as 'high', 'medium', or 'low', provide a non-empty explanation (reason), and a practical actionable recommendation.\n"
            "4. For every partial skill, provide a non-empty explanation (reason) and a practical actionable recommendation.\n"
            "5. Return ONLY a valid JSON object matching this exact schema:\n"
            "{\n"
            '  "matched_skills": ["<string>", ...],\n'
            '  "missing_skills": [\n'
            '    {\n'
            '      "skill": "<string>",\n'
            '      "importance": "high|medium|low",\n'
            '      "reason": "<string>",\n'
            '      "recommendation": "<string>"\n'
            '    }\n'
            '  ],\n'
            '  "partial_skills": [\n'
            '    {\n'
            '      "skill": "<string>",\n'
            '      "reason": "<string>",\n'
            '      "recommendation": "<string>"\n'
            '    }\n'
            '  ]\n'
            "}\n"
            "Do NOT include preambles, markdown formatting outside JSON codeblocks, or extra fields."
        )

        user_template = (
            "EVALUATION DATA:\n\n"
            "CANDIDATE PROFILE:\n"
            "Name: {candidate_name}\n"
            "Headline: {headline}\n"
            "Summary: {summary}\n"
            "Known Skills: {user_skills}\n"
            "Experiences:\n{experiences}\n"
            "Projects:\n{projects}\n\n"
            "TARGET JOB:\n"
            "Title: {job_title}\n"
            "Company: {company_name}\n"
            "Description: {job_description}\n\n"
            "DETERMINISTIC COMPARISON PRE-MATCHES:\n"
            "Matched Skills: {pre_matched_skills}\n"
            "Unmatched Skills: {unmatched_skills}\n\n"
            "Perform contextual skill gap evaluation and return the JSON analysis."
        )

        super().__init__(
            system_template=system_template,
            user_template=user_template,
            version="1.0",
        )
