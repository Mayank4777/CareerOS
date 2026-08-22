from __future__ import annotations

from django.urls import path

from .views import SavedJobDetailAPIView, SavedJobListAPIView

urlpatterns = [
    path("", SavedJobListAPIView.as_view(), name="saved_job_list"),
    path("<uuid:job_id>/", SavedJobDetailAPIView.as_view(), name="saved_job_detail"),
]
