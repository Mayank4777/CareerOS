from __future__ import annotations

from django.urls import path

from .views import SkillDetailAPIView, SkillListAPIView

app_name = "skills"

urlpatterns = [
    path("", SkillListAPIView.as_view(), name="skill-list"),
    path("<uuid:skill_id>/", SkillDetailAPIView.as_view(), name="skill-detail"),
]
