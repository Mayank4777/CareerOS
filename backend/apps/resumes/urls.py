from __future__ import annotations

from django.urls import path

from .views import (
    ResumeApplySuggestionAPIView,
    ResumeDetailAPIView,
    ResumeGenerateAPIView,
    ResumeListAPIView,
    ResumeReviewAPIView,
    ResumeVersionListAPIView,
    ResumeVersionRestoreAPIView,
)

app_name = "resumes"

urlpatterns = [
    path("", ResumeListAPIView.as_view(), name="resume-list"),
    path("generate/", ResumeGenerateAPIView.as_view(), name="resume-generate"),
    path("<uuid:resume_id>/", ResumeDetailAPIView.as_view(), name="resume-detail"),
    path("<uuid:resume_id>/review/", ResumeReviewAPIView.as_view(), name="resume-review"),
    path("<uuid:resume_id>/apply-suggestion/", ResumeApplySuggestionAPIView.as_view(), name="resume-apply-suggestion"),
    path("<uuid:resume_id>/versions/", ResumeVersionListAPIView.as_view(), name="resume-version-list"),
    path("<uuid:resume_id>/versions/<uuid:version_id>/restore/", ResumeVersionRestoreAPIView.as_view(), name="resume-version-restore"),
]


