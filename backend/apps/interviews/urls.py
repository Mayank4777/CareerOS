from __future__ import annotations

from django.urls import path

from .views import InterviewDetailAPIView, InterviewListAPIView

urlpatterns = [
    path("", InterviewListAPIView.as_view(), name="interview_list"),
    path("<uuid:interview_id>/", InterviewDetailAPIView.as_view(), name="interview_detail"),
]
