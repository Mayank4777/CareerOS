from __future__ import annotations

from django.urls import path

from .views import ReferenceDetailAPIView, ReferenceListAPIView

app_name = "references"

urlpatterns = [
    path("", ReferenceListAPIView.as_view(), name="reference-list"),
    path("<uuid:reference_id>/", ReferenceDetailAPIView.as_view(), name="reference-detail"),
]
