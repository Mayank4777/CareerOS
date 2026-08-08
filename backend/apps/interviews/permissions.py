from __future__ import annotations

from rest_framework.permissions import BasePermission


class IsInterviewOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.application.career_profile.user == request.user
