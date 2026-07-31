from __future__ import annotations

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.common.responses import created_response, success_response

from .permissions import IsExperienceOwner
from .serializers import ExperienceSerializer
from .services import ExperienceService


class ExperienceListAPIView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ExperienceSerializer
    service_class = ExperienceService

    def _service(self) -> ExperienceService:
        return self.service_class()

    def get(self, request, *args, **kwargs):
        experiences = self._service().list_experiences(user=request.user)
        return success_response(
            message="Experience records fetched successfully.",
            data=self.serializer_class(experiences, many=True).data,
        )

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        experience = self._service().create_experience(
            user=request.user,
            data=serializer.validated_data,
        )
        return created_response(
            message="Experience created successfully.",
            data=self.serializer_class(experience).data,
        )


class ExperienceDetailAPIView(APIView):
    permission_classes = [IsAuthenticated, IsExperienceOwner]
    serializer_class = ExperienceSerializer
    service_class = ExperienceService

    def _service(self) -> ExperienceService:
        return self.service_class()

    def _get_experience(self, request, experience_id):
        experience = self._service().retrieve_experience(user=request.user, experience_id=experience_id)
        self.check_object_permissions(request, experience)
        return experience

    def get(self, request, experience_id, *args, **kwargs):
        experience = self._get_experience(request, experience_id)
        return success_response(
            message="Experience fetched successfully.",
            data=self.serializer_class(experience).data,
        )

    def patch(self, request, experience_id, *args, **kwargs):
        experience = self._get_experience(request, experience_id)
        serializer = self.serializer_class(experience, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        experience = self._service().update_experience(
            user=request.user,
            experience_id=experience_id,
            data=serializer.validated_data,
        )
        return success_response(
            message="Experience updated successfully.",
            data=self.serializer_class(experience).data,
            status_code=status.HTTP_200_OK,
        )

    def delete(self, request, experience_id, *args, **kwargs):
        experience = self._get_experience(request, experience_id)
        self._service().delete_experience(user=request.user, experience_id=experience.id)
        return success_response(
            message="Experience deleted successfully.",
            status_code=status.HTTP_200_OK,
        )
