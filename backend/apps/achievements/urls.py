from __future__ import annotations

from django.urls import path

from .views import AchievementDetailAPIView, AchievementListAPIView

app_name = "achievements"

urlpatterns = [
    path("", AchievementListAPIView.as_view(), name="achievement-list"),
    path("<uuid:achievement_id>/", AchievementDetailAPIView.as_view(), name="achievement-detail"),
]
