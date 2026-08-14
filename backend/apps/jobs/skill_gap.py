from __future__ import annotations

import re
from typing import NamedTuple

ALIAS_MAP = {
    "react.js": "react",
    "reactjs": "react",
    "node.js": "node",
    "nodejs": "node",
    "vue.js": "vue",
    "vuejs": "vue",
    "next.js": "next",
    "nextjs": "next",
    "postgres": "postgresql",
    "js": "javascript",
    "ts": "typescript",
    "py": "python",
    "golang": "go",
    "go lang": "go",
    "go language": "go",
}


def normalize_skill(name: str) -> str:
    """Normalizes skill name case-insensitively with alias support."""
    cleaned = name.strip().lower()
    return ALIAS_MAP.get(cleaned, cleaned)


# Maintainable list of unambiguous technical skills
UNAMBIGUOUS_SKILLS = [
    "React",
    "Next.js",
    "Vue",
    "Angular",
    "TypeScript",
    "JavaScript",
    "Node.js",
    "Python",
    "Django",
    "FastAPI",
    "Flask",
    "PostgreSQL",
    "MySQL",
    "MongoDB",
    "Docker",
    "Kubernetes",
    "AWS",
    "GCP",
    "Azure",
    "REST API",
    "GraphQL",
    "Microservices",
    "CI/CD",
    "Git",
    "Agile",
    "System Design",
    "Unit Testing",
    "SQL",
    "Redis",
    "Java",
    "Spring Boot",
    "C++",
    "Rust",
    "HTML",
    "CSS",
    "Tailwind",
    "Kafka",
    "Golang",
]

CANONICAL_SKILL_MAP = {s.lower(): s for s in UNAMBIGUOUS_SKILLS}


def _build_unambiguous_pattern(skills: list[str]) -> re.Pattern[str]:
    # Sort by length descending to match longer names first (e.g. Next.js before Next)
    escaped = [re.escape(s) for s in sorted(skills, key=len, reverse=True)]
    pattern_str = r"\b(" + "|".join(escaped) + r")\b"
    return re.compile(pattern_str, re.IGNORECASE)


UNAMBIGUOUS_TECH_PATTERN = _build_unambiguous_pattern(UNAMBIGUOUS_SKILLS)


class ContextualSkillRule(NamedTuple):
    canonical_name: str
    patterns: list[re.Pattern[str]]


# Rules for ambiguous short/common words that require technical context
CONTEXTUAL_SKILL_RULES: list[ContextualSkillRule] = [
    ContextualSkillRule(
        canonical_name="Go",
        patterns=[
            re.compile(
                r"\b(Go\s+(?:programming|lang|language|developer|engineer|code|backend|microservices|sdk|framework|runtime|service|services|projects?))\b",
                re.IGNORECASE,
            ),
            re.compile(
                r"\bGo\s*[/&,]\s*(?:Python|Java|Rust|C\+\+|TypeScript|Node|Ruby|Docker|Kubernetes|Backend)\b",
                re.IGNORECASE,
            ),
            re.compile(
                r"\b(?:Python|Java|Rust|C\+\+|TypeScript|Node|Ruby|Docker|Kubernetes|Backend)\s*[/&,]\s*(Go)\b",
                re.IGNORECASE,
            ),
            re.compile(
                r"\b(?:experience\s+in|proficient\s+in|knowledge\s+of|written\s+in|built\s+with|using)\s+(Go)\b",
                re.IGNORECASE,
            ),
        ],
    ),
]


def extract_job_skills(job_description: str, job_title: str) -> list[str]:
    """Extracts required skills from job title and description text safely."""
    text = f"{job_title} {job_description}"
    extracted: list[str] = []

    # 1. Match unambiguous skills
    matches = UNAMBIGUOUS_TECH_PATTERN.findall(text)
    for m in matches:
        canonical = CANONICAL_SKILL_MAP.get(m.lower(), m.strip())
        if canonical.lower() == "golang":
            extracted.append("Go")
        else:
            extracted.append(canonical)

    # 2. Match contextual skills for ambiguous terms
    for rule in CONTEXTUAL_SKILL_RULES:
        for pat in rule.patterns:
            if pat.search(text):
                extracted.append(rule.canonical_name)
                break

    unique_matches = list(dict.fromkeys(extracted))
    return unique_matches if unique_matches else ["Software Engineering", "Problem Solving"]


def perform_deterministic_skill_comparison(
    user_skills: list[str], required_skills: list[str]
) -> tuple[list[str], list[str]]:
    """Performs deterministic case-insensitive skill comparison with alias resolution."""
    user_skill_map = {normalize_skill(s): s for s in user_skills}
    matched = []
    unmatched = []

    for req in required_skills:
        norm_req = normalize_skill(req)
        if norm_req in user_skill_map:
            matched.append(req)
        else:
            unmatched.append(req)

    return list(dict.fromkeys(matched)), list(dict.fromkeys(unmatched))
