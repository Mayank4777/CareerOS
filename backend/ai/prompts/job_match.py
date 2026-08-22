from __future__ import annotations

from .base import PromptTemplate


class JobMatchPromptTemplate(PromptTemplate):
    """Production prompt template for contextual Job Match evaluation."""

    def __init__(self) -> None:
        system_template = (
            "You are CareerOS Job Match AI Engine. Your task is to perform qualitative contextual interpretation of how well a candidate's background matches a specific job posting.\n\n"
            "AUTHORITATIVE DETERMINISTIC BOUNDARIES:\n"
            "1. The provided deterministic factual analysis (Matched Skills, Missing Skills, Skill Coverage, Baseline Score) is authoritative. Do NOT attempt to alter match_score or convert missing skills into candidate strengths.\n"
            "2. Rely ONLY on candidate-owned skills from profile/resume. Do NOT fabricate or assume unlisted qualifications.\n"
            "3. Distinguish qualitative candidate strengths from domain/experience gaps.\n"
            "4. Provide realistic, actionable recommendations for closing identified skill/experience gaps.\n"
            "5. Return ONLY a valid JSON object matching this exact schema:\n"
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
            "DETERMINISTIC FACTUAL ANALYSIS:\n"
            "Matched Skills: {deterministic_matched_skills}\n"
            "Missing Skills: {deterministic_missing_skills}\n"
            "Skill Coverage: {deterministic_coverage}\n"
            "Baseline Score: {deterministic_baseline_score}\n\n"
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
