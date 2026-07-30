from __future__ import annotations

from django.urls import path

from .views import LoginAPIView, MeAPIView, RegisterAPIView

app_name = "accounts"

urlpatterns = [
    path("register/", RegisterAPIView.as_view(), name="register"),
    path("login/", LoginAPIView.as_view(), name="login"),
    path("me/", MeAPIView.as_view(), name="me"),
]
