from __future__ import annotations

import unittest
from ai.prompts.resume_review import ResumeReviewPromptTemplate


class ResumeReviewPromptTemplateTests(unittest.TestCase):
    def setUp(self) -> None:
        self.template = ResumeReviewPromptTemplate()

    def test_version_and_basic_attributes(self) -> None:
        self.assertEqual(self.template.version, "2.0")

    def test_system_template_contains_core_principles(self) -> None:
        sys_tmpl = self.template.system_template
        self.assertIn("CORE EVALUATION PRINCIPLE", sys_tmpl)
        self.assertIn("QUALITY AND EVIDENCE OF THE SELECTED RESUME DOCUMENT", sys_tmpl)
        self.assertIn("strong CareerOS profile MUST NOT increase dimension scores", sys_tmpl)
        self.assertIn("Do NOT confuse skills listed in CareerOS with skills demonstrated on the resume", sys_tmpl)

    def test_system_template_contains_dimensional_scale_and_dimensions(self) -> None:
        sys_tmpl = self.template.system_template
        self.assertIn("DIMENSIONAL RATING SCALE", sys_tmpl)
        self.assertIn("0-2 (Severely Deficient)", sys_tmpl)
        self.assertIn("3-4 (Weak)", sys_tmpl)
        self.assertIn("5-6 (Adequate / Needs Improvement)", sys_tmpl)
        self.assertIn("7-8 (Strong)", sys_tmpl)
        self.assertIn("9-10 (Exceptional)", sys_tmpl)

        required_dims = [
            "completeness",
            "content_quality",
            "experience_quality",
            "projects_achievements",
            "skills_presentation",
            "target_role_relevance",
            "professional_presentation",
        ]
        for dim in required_dims:
            self.assertIn(dim, sys_tmpl)

    def test_system_template_contains_evidence_rules(self) -> None:
        sys_tmpl = self.template.system_template
        self.assertIn("EVIDENCE & RECOMMENDATION RULES", sys_tmpl)
        self.assertIn("Evidence Rule", sys_tmpl)
        self.assertIn("Recommendation Rule", sys_tmpl)

    def test_prompt_rendering_with_context(self) -> None:
        context = {
            "candidate_name": "Alice Dev",
            "headline": "Backend Engineer",
            "summary": "Experienced Python Developer",
            "skills": "Python, Django, PostgreSQL",
            "experiences": "Software Engineer at Acme (2022-Present)",
            "projects": "CareerOS AI (Next.js & Django)",
            "educations": "B.S. CS at MIT",
            "resume_title": "Alice Resume 2026",
            "resume_target_role": "Senior Python Engineer",
            "resume_job_description": "Seeking Python & Django expertise",
            "resume_content": "Summary: Python developer.\nExperience: Software Engineer at Acme.",
        }
        sys_prompt, user_prompt = self.template.format(context=context)
        self.assertIn("Alice Dev", user_prompt)
        self.assertIn("Alice Resume 2026", user_prompt)
        self.assertIn("Senior Python Engineer", user_prompt)
        self.assertIn("CORE EVALUATION PRINCIPLE", sys_prompt)
