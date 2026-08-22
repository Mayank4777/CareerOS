from __future__ import annotations

from .base import PromptTemplate, TestPromptTemplate
from .job_match import JobMatchPromptTemplate
from .resume_review import ResumeReviewPromptTemplate
from .skill_gap import SkillGapPromptTemplate

__all__ = [
    "PromptTemplate",
    "TestPromptTemplate",
    "JobMatchPromptTemplate",
    "ResumeReviewPromptTemplate",
    "SkillGapPromptTemplate",
]
