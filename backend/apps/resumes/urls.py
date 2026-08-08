from __future__ import annotations

from django.urls import path

from .views import ResumeDetailAPIView, ResumeListAPIView

app_name = "resumes"

urlpatterns = [
    path("", ResumeListAPIView.as_view(), name="resume-list"),
    path("<uuid:resume_id>/", ResumeDetailAPIView.as_view(), name="resume-detail"),
]

