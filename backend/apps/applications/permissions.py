from __future__ import annotations

from rest_framework.permissions import BasePermission


class IsApplicationOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.career_profile.user == request.user
