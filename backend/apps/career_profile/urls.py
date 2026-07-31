from __future__ import annotations

from django.urls import path

from .views import CareerProfileAPIView, EducationDetailAPIView, EducationListAPIView

app_name = "career_profile"

urlpatterns = [
    path("profile/", CareerProfileAPIView.as_view(), name="profile"),
    path("education/", EducationListAPIView.as_view(), name="education-list"),
    path("education/<uuid:education_id>/", EducationDetailAPIView.as_view(), name="education-detail"),
]
