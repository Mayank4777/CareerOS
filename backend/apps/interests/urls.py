from __future__ import annotations

from django.urls import path

from .views import InterestDetailAPIView, InterestListAPIView

app_name = "interests"

urlpatterns = [
    path("", InterestListAPIView.as_view(), name="interest-list"),
    path("<uuid:interest_id>/", InterestDetailAPIView.as_view(), name="interest-detail"),
]
