from __future__ import annotations

from django.urls import path

from .views import ChangePasswordAPIView, UserSettingsAPIView

urlpatterns = [
    path("", UserSettingsAPIView.as_view(), name="user_settings"),
    path("change-password/", ChangePasswordAPIView.as_view(), name="change_password"),
]
