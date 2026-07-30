from __future__ import annotations

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.common.responses import created_response, success_response

from .permissions import IsCareerProfileOwner
from .serializers import CareerProfileSerializer
from .services import CareerProfileService


class CareerProfileAPIView(APIView):
    permission_classes = [IsAuthenticated, IsCareerProfileOwner]
    serializer_class = CareerProfileSerializer
    service_class = CareerProfileService

    def _service(self) -> CareerProfileService:
        return self.service_class()

    def get(self, request, *args, **kwargs):
        profile = self._service().retrieve_profile(user=request.user)
        self.check_object_permissions(request, profile)
        return success_response(
            message="Career profile fetched successfully.",
            data=self.serializer_class(profile).data,
        )

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        profile = self._service().create_profile(
            user=request.user,
            data=serializer.validated_data,
        )
        return created_response(
            message="Career profile created successfully.",
            data=self.serializer_class(profile).data,
        )

    def patch(self, request, *args, **kwargs):
        profile = self._service().retrieve_profile(user=request.user)
        self.check_object_permissions(request, profile)

        serializer = self.serializer_class(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        profile = self._service().update_profile(
            user=request.user,
            data=serializer.validated_data,
        )
        return success_response(
            message="Career profile updated successfully.",
            data=self.serializer_class(profile).data,
            status_code=status.HTTP_200_OK,
        )

    def delete(self, request, *args, **kwargs):
        profile = self._service().retrieve_profile(user=request.user)
        self.check_object_permissions(request, profile)
        self._service().delete_profile(user=request.user)
        return success_response(
            message="Career profile deleted successfully.",
            status_code=status.HTTP_200_OK,
        )
