from __future__ import annotations

from django.urls import path

from .views import ApplicationDetailAPIView, ApplicationListAPIView

urlpatterns = [
    path("", ApplicationListAPIView.as_view(), name="application_list"),
    path("<uuid:application_id>/", ApplicationDetailAPIView.as_view(), name="application_detail"),
]
