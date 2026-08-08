from __future__ import annotations

from django.urls import path

from .views import (
    NotificationDetailAPIView,
    NotificationListAPIView,
    NotificationMarkAllReadAPIView,
    NotificationMarkReadAPIView,
)

urlpatterns = [
    path("", NotificationListAPIView.as_view(), name="notification_list"),
    path("read-all/", NotificationMarkAllReadAPIView.as_view(), name="notification_read_all"),
    path("<uuid:notification_id>/read/", NotificationMarkReadAPIView.as_view(), name="notification_read"),
    path("<uuid:notification_id>/", NotificationDetailAPIView.as_view(), name="notification_detail"),
]
