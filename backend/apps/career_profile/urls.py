from __future__ import annotations

from django.urls import path

from .views import CareerProfileAPIView

app_name = "career_profile"

urlpatterns = [
    path("", CareerProfileAPIView.as_view(), name="profile"),
]
