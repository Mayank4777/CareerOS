from __future__ import annotations

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.common.responses import success_response

from .permissions import IsNotificationOwner
from .serializers import NotificationSerializer
from .services import NotificationService


class NotificationListAPIView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer
    service_class = NotificationService

    def get(self, request, *args, **kwargs):
        service = self.service_class()
        notifications = service.list_notifications(user=request.user)
        return success_response(
            message="Notifications fetched successfully.",
            data=self.serializer_class(notifications, many=True).data,
        )


class NotificationMarkReadAPIView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer
    service_class = NotificationService

    def patch(self, request, notification_id, *args, **kwargs):
        service = self.service_class()
        notification = service.mark_as_read(user=request.user, notification_id=notification_id)
        return success_response(
            message="Notification marked as read.",
            data=self.serializer_class(notification).data,
        )


class NotificationMarkAllReadAPIView(APIView):
    permission_classes = [IsAuthenticated]
    service_class = NotificationService

    def patch(self, request, *args, **kwargs):
        service = self.service_class()
        updated_count = service.mark_all_as_read(user=request.user)
        return success_response(
            message=f"{updated_count} notifications marked as read.",
            data={"updated_count": updated_count},
        )


class NotificationDetailAPIView(APIView):
    permission_classes = [IsAuthenticated, IsNotificationOwner]
    service_class = NotificationService

    def delete(self, request, notification_id, *args, **kwargs):
        service = self.service_class()
        service.delete_notification(user=request.user, notification_id=notification_id)
        return success_response(
            message="Notification deleted successfully.",
            status_code=status.HTTP_200_OK,
        )
