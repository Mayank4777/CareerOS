from __future__ import annotations

from rest_framework.permissions import BasePermission


class IsCertificationOwner(BasePermission):
    message = "You do not have permission to access this certification."

    def has_object_permission(self, request, view, obj) -> bool:
        user = getattr(request, "user", None)
        return bool(user and user.is_authenticated and obj.career_profile.user_id == user.id)
