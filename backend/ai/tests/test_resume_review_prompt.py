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
        self.assertIn("CORE EVALUATION PRINCIPLES", sys_tmpl)
        self.assertIn("QUALITY AND EVIDENCE OF THE SELECTED RESUME DOCUMENT", sys_tmpl)
        self.assertIn("numerical resume score is calculated separately", sys_tmpl)

    def test_system_template_contains_qualitative_schema(self) -> None:
        sys_tmpl = self.template.system_template
        self.assertIn("OUTPUT FORMAT", sys_tmpl)
        self.assertIn('"strengths"', sys_tmpl)
        self.assertIn('"weaknesses"', sys_tmpl)
        self.assertIn('"recommendations"', sys_tmpl)
        self.assertNotIn("DIMENSIONAL RATING SCALE", sys_tmpl)
        self.assertNotIn("REQUIRED SEVEN DIMENSIONS", sys_tmpl)

    def test_system_template_contains_recommendation_rules(self) -> None:
        sys_tmpl = self.template.system_template
        self.assertIn("EVIDENCE & RECOMMENDATION RULES", sys_tmpl)
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
            "deterministic_completeness_score": 85,
            "deterministic_missing_signals": "None",
            "deterministic_bullet_metrics": "Total bullets: 5, Quantifiable metric bullets: 2, Action verbs: 4",
        }
        sys_prompt, user_prompt = self.template.format(context=context)
        self.assertIn("Alice Dev", user_prompt)
        self.assertIn("Alice Resume 2026", user_prompt)
        self.assertIn("Senior Python Engineer", user_prompt)
        self.assertIn("CORE EVALUATION PRINCIPLES", sys_prompt)
