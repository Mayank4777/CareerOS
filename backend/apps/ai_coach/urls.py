from __future__ import annotations

from django.urls import path

from .views import (
    AIChatAPIView,
    AIHistoryAPIView,
    CareerAdviceAPIView,
    CareerRoadmapDetailAPIView,
    CareerRoadmapGenerateAPIView,
    CareerRoadmapListCreateAPIView,
    CoverLetterAPIView,
    JobMatchAPIView,
    ResumeReviewAPIView,
    RoadmapPhaseDetailAPIView,
    RoadmapPhaseListCreateAPIView,
    SkillGapAnalysisAPIView,
    SkillGapAPIView,
)

urlpatterns = [
    path("chat/", AIChatAPIView.as_view(), name="ai_chat"),
    path("cover-letter/", CoverLetterAPIView.as_view(), name="ai_cover_letter"),
    path("skill-gap/", SkillGapAnalysisAPIView.as_view(), name="ai_skill_gap"),
    path("career-advice/", CareerAdviceAPIView.as_view(), name="ai_career_advice"),
    path("job-match/", JobMatchAPIView.as_view(), name="ai_job_match"),
    path("resume-review/", ResumeReviewAPIView.as_view(), name="ai_resume_review"),
    path("history/", AIHistoryAPIView.as_view(), name="ai_history"),
    path("roadmap/", CareerRoadmapListCreateAPIView.as_view(), name="ai_roadmap_list_create"),
    path("roadmap/generate/", CareerRoadmapGenerateAPIView.as_view(), name="ai_roadmap_generate"),
    path("roadmap/<uuid:roadmap_id>/", CareerRoadmapDetailAPIView.as_view(), name="ai_roadmap_detail"),
    path("roadmap/<uuid:roadmap_id>/phases/", RoadmapPhaseListCreateAPIView.as_view(), name="ai_roadmap_phase_list_create"),
    path("roadmap/<uuid:roadmap_id>/phases/<uuid:phase_id>/", RoadmapPhaseDetailAPIView.as_view(), name="ai_roadmap_phase_detail"),
]
