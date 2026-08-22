from __future__ import annotations

from django.urls import path

from .views import PublicationDetailAPIView, PublicationListAPIView

app_name = "publications"

urlpatterns = [
    path("", PublicationListAPIView.as_view(), name="publication-list"),
    path("<uuid:publication_id>/", PublicationDetailAPIView.as_view(), name="publication-detail"),
]
