from __future__ import annotations

from django.urls import path

from .views import LanguageDetailAPIView, LanguageListAPIView

app_name = "languages"

urlpatterns = [
    path("", LanguageListAPIView.as_view(), name="language-list"),
    path("<uuid:language_id>/", LanguageDetailAPIView.as_view(), name="language-detail"),
]
