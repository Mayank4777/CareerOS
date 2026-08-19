from __future__ import annotations

import re
from typing import Any, NamedTuple

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


def calculate_deterministic_job_match(
    user_skills: list[str], job_description: str, job_title: str
) -> dict[str, Any]:
    """Calculates authoritative deterministic skill-match statistics and baseline match score."""
    required_skills = extract_job_skills(job_description, job_title)
    matched_skills, missing_skills = perform_deterministic_skill_comparison(user_skills, required_skills)

    total_req = len(required_skills)
    coverage_percentage = int((len(matched_skills) / total_req) * 100) if total_req > 0 else 100
    baseline_score = max(0, min(100, coverage_percentage))

    return {
        "required_skills": required_skills,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "coverage_percentage": coverage_percentage,
        "baseline_score": baseline_score,
    }


SKILL_ACTION_TEMPLATES: dict[str, dict[str, str]] = {
    "python": {
        "matched": "Strengthen production-level Python usage with advanced concurrency, typing, and performance profiling.",
        "partial": "Build a production-quality Python service with unit testing, type hints, and clean package structure.",
        "missing": "Learn Python fundamentals and build a backend REST API project demonstrating core syntax and OOP.",
    },
    "django": {
        "matched": "Optimize Django ORM database queries, indexing, and custom middleware for scale.",
        "partial": "Build REST APIs using Django REST Framework and implement authentication and database-backed CRUD.",
        "missing": "Learn Django web framework fundamentals and build a database-backed web application.",
    },
    "docker": {
        "matched": "Master multi-stage Docker builds, container security, and production optimization.",
        "partial": "Create a production Dockerfile and set up Docker Compose for local multi-container development.",
        "missing": "Learn Docker containerization fundamentals and build a containerized application project.",
    },
    "aws": {
        "matched": "Implement Infrastructure as Code (IaC) and cloud architecture best practices on AWS.",
        "partial": "Deploy a backend service using core AWS services (EC2, S3, IAM, and CloudWatch).",
        "missing": "Learn AWS core cloud services and deploy a containerized backend application to the cloud.",
    },
    "postgresql": {
        "matched": "Practice query optimization, connection pooling, and advanced indexing in PostgreSQL.",
        "partial": "Design relational schemas and write complex SQL joins, indexes, and transactions in PostgreSQL.",
        "missing": "Learn SQL & PostgreSQL relational database fundamentals and schema design.",
    },
    "react": {
        "matched": "Implement advanced React state management, SSR, and performance memoization.",
        "partial": "Build interactive single-page application components using React hooks and TypeScript.",
        "missing": "Learn React component architecture and build a frontend portfolio project.",
    },
    "kubernetes": {
        "matched": "Optimize Kubernetes cluster manifests, ingress controllers, and auto-scaling policies.",
        "partial": "Containerize an application and deploy it using Kubernetes deployments, services, and configs.",
        "missing": "Learn Kubernetes orchestration fundamentals and deploy local microservices with kubectl.",
    },
    "typescript": {
        "matched": "Leverage advanced TypeScript generics, conditional types, and strict type safety.",
        "partial": "Refactor JavaScript code to TypeScript using strict compiler options and interface models.",
        "missing": "Learn TypeScript fundamentals and build a strongly-typed web project.",
    },
    "javascript": {
        "matched": "Master modern ES6+ asynchronous patterns, event loops, and performance optimizations.",
        "partial": "Build dynamic web interfaces using modern ES6+ JavaScript async/await patterns.",
        "missing": "Learn modern JavaScript ES6+ fundamentals and DOM manipulation.",
    },
    "node": {
        "matched": "Optimize Node.js event loop performance, worker threads, and microservice communication.",
        "partial": "Build backend HTTP services using Node.js, Express, and asynchronous middleware.",
        "missing": "Learn Node.js runtime fundamentals and build a REST API service.",
    },
    "git": {
        "matched": "Master advanced Git workflows including rebasing, interactive staging, and feature branching.",
        "partial": "Practice collaborative Git workflows including PR reviews, branching, and merge conflict resolution.",
        "missing": "Learn Git version control fundamentals and manage codebase revisions via GitHub.",
    },
    "ci/cd": {
        "matched": "Build automated multi-environment deployment pipelines with security auditing.",
        "partial": "Configure automated CI/CD workflows using GitHub Actions for build and test automation.",
        "missing": "Learn CI/CD automation fundamentals and set up a basic build/test pipeline.",
    },
    "redis": {
        "matched": "Implement distributed caching strategies, pub/sub messaging, and rate limiting with Redis.",
        "partial": "Integrate Redis caching into backend services to reduce database query latency.",
        "missing": "Learn Redis key-value store fundamentals and caching strategies.",
    },
}


def get_deterministic_recommendation(skill_name: str, status: str) -> str:
    norm = normalize_skill(skill_name)
    template = SKILL_ACTION_TEMPLATES.get(norm)
    if template and status in template:
        return template[status]

    if status == "matched":
        return f"Strengthen production-level usage of {skill_name} and explore advanced optimizations."
    elif status == "partial":
        return f"Build a practical project using {skill_name} and document the implementation workflow."
    else:
        return f"Learn {skill_name} fundamentals and build a portfolio project demonstrating its usage."


def calculate_deterministic_skill_gap(career_profile: Any, job: Any) -> dict[str, Any]:
    """
    Computes a 100% deterministic evidence-based Skill Gap Analysis.
    No external network calls, no LLMs, zero latency, 100% reproducible.
    """
    job_title = getattr(job, "title", "") or ""
    job_description = getattr(job, "description", "") or ""
    job_text_lower = f"{job_title} {job_description}".lower()

    required_skills = extract_job_skills(job_description, job_title)

    # 1. Gather candidate profile skills
    profile_skills = list(career_profile.skills.all()) if hasattr(career_profile, "skills") else []
    profile_skill_norms = {normalize_skill(s.name): s.name for s in profile_skills}

    # 2. Gather candidate projects
    projects = list(career_profile.projects.all()) if hasattr(career_profile, "projects") else []

    # 3. Gather candidate experiences
    experiences = list(career_profile.experiences.all()) if hasattr(career_profile, "experiences") else []

    matched_skills: list[str] = []
    partial_skills: list[dict[str, Any]] = []
    missing_skills: list[dict[str, Any]] = []
    evidence_map: dict[str, list[str]] = {}

    for req_skill in required_skills:
        norm_req = normalize_skill(req_skill)
        score = 0
        reasons: list[str] = []
        evidence_list: list[str] = []

        # Signal A: Direct profile skill match (+50 pts)
        if norm_req in profile_skill_norms:
            score += 50
            reasons.append("Listed in candidate profile skills")
            evidence_list.append(f"Direct profile skill: '{profile_skill_norms[norm_req]}'")

        # Signal B: Project technology evidence (+30 pts max per project)
        for proj in projects:
            proj_tech = (getattr(proj, "technologies", "") or "").lower()
            if norm_req in proj_tech or re.search(r"\b" + re.escape(norm_req) + r"\b", proj_tech):
                score += 30
                reason_text = f"Used in project '{proj.title}' technology stack"
                if reason_text not in reasons:
                    reasons.append(reason_text)
                    evidence_list.append(f"Project '{proj.title}' technologies: {proj.technologies}")

        # Signal C: Project description evidence (+20 pts max per project if not tech match)
        for proj in projects:
            proj_text = f"{getattr(proj, 'title', '')} {getattr(proj, 'role', '')} {getattr(proj, 'description', '')}".lower()
            if norm_req in proj_text or re.search(r"\b" + re.escape(norm_req) + r"\b", proj_text):
                reason_text = f"Demonstrated in project '{proj.title}' description"
                if reason_text not in reasons:
                    score += 20
                    reasons.append(reason_text)
                    evidence_list.append(f"Project '{proj.title}' description mention")

        # Signal D: Work experience description evidence (+20 pts max per experience)
        for exp in experiences:
            exp_text = f"{getattr(exp, 'designation', '')} {getattr(exp, 'company', '')} {getattr(exp, 'description', '')}".lower()
            if norm_req in exp_text or re.search(r"\b" + re.escape(norm_req) + r"\b", exp_text):
                reason_text = f"Demonstrated in experience '{exp.designation} at {exp.company}'"
                if reason_text not in reasons:
                    score += 20
                    reasons.append(reason_text)
                    evidence_list.append(f"Experience '{exp.designation} at {exp.company}' mention")

        total_score = min(100, score)
        evidence_map[req_skill] = evidence_list

        # Classification
        if total_score >= 50 or norm_req in profile_skill_norms:
            matched_skills.append(req_skill)
        elif 20 <= total_score < 50:
            reason_str = f"Partial evidence found: {'; '.join(reasons)}" if reasons else f"Partial evidence found for {req_skill}."
            partial_skills.append({
                "skill": req_skill,
                "reason": reason_str,
                "recommendation": get_deterministic_recommendation(req_skill, "partial"),
            })
        else:
            # Importance determination
            count_occurrences = job_text_lower.count(norm_req)
            is_in_title = norm_req in job_title.lower()
            is_high_priority_tech = norm_req in ["python", "java", "c++", "rust", "go", "aws", "docker", "kubernetes", "postgresql", "react"]

            if is_in_title or count_occurrences >= 2 or is_high_priority_tech:
                importance = "high"
            elif count_occurrences == 1:
                importance = "medium"
            else:
                importance = "low"

            missing_skills.append({
                "skill": req_skill,
                "importance": importance,
                "reason": f"No direct evidence for '{req_skill}' found in candidate profile, projects, or work experience.",
                "recommendation": get_deterministic_recommendation(req_skill, "missing"),
            })

    # Consolidate recommendations
    recommendations: list[str] = []
    for item in missing_skills + partial_skills:
        rec = item.get("recommendation")
        if rec and rec not in recommendations:
            recommendations.append(rec)

    # If candidate is 100% matched, provide proactive growth recommendations
    if not recommendations:
        for m_skill in matched_skills[:3]:
            recommendations.append(get_deterministic_recommendation(m_skill, "matched"))

    return {
        "matched_skills": list(dict.fromkeys(matched_skills)),
        "missing_skills": missing_skills,
        "partial_skills": partial_skills,
        "recommendations": recommendations,
        "evidence": evidence_map,
    }
