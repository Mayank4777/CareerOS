from __future__ import annotations

from rest_framework.permissions import BasePermission


class IsCareerProfileOwner(BasePermission):
    message = "You do not have permission to access this career profile."

    def has_object_permission(self, request, view, obj) -> bool:
        user = getattr(request, "user", None)
        return bool(user and user.is_authenticated and obj.user_id == user.id)
