from __future__ import annotations

from django.urls import path

from .views import CertificationDetailAPIView, CertificationListAPIView

app_name = "certifications"

urlpatterns = [
    path("", CertificationListAPIView.as_view(), name="certification-list"),
    path("<uuid:certification_id>/", CertificationDetailAPIView.as_view(), name="certification-detail"),
]
