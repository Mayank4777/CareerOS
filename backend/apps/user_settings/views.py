from __future__ import annotations

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.common.responses import success_response

from .serializers import ChangePasswordSerializer, UserSettingsSerializer
from .services import UserSettingsService


class UserSettingsAPIView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSettingsSerializer
    service_class = UserSettingsService

    def get(self, request, *args, **kwargs):
        service = self.service_class()
        settings_obj = service.retrieve_settings(user=request.user)
        return success_response(
            message="User settings retrieved successfully.",
            data=self.serializer_class(settings_obj).data,
        )

    def patch(self, request, *args, **kwargs):
        service = self.service_class()
        settings_obj = service.retrieve_settings(user=request.user)
        serializer = self.serializer_class(settings_obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated_settings = service.update_settings(user=request.user, data=serializer.validated_data)
        return success_response(
            message="User settings updated successfully.",
            data=self.serializer_class(updated_settings).data,
        )


class ChangePasswordAPIView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ChangePasswordSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        if not user.check_password(serializer.validated_data["current_password"]):
            return success_response(
                message="Current password is incorrect.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        user.set_password(serializer.validated_data["new_password"])
        user.save()
        return success_response(
            message="Password changed successfully.",
        )
