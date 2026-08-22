from __future__ import annotations

from rest_framework.permissions import BasePermission


class IsResumeSectionOwner(BasePermission):
    message = "You do not have permission to access this resume section."

    def has_object_permission(self, request, view, obj) -> bool:
        user = getattr(request, "user", None)
        return bool(user and user.is_authenticated and obj.resume.career_profile.user_id == user.id)


class IsResumeSectionItemOwner(BasePermission):
    message = "You do not have permission to access this resume section item."

    def has_object_permission(self, request, view, obj) -> bool:
        user = getattr(request, "user", None)
        return bool(user and user.is_authenticated and obj.resume_section.resume.career_profile.user_id == user.id)

