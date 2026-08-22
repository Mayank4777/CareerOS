from __future__ import annotations

from django.urls import path

from .views import CustomSectionDetailAPIView, CustomSectionListAPIView

app_name = "custom_sections"

urlpatterns = [
    path("", CustomSectionListAPIView.as_view(), name="custom-section-list"),
    path("<uuid:custom_section_id>/", CustomSectionDetailAPIView.as_view(), name="custom-section-detail"),
]
