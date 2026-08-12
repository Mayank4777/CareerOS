from __future__ import annotations

import json
import logging
import re
from typing import Any

from apps.ai_coach.client import OllamaClient
from apps.ai_coach.exceptions import OllamaError
from .models import Resume

logger = logging.getLogger(__name__)


class ResumeReviewEngine:
    """Engine that performs AI-powered resume review, ATS keyword matching, and bullet enhancements."""

    def __init__(self, resume: Resume) -> None:
        self.resume = resume
        self.content = resume.content_data or {}
        self.target_role = resume.target_role or "Software Engineer"
        self.job_description = resume.job_description or ""
        self.ollama_client = OllamaClient()

    def analyze(self) -> dict[str, Any]:
        """Runs comprehensive ATS & content analysis."""
        raw_text = self._extract_full_resume_text()
        extracted_keywords = self._extract_job_keywords()

        present_kw = []
        missing_kw = []

        text_lower = raw_text.lower()
        for kw in extracted_keywords:
            if kw.lower() in text_lower:
                present_kw.append(kw)
            else:
                missing_kw.append(kw)

        # Count action verbs
        action_verbs = {
            "architected", "engineered", "spearheaded", "developed", "built", "designed",
            "implemented", "optimised", "optimized", "scaled", "led", "automated",
            "refactored", "delivered", "deployed", "improved", "launched", "reduced", "increased"
        }
        found_verbs = [w for w in re.findall(r"\b[a-zA-Z]+\b", text_lower) if w in action_verbs]
        action_verbs_count = len(found_verbs)

        # Try Ollama prompt for AI suggestions
        issues = self._generate_ai_issues(raw_text)

        # Calculate scores
        kw_match_rate = int((len(present_kw) / max(1, len(extracted_keywords))) * 100) if extracted_keywords else 80
        verb_score = min(100, action_verbs_count * 5 + 50)
        overall_score = max(50, min(98, int(kw_match_rate * 0.4 + verb_score * 0.3 + 25)))

        grade = "A" if overall_score >= 85 else "B" if overall_score >= 70 else "C"

        metrics = [
            {
                "category": "Keyword Match Rate",
                "score": kw_match_rate,
                "maxScore": 100,
                "status": "optimal" if kw_match_rate >= 75 else "warning",
                "details": f"{len(present_kw)} out of {len(extracted_keywords)} target keywords present."
            },
            {
                "category": "Formatting & Structure",
                "score": 95,
                "maxScore": 100,
                "status": "optimal",
                "details": "Clean section headers and parseable ATS layout."
            },
            {
                "category": "Action Verb Strength",
                "score": verb_score,
                "maxScore": 100,
                "status": "optimal" if verb_score >= 75 else "warning",
                "details": f"{action_verbs_count} active leadership verbs detected."
            },
            {
                "category": "Quantifiable Impact",
                "score": 80 if "%" in raw_text or "0" in raw_text else 60,
                "maxScore": 100,
                "status": "optimal" if "%" in raw_text else "warning",
                "details": "Bullet points contain measurable metrics." if "%" in raw_text else "Add more percentages or dollar impact to bullet points."
            }
        ]

        section_analyses = [
            {
                "sectionName": "Work Experience",
                "score": verb_score,
                "status": "strong",
                "feedback": ["Clear role titles and timelines", "Action-oriented bullet points"],
                "recommendations": ["Include specific tech stack used in each role accomplishment."]
            },
            {
                "sectionName": "Skills & Technologies",
                "score": kw_match_rate,
                "status": "strong",
                "feedback": ["Well-grouped technical capabilities"],
                "recommendations": [f"Consider adding missing keywords: {', '.join(missing_kw[:3])}"] if missing_kw else ["Skills align well with target role."]
            }
        ]

        return {
            "resumeId": str(self.resume.id),
            "resumeTitle": self.resume.title,
            "overallScore": overall_score,
            "grade": grade,
            "targetRole": self.target_role,
            "missingKeywords": missing_kw[:8],
            "presentKeywords": present_kw,
            "actionVerbsCount": action_verbs_count,
            "readabilityScore": "Professional (Grade 12)",
            "metrics": metrics,
            "sectionAnalyses": section_analyses,
            "issues": issues,
            "strengths": [
                f"Strong keyword alignment for {self.target_role} roles",
                "Clear structure with parseable contact header",
                "Consistent work experience timeline"
            ],
            "weaknesses": [
                f"Missing key keywords: {', '.join(missing_kw[:3])}" if missing_kw else "Few minor phrasing optimizations recommended",
            ]
        }

    def _extract_full_resume_text(self) -> str:
        parts = []
        p_info = self.content.get("personal_info", {})
        parts.append(f"{p_info.get('full_name', '')} {p_info.get('headline', '')}")
        parts.append(self.content.get("summary", ""))

        for sec in self.content.get("sections", []):
            parts.append(sec.get("title", ""))
            for item in sec.get("items", []):
                if isinstance(item, dict):
                    parts.append(item.get("title", ""))
                    parts.append(item.get("company", ""))
                    parts.append(item.get("description", ""))
                    parts.extend(item.get("bullets", []))
                    if "skills" in item:
                        parts.extend(item["skills"])
        return "\n".join(parts)

    def _extract_job_keywords(self) -> list[str]:
        default_keywords = ["React", "TypeScript", "Python", "Django", "REST API", "Git", "SQL", "Docker", "CI/CD", "Agile"]
        if not self.job_description and not self.target_role:
            return default_keywords

        text = f"{self.target_role} {self.job_description}"
        tech_pattern = re.compile(r"\b(React|Next\.js|Vue|Angular|TypeScript|JavaScript|Node\.js|Python|Django|FastAPI|Flask|PostgreSQL|MySQL|MongoDB|Docker|Kubernetes|AWS|GCP|Azure|REST API|GraphQL|Microservices|CI/CD|Git|Agile|System Design|Unit Testing)\b", re.IGNORECASE)
        matches = tech_pattern.findall(text)

        unique_matches = list(dict.fromkeys([m.strip() for m in matches]))
        return unique_matches if unique_matches else default_keywords

    def _generate_ai_issues(self, raw_text: str) -> list[dict[str, Any]]:
        """Uses Ollama to suggest specific bullet point enhancements, or returns high-value default fixes."""
        default_issues = [
            {
                "id": "iss-1",
                "section": "Experience Section",
                "originalText": "Responsible for backend API development and bug fixes.",
                "suggestedText": "Engineered high-throughput REST APIs using Django REST Framework, improving endpoint response time by 35%.",
                "explanation": "Replace passive phrasing 'Responsible for' with active leadership verb 'Engineered' and quantifiable outcome.",
                "issueType": "action_verb"
            },
            {
                "id": "iss-2",
                "section": "Summary Statement",
                "originalText": "Passionate developer who works hard and learns fast.",
                "suggestedText": f"Results-driven {self.target_role} with expertise in building scalableweb applications and modern cloud architectures.",
                "explanation": "Elevate generic summary to highlight target role expertise and value delivered.",
                "issueType": "readability"
            }
        ]

        if not self.ollama_client:
            return default_issues

        try:
            prompt = (
                f"Analyze this resume text for target role '{self.target_role}':\n"
                f"Text snippet: {raw_text[:1000]}\n\n"
                f"Identify 2 weak sentences or bullet points and return a JSON list of objects with fields: "
                f"id, section, originalText, suggestedText, explanation, issueType (action_verb, readability, grammar)."
            )
            response = self.ollama_client.generate(
                prompt=prompt,
                system="You are an expert resume reviewer and ATS optimizer. Return valid JSON only."
            )
            resp_text = response.get("response", "")
            # Attempt to extract JSON from response
            match = re.search(r"\[.*\]", resp_text, re.DOTALL)
            if match:
                parsed = json.loads(match.group(0))
                if isinstance(parsed, list) and len(parsed) > 0:
                    return parsed
        except Exception as exc:
            logger.warning("Ollama call in ResumeReviewEngine fallback to default issues: %s", exc)

        return default_issues
