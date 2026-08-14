from __future__ import annotations

from django.urls import path

from .views import (
    AIChatAPIView,
    AIHistoryAPIView,
    CareerAdviceAPIView,
    CoverLetterAPIView,
    JobMatchAPIView,
    ResumeReviewAPIView,
    SkillGapAPIView,
)

urlpatterns = [
    path("chat/", AIChatAPIView.as_view(), name="ai_chat"),
    path("cover-letter/", CoverLetterAPIView.as_view(), name="ai_cover_letter"),
    path("skill-gap/", SkillGapAPIView.as_view(), name="ai_skill_gap"),
    path("career-advice/", CareerAdviceAPIView.as_view(), name="ai_career_advice"),
    path("job-match/", JobMatchAPIView.as_view(), name="ai_job_match"),
    path("resume-review/", ResumeReviewAPIView.as_view(), name="ai_resume_review"),
    path("history/", AIHistoryAPIView.as_view(), name="ai_history"),
]

