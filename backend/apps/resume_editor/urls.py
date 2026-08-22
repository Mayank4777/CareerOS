from __future__ import annotations

from django.urls import path

from .views import (
    ResumeSectionDetailAPIView,
    ResumeSectionItemDetailAPIView,
    ResumeSectionItemListAPIView,
    ResumeSectionListAPIView,
)

app_name = "resume_editor"

urlpatterns = [
    path("<uuid:resume_id>/sections/", ResumeSectionListAPIView.as_view(), name="resume-section-list"),
    path("sections/<uuid:resume_section_id>/", ResumeSectionDetailAPIView.as_view(), name="resume-section-detail"),
    path("sections/<uuid:resume_section_id>/items/", ResumeSectionItemListAPIView.as_view(), name="resume-section-item-list"),
    path("items/<uuid:resume_section_item_id>/", ResumeSectionItemDetailAPIView.as_view(), name="resume-section-item-detail"),
]

