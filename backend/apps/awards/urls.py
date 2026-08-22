from __future__ import annotations

from django.urls import path

from .views import AwardDetailAPIView, AwardListAPIView

app_name = "awards"

urlpatterns = [
    path("", AwardListAPIView.as_view(), name="award-list"),
    path("<uuid:award_id>/", AwardDetailAPIView.as_view(), name="award-detail"),
]
