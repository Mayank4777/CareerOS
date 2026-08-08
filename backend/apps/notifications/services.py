from __future__ import annotations

from .models import Notification
from .selectors import get_user_notifications


class NotificationService:
    def list_notifications(self, user):
        return get_user_notifications(user)

    def mark_as_read(self, user, notification_id) -> Notification:
        notification = Notification.objects.get(user=user, id=notification_id)
        notification.is_read = True
        notification.save()
        return notification

    def mark_all_as_read(self, user) -> int:
        return Notification.objects.filter(user=user, is_read=False).update(is_read=True)

    def delete_notification(self, user, notification_id) -> None:
        Notification.objects.filter(user=user, id=notification_id).delete()
