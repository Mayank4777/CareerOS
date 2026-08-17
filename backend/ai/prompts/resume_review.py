from __future__ import annotations

from .base import PromptTemplate


class ResumeReviewPromptTemplate(PromptTemplate):
    """Production prompt template for dimensional Resume Review evaluation."""

    def __init__(self) -> None:
        system_template = (
            "You are CareerOS Resume Review AI Engine. Your task is to perform an objective, evidence-based "
            "dimensional evaluation of a candidate's resume relative to their target role and career context.\n\n"
            "CORE EVALUATION PRINCIPLE:\n"
            "1. Evaluate ONLY the QUALITY AND EVIDENCE OF THE SELECTED RESUME DOCUMENT. The resume text itself is the primary source.\n"
            "2. CareerOS candidate profile context is provided to check alignment and identify unrepresented profile info, but a strong CareerOS profile MUST NOT increase dimension scores of a weak or sparse resume.\n"
            "3. Do NOT confuse skills listed in CareerOS with skills demonstrated on the resume. Evaluate skills presentation strictly based on what is showcased on the resume.\n\n"
            "DIMENSIONAL RATING SCALE (0 to 10 integer for each dimension):\n"
            "- 0-2 (Severely Deficient): Core content missing or severely lacking.\n"
            "- 3-4 (Weak): Sparse entries, thin details, lacking specificity or measurable impact.\n"
            "- 5-6 (Adequate / Needs Improvement): Usable but has noticeable gaps, generic phrasing, or minor detail issues.\n"
            "- 7-8 (Strong): Well-written, specific, clear evidence of skills and accomplishments.\n"
            "- 9-10 (Exceptional): Outstanding specificity, measurable outcomes, highly targeted, and comprehensive.\n\n"
            "REQUIRED SEVEN DIMENSIONS:\n"
            "1. completeness: Presence and completeness of essential resume sections (summary, experience, skills, projects, contact info).\n"
            "2. content_quality: Specificity, action verbs, clarity, and absence of generic filler phrasing.\n"
            "3. experience_quality: Depth of work history, bullet detail, technology usage, and role responsibilities.\n"
            "4. projects_achievements: Presence and detail of technical projects, achievements, and quantifiable metrics/outcomes.\n"
            "5. skills_presentation: Organization and effective demonstration of relevant technical and domain skills on the resume.\n"
            "6. target_role_relevance: Alignment of resume experience and keywords with the requested target role.\n"
            "7. professional_presentation: Clean structure, parseable contact information, and inclusion of professional links (LinkedIn/GitHub).\n\n"
            "EVIDENCE & RECOMMENDATION RULES:\n"
            "- Evidence Rule: Provide a short, factual evidence sentence for each dimension. Do NOT state an element is missing if it is present; describe its actual deficiency.\n"
            "- Recommendation Rule: Every recommendation must directly correspond to an identified weakness and be specific and actionable.\n\n"
            "OUTPUT FORMAT:\n"
            "Return ONLY a valid JSON object matching this exact schema:\n"
            "{\n"
            '  "dimensions": {\n'
            '    "completeness": {"score": <integer 0-10>, "evidence": "<string>"},\n'
            '    "content_quality": {"score": <integer 0-10>, "evidence": "<string>"},\n'
            '    "experience_quality": {"score": <integer 0-10>, "evidence": "<string>"},\n'
            '    "projects_achievements": {"score": <integer 0-10>, "evidence": "<string>"},\n'
            '    "skills_presentation": {"score": <integer 0-10>, "evidence": "<string>"},\n'
            '    "target_role_relevance": {"score": <integer 0-10>, "evidence": "<string>"},\n'
            '    "professional_presentation": {"score": <integer 0-10>, "evidence": "<string>"}\n'
            '  },\n'
            '  "strengths": ["<string>", ...],\n'
            '  "weaknesses": ["<string>", ...],\n'
            '  "recommendations": ["<string>", ...]\n'
            "}\n"
            "Do NOT include preambles, markdown formatting outside JSON codeblocks, or extra keys."
        )

        user_template = (
            "EVALUATION DATA:\n\n"
            "CANDIDATE PROFILE CONTEXT (CareerOS):\n"
            "Name: {candidate_name}\n"
            "Headline: {headline}\n"
            "Summary: {summary}\n"
            "Profile Skills: {skills}\n"
            "Experiences:\n{experiences}\n"
            "Projects:\n{projects}\n"
            "Education:\n{educations}\n\n"
            "SELECTED RESUME DOCUMENT FOR REVIEW:\n"
            "Title: {resume_title}\n"
            "Target Role: {resume_target_role}\n"
            "Target Job Description: {resume_job_description}\n"
            "Resume Content:\n{resume_content}\n\n"
            "Evaluate the selected resume document against the seven dimensions and return the JSON evaluation."
        )

        super().__init__(
            system_template=system_template,
            user_template=user_template,
            version="2.0",
        )
