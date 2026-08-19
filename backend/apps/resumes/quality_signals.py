from __future__ import annotations

import re
from typing import Any


ACTION_VERBS = {
    "architected", "engineered", "spearheaded", "developed", "built", "designed",
    "implemented", "optimised", "optimized", "scaled", "led", "automated",
    "refactored", "delivered", "deployed", "improved", "launched", "reduced", "increased"
}


ACHIEVEMENT_METRIC_PATTERNS = [
    r"\d+(\.\d+)?%",  # percentages (e.g. 30%, 45.5%)
    r"\$\d+(?:,\d{3})*(?:\.\d+)?\b",  # dollar amounts (e.g. $50,000, $500k)
    r"\b\d+\s*(?:k|m|million|billion)\b",  # scale metrics (e.g. 50k, 10M, 2 million)
    r"\b(reduced|reducing|decreased|decreasing|cut|cutting)\b.{1,35}?\b\d+(\.\d+)?",  # reduction phrases
    r"\b(increased|increasing|improved|improving|grew|growing|boosted|boosting|accelerated|accelerating|generated|generating|saved|saving|achieved|achieving)\b.{1,35}?\b\d+(\.\d+)?",  # growth/savings phrases
    r"\b\d+\s*(x|times)\s*(faster|larger|better|more)\b",  # multiplier metrics (e.g. 3x faster)
]


def evaluate_deterministic_resume_quality_signals(user: Any, resume: Any) -> dict[str, Any]:
    """Evaluates objective evidence-based structural quality signals and metrics from a resume document without AI."""
    content = resume.content_data if isinstance(resume.content_data, dict) else {}
    target_role = resume.target_role.strip() if resume.target_role else ""
    job_description = resume.job_description.strip() if resume.job_description else ""

    # Contact info signals (from resume document content, fallback to career profile)
    personal_info = content.get("personal_info", {}) if isinstance(content.get("personal_info"), dict) else {}
    first_name = personal_info.get("first_name") or (user.first_name if hasattr(user, "first_name") else "")
    last_name = personal_info.get("last_name") or (user.last_name if hasattr(user, "last_name") else "")

    has_name = bool(first_name or last_name)
    phone_val = personal_info.get("phone") or personal_info.get("phone_number") or (hasattr(user, "career_profile") and getattr(user.career_profile, "phone", ""))
    has_phone = bool(phone_val)
    linkedin_val = personal_info.get("linkedin_url") or personal_info.get("linkedin") or (hasattr(user, "career_profile") and getattr(user.career_profile, "linkedin_url", ""))
    has_linkedin = bool(linkedin_val)
    github_val = personal_info.get("github_url") or personal_info.get("github") or (hasattr(user, "career_profile") and getattr(user.career_profile, "github_url", ""))
    has_github = bool(github_val)
    website_val = personal_info.get("website") or personal_info.get("portfolio_url") or (hasattr(user, "career_profile") and getattr(user.career_profile, "website", ""))
    has_website = bool(website_val)

    summary_text = str(content.get("summary") or (hasattr(user, "career_profile") and getattr(user.career_profile, "summary", "")) or "").strip()
    has_summary = len(summary_text) >= 10

    has_contact_link = has_linkedin or has_github or has_website

    # Category 1: Contact & Professional Identity (10 pts max)
    contact_score = (2 if has_name else 0) + (3 if has_phone else 0) + (5 if has_contact_link else 0)

    # Section inspection: Extract items from sections list OR top-level schema keys
    sections = content.get("sections", []) if isinstance(content.get("sections"), list) else []

    experience_items: list[dict[str, Any]] = []
    project_items: list[dict[str, Any]] = []
    education_items: list[dict[str, Any]] = []
    skills_list: list[str] = []
    total_bullets = 0
    generic_number_bullets_count = 0
    meaningful_metric_bullets_count = 0
    strong_bullets_count = 0
    full_text_parts: list[str] = [resume.title, target_role, job_description, summary_text]

    # 1. Parse from sections list if provided
    for sec in sections:
        if not isinstance(sec, dict):
            continue
        title = str(sec.get("title", "")).lower()
        items = sec.get("items", []) if isinstance(sec.get("items"), list) else []

        if "experience" in title or "work" in title or "history" in title:
            for item in items:
                if isinstance(item, dict):
                    experience_items.append(item)
        elif "project" in title:
            for item in items:
                if isinstance(item, dict):
                    project_items.append(item)
        elif "education" in title:
            for item in items:
                if isinstance(item, dict):
                    education_items.append(item)

        if "skill" in title:
            for item in items:
                if isinstance(item, str) and item.strip():
                    skills_list.append(item.strip())
                elif isinstance(item, dict):
                    skill_name = item.get("name") or item.get("title") or item.get("skill")
                    if skill_name and isinstance(skill_name, str):
                        skills_list.append(skill_name.strip())
                    elif "items" in item and isinstance(item["items"], list):
                        skills_list.extend([str(s).strip() for s in item["items"] if str(s).strip()])

    # 2. Parse from top-level schema keys if sections list omitted or incomplete
    if not experience_items:
        top_exp = content.get("experience") or content.get("work_experience")
        if isinstance(top_exp, list):
            for item in top_exp:
                if isinstance(item, dict):
                    experience_items.append(item)

    if not project_items:
        top_proj = content.get("projects") or content.get("project")
        if isinstance(top_proj, list):
            for item in top_proj:
                if isinstance(item, dict):
                    project_items.append(item)

    if not education_items:
        top_edu = content.get("education")
        if isinstance(top_edu, list):
            for item in top_edu:
                if isinstance(item, dict):
                    education_items.append(item)

    if not skills_list:
        top_skills = content.get("skills")
        if isinstance(top_skills, list):
            for item in top_skills:
                if isinstance(item, str) and item.strip():
                    skills_list.append(item.strip())
                elif isinstance(item, dict):
                    name = item.get("name") or item.get("title") or item.get("skill")
                    if name and isinstance(name, str):
                        skills_list.append(name.strip())

    # Consolidate bullets and text across all experience/project items
    all_content_items = experience_items + project_items + education_items
    for item in all_content_items:
        full_text_parts.append(str(item.get("title") or item.get("position") or item.get("role") or ""))
        full_text_parts.append(str(item.get("company") or item.get("organization") or item.get("institution") or ""))
        desc_str = str(item.get("description") or "").strip()
        if desc_str:
            full_text_parts.append(desc_str)

        bullets = item.get("bullets", []) if isinstance(item.get("bullets"), list) else []
        # Fallback: if bullets array is empty, derive bullet sentences from description text
        if not bullets and desc_str:
            bullets = [s.strip() for s in re.split(r"[\n;\.!]+", desc_str) if len(s.strip().split()) >= 3]

        for b in bullets:
            b_str = str(b).strip()
            if b_str:
                total_bullets += 1
                full_text_parts.append(b_str)
                # Check generic numbers vs meaningful achievement metrics
                is_meaningful = any(re.search(pat, b_str, re.IGNORECASE) for pat in ACHIEVEMENT_METRIC_PATTERNS)
                if is_meaningful:
                    meaningful_metric_bullets_count += 1
                elif re.search(r"\b\d+\b", b_str):
                    generic_number_bullets_count += 1

                # Strong bullet structure: Action verb + > 8 words + technical/domain context
                words = [w for w in re.findall(r"\b[a-zA-Z]+\b", b_str.lower())]
                has_verb = any(w in ACTION_VERBS for w in words)
                if has_verb and len(words) >= 8:
                    strong_bullets_count += 1

        item_skills = item.get("skills", []) if isinstance(item.get("skills"), list) else []
        if isinstance(item_skills, list):
            skills_list.extend([str(s).strip() for s in item_skills if str(s).strip()])

    experience_count = len(experience_items)
    project_count = len(project_items)
    education_count = len(education_items)
    unique_skills = list(dict.fromkeys([s.lower() for s in skills_list if s]))
    skill_count = len(unique_skills)

    # Category 2: Section Structure Baseline (10 pts max)
    sections_score = (
        (2.0 if has_summary else 0) +
        (2.0 if experience_count > 0 else 0) +
        (2.0 if education_count > 0 else 0) +
        (2.0 if project_count > 0 else 0) +
        (2.0 if skill_count > 0 else 0)
    )

    # Category 3: Experience Quality (25 pts max)
    exp_quality_score = 0.0
    if experience_count > 0:
        for exp in experience_items:
            exp_title = str(exp.get("title") or exp.get("role") or "").strip()
            exp_company = str(exp.get("company") or exp.get("organization") or "").strip()
            exp_desc = str(exp.get("description") or "").strip()
            exp_bullets = exp.get("bullets", []) if isinstance(exp.get("bullets"), list) else []
            combined_exp_text = f"{exp_desc} " + " ".join([str(b) for b in exp_bullets])
            words = re.findall(r"\b[a-zA-Z0-9]+\b", combined_exp_text)
            word_count = len(words)

            entry_score = 0.0
            if exp_title and exp_company:
                entry_score += 2.0
            elif exp_title or exp_company:
                entry_score += 1.0

            if word_count >= 20 or len(exp_bullets) >= 2:
                entry_score += 8.0
            elif word_count >= 8 or len(exp_bullets) >= 1:
                entry_score += 4.0
            else:
                entry_score += 1.5  # Thin 3-word description

            exp_words_lower = [w.lower() for w in words]
            if any(w in ACTION_VERBS for w in exp_words_lower):
                entry_score += 3.5

            exp_quality_score += entry_score

        exp_quality_score = min(25.0, exp_quality_score)

    # Category 4: Project Quality (15 pts max)
    proj_quality_score = 0.0
    if project_count > 0:
        for proj in project_items:
            proj_title = str(proj.get("title") or proj.get("name") or "").strip()
            proj_desc = str(proj.get("description") or "").strip()
            proj_skills = proj.get("skills", []) if isinstance(proj.get("skills"), list) else []
            proj_link = str(proj.get("link") or proj.get("url") or "").strip()
            combined_proj_text = f"{proj_desc} " + " ".join([str(s) for s in proj_skills])
            words = re.findall(r"\b[a-zA-Z0-9]+\b", combined_proj_text)
            word_count = len(words)

            entry_score = 0.0
            if proj_title:
                entry_score += 1.5

            if word_count >= 15 or len(proj_skills) >= 2 or proj_link:
                entry_score += 7.5
            elif word_count >= 5:
                entry_score += 3.5
            else:
                entry_score += 1.0  # Thin project

            proj_quality_score += entry_score

        proj_quality_score = min(15.0, proj_quality_score)

    # Category 5: Skills Quality & Non-Dump Limit (10 pts max)
    if skill_count == 0:
        skills_score = 0.0
    elif skill_count <= 3:
        skills_score = 5.0
    elif skill_count <= 7:
        skills_score = 7.5
    else:
        doc_body_text = " ".join(full_text_parts).lower()
        verified_skills_count = sum(1 for s in unique_skills if s in doc_body_text)
        if verified_skills_count >= 2:
            skills_score = 10.0
        else:
            # Skill dump without evidence elsewhere
            skills_score = 5.0

    # Category 6: Writing & Bullet Quality (10 pts max)
    full_text = " ".join(full_text_parts).lower()
    found_verbs = [w for w in re.findall(r"\b[a-zA-Z]+\b", full_text) if w in ACTION_VERBS]
    action_verbs_count = len(found_verbs)

    if total_bullets == 0:
        writing_score = 0.0
    elif strong_bullets_count >= 3:
        writing_score = 10.0
    elif strong_bullets_count >= 1:
        writing_score = 6.0
    elif action_verbs_count >= 1:
        writing_score = 3.0
    else:
        writing_score = 1.0

    # Category 7: Quantifiable Achievement Evidence (15 pts max)
    if meaningful_metric_bullets_count >= 2:
        metric_score = 15.0
    elif meaningful_metric_bullets_count == 1:
        metric_score = 9.0
    elif generic_number_bullets_count >= 1:
        metric_score = 3.0
    else:
        metric_score = 0.0

    # Category 8: Target Role Alignment (5 pts max)
    if not target_role:
        target_score = 0.0
    else:
        target_role_words = [w.lower() for w in re.findall(r"\b[a-zA-Z]{3,}\b", target_role)]
        body_words = set(re.findall(r"\b[a-zA-Z]{3,}\b", " ".join(full_text_parts).lower()))
        matching_words = [w for w in target_role_words if w in body_words]
        if matching_words:
            target_score = 5.0
        else:
            target_score = 1.0  # Role specified but zero keyword alignment

    raw_total = (
        contact_score +
        sections_score +
        exp_quality_score +
        proj_quality_score +
        skills_score +
        writing_score +
        metric_score +
        target_score
    )

    total_score = int(round(raw_total))
    completeness_score = max(0, min(100, total_score))

    missing_signals: list[str] = []
    if not has_phone:
        missing_signals.append("Missing contact phone number")
    if not has_contact_link:
        missing_signals.append("Missing LinkedIn or GitHub profile link")
    if not has_summary:
        missing_signals.append("Missing summary statement")
    if experience_count == 0:
        missing_signals.append("No work experience entries recorded")
    if education_count == 0:
        missing_signals.append("No education entries recorded")
    if skill_count == 0:
        missing_signals.append("No technical or soft skills listed")
    if not target_role:
        missing_signals.append("Target role not specified")
    if total_bullets > 0 and meaningful_metric_bullets_count == 0:
        missing_signals.append("Bullet points lack quantifiable metrics (percentages, numbers, or impact)")

    return {
        "completeness_score": completeness_score,
        "has_target_role": bool(target_role),
        "has_job_description": bool(job_description),
        "has_linkedin": has_linkedin,
        "has_github": has_github,
        "has_website": has_website,
        "has_phone": has_phone,
        "has_summary": has_summary,
        "experience_count": experience_count,
        "education_count": education_count,
        "project_count": project_count,
        "skill_count": skill_count,
        "total_bullets": total_bullets,
        "metric_bullets_count": meaningful_metric_bullets_count,
        "generic_number_bullets_count": generic_number_bullets_count,
        "action_verbs_count": action_verbs_count,
        "missing_signals": missing_signals,
    }


DETERMINISTIC_FEEDBACK_MAP: dict[str, dict[str, str]] = {
    "Missing contact phone number": {
        "weakness": "Contact phone number is missing from your resume header.",
        "recommendation": "Add a reachable contact phone number to your header.",
    },
    "Missing LinkedIn or GitHub profile link": {
        "weakness": "Professional profile links (LinkedIn or GitHub) are missing.",
        "recommendation": "Include LinkedIn and GitHub profile links to make your professional work easier to verify.",
    },
    "Missing summary statement": {
        "weakness": "Professional summary statement is missing.",
        "recommendation": "Add a concise professional summary highlighting your career focus, key technical domain, and major achievements.",
    },
    "No work experience entries recorded": {
        "weakness": "Work experience section is empty or missing.",
        "recommendation": "Add relevant work history with targeted bullet points describing your technical responsibilities and accomplishments.",
    },
    "No education entries recorded": {
        "weakness": "Education section is empty or missing.",
        "recommendation": "Include your formal degree, field of study, and academic institution in the education section.",
    },
    "No technical or soft skills listed": {
        "weakness": "Technical and soft skills are missing.",
        "recommendation": "List your key technical skills, languages, frameworks, and tools to improve keyword matching.",
    },
    "Target role not specified": {
        "weakness": "Target role is not specified for this resume.",
        "recommendation": "Specify a target role to align your resume content and keywords with your target job.",
    },
    "Bullet points lack quantifiable metrics (percentages, numbers, or impact)": {
        "weakness": "Work experience bullet points lack quantifiable metrics and measurable outcomes.",
        "recommendation": "Enhance bullet points with concrete metrics (e.g., percentages, team sizes, dollar amounts, performance gains).",
    },
}


def get_deterministic_resume_feedback(missing_signals: list[str]) -> tuple[list[str], list[str]]:
    """Maps deterministic missing quality signals to authoritative weaknesses and recommendations."""
    weaknesses: list[str] = []
    recommendations: list[str] = []
    for signal in missing_signals:
        mapping = DETERMINISTIC_FEEDBACK_MAP.get(signal)
        if mapping:
            weaknesses.append(mapping["weakness"])
            recommendations.append(mapping["recommendation"])
    return weaknesses, recommendations


def generate_deterministic_resume_feedback(user: Any, resume: Any, signals: dict[str, Any] | None = None) -> dict[str, list[str]]:
    """
    Generates 100% deterministic, evidence-based qualitative review feedback (strengths, weaknesses, recommendations)
    derived directly from observable resume quality signals without calling external LLM services.
    """
    if signals is None:
        signals = evaluate_deterministic_resume_quality_signals(user, resume)

    completeness_score = signals.get("completeness_score", 0)
    missing_signals = signals.get("missing_signals", [])
    has_target_role = signals.get("has_target_role", False)
    target_role = resume.target_role.strip() if resume.target_role else ""

    det_weaknesses, det_recommendations = get_deterministic_resume_feedback(missing_signals)
    strengths: list[str] = []
    weaknesses: list[str] = list(det_weaknesses)
    recommendations: list[str] = list(det_recommendations)

    # 1. Positive Evidence Strengths
    if completeness_score >= 80:
        strengths.append("Comprehensive document structure with complete contact information and professional identity links.")
    if signals.get("metric_bullets_count", 0) >= 2:
        strengths.append("Strong demonstration of quantifiable impact featuring measurable achievement metrics (% or $ figures).")
    elif signals.get("metric_bullets_count", 0) == 1:
        strengths.append("Includes quantifiable metrics demonstrating measurable technical impact.")

    if signals.get("action_verbs_count", 0) >= 3:
        strengths.append("Effective bullet point writing utilizing strong technical action verbs (e.g. Architected, Engineered, Spearheaded).")

    if signals.get("skill_count", 0) >= 8 and signals.get("completeness_score", 0) >= 50:
        strengths.append("Broad technical skill set verified directly within project and work experience descriptions.")
    elif signals.get("skill_count", 0) >= 4:
        strengths.append("Good baseline coverage of relevant technical tools and languages.")

    if has_target_role and signals.get("completeness_score", 0) >= 60:
        target_role_words = [w.lower() for w in re.findall(r"\b[a-zA-Z]{3,}\b", target_role)]
        if target_role_words:
            strengths.append(f"Resume content demonstrates clear alignment with core requirements for '{target_role}'.")

    if not strengths:
        if signals.get("experience_count", 0) > 0:
            strengths.append("Includes structured work experience entries.")
        elif signals.get("project_count", 0) > 0:
            strengths.append("Includes project implementation experience.")
        elif signals.get("has_summary", False):
            strengths.append("Includes an initial professional summary statement.")
        else:
            strengths.append("Document created successfully in CareerOS.")

    # 2. Granular Content Quality Weaknesses & Recommendations
    if signals.get("total_bullets", 0) > 0 and signals.get("action_verbs_count", 0) == 0:
        w = "Bullet points rely on passive wording rather than strong technical action verbs."
        r = "Begin work experience bullet points with strong technical action verbs (e.g. Architected, Engineered, Spearheaded, Automated)."
        if w not in weaknesses:
            weaknesses.append(w)
            recommendations.append(r)

    if signals.get("skill_count", 0) >= 8 and signals.get("completeness_score", 0) < 40:
        w = "Technical skills are listed in bulk without sufficient supporting evidence in experience bullet points."
        r = "Integrate your listed technical skills into project descriptions and work experience bullet points to demonstrate practical application."
        if w not in weaknesses:
            weaknesses.append(w)
            recommendations.append(r)

    if has_target_role and signals.get("completeness_score", 0) < 50:
        w = f"Resume body text lacks core keywords matching your target role of '{target_role}'."
        r = f"Integrate key technical terms associated with '{target_role}' throughout your summary and experience bullet points."
        if w not in weaknesses:
            weaknesses.append(w)
            recommendations.append(r)

    return {
        "strengths": strengths,
        "weaknesses": weaknesses,
        "recommendations": recommendations,
    }


def merge_feedback_items(deterministic_items: list[str], llm_items: list[str]) -> list[str]:
    """
    Merges deterministic factual feedback with LLM qualitative feedback.
    Preserves deterministic feedback first.
    Appends unique LLM feedback, filtering out exact duplicates or near-duplicate phrasings.
    """
    merged: list[str] = list(deterministic_items)
    normalized_merged = {item.strip().lower() for item in merged}

    def normalize_for_comparison(text: str) -> str:
        return re.sub(r"[^\w\s]", "", text.strip().lower())

    norm_merged_texts = [normalize_for_comparison(item) for item in merged]

    for llm_item in llm_items:
        clean_llm = llm_item.strip()
        if not clean_llm:
            continue
        norm_llm = normalize_for_comparison(clean_llm)

        # 1. Check exact / normalized string match
        if clean_llm.lower() in normalized_merged or norm_llm in norm_merged_texts:
            continue

        # 2. Check near-duplicate key phrase overlap with deterministic items
        is_near_duplicate = False
        for det_text in norm_merged_texts:
            for key_term in ["linkedin", "github", "phone number", "summary statement", "work experience section", "education section", "target role"]:
                if key_term in det_text and key_term in norm_llm:
                    is_near_duplicate = True
                    break
            if is_near_duplicate:
                break

        if not is_near_duplicate:
            merged.append(clean_llm)
            normalized_merged.add(clean_llm.lower())
            norm_merged_texts.append(norm_llm)

    return merged

