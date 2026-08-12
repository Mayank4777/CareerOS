from __future__ import annotations

from django.urls import path

from .views import (
    CareerProfileAPIView,
    DashboardIntelligenceAPIView,
    EducationDetailAPIView,
    EducationListAPIView,
)

app_name = "career_profile"

urlpatterns = [
    path("profile/", CareerProfileAPIView.as_view(), name="profile"),
    path("dashboard/intelligence/", DashboardIntelligenceAPIView.as_view(), name="dashboard-intelligence"),
    path("education/", EducationListAPIView.as_view(), name="education-list"),
    path("education/<uuid:education_id>/", EducationDetailAPIView.as_view(), name="education-detail"),
]

