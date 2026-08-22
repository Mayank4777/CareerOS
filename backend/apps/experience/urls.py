from __future__ import annotations

from django.urls import path

from .views import ExperienceDetailAPIView, ExperienceListAPIView

app_name = "experience"

urlpatterns = [
    path("", ExperienceListAPIView.as_view(), name="experience-list"),
    path("<uuid:experience_id>/", ExperienceDetailAPIView.as_view(), name="experience-detail"),
]
