from __future__ import annotations

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.common.responses import created_response, success_response

from .permissions import IsVolunteerExperienceOwner
from .serializers import VolunteerExperienceSerializer
from .services import VolunteerExperienceService


class VolunteerExperienceListAPIView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = VolunteerExperienceSerializer
    service_class = VolunteerExperienceService

    def _service(self) -> VolunteerExperienceService:
        return self.service_class()

    def get(self, request, *args, **kwargs):
        records = self._service().list_volunteer_experiences(user=request.user)
        return success_response(
            message="Volunteer experience records fetched successfully.",
            data=self.serializer_class(records, many=True).data,
        )

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        record = self._service().create_volunteer_experience(user=request.user, data=serializer.validated_data)
        return created_response(
            message="Volunteer experience created successfully.",
            data=self.serializer_class(record).data,
        )


class VolunteerExperienceDetailAPIView(APIView):
    permission_classes = [IsAuthenticated, IsVolunteerExperienceOwner]
    serializer_class = VolunteerExperienceSerializer
    service_class = VolunteerExperienceService

    def _service(self) -> VolunteerExperienceService:
        return self.service_class()

    def _get_record(self, request, volunteer_experience_id):
        record = self._service().retrieve_volunteer_experience(
            user=request.user,
            volunteer_experience_id=volunteer_experience_id,
        )
        self.check_object_permissions(request, record)
        return record

    def get(self, request, volunteer_experience_id, *args, **kwargs):
        record = self._get_record(request, volunteer_experience_id)
        return success_response(
            message="Volunteer experience fetched successfully.",
            data=self.serializer_class(record).data,
        )

    def patch(self, request, volunteer_experience_id, *args, **kwargs):
        record = self._get_record(request, volunteer_experience_id)
        serializer = self.serializer_class(record, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        record = self._service().update_volunteer_experience(
            user=request.user,
            volunteer_experience_id=volunteer_experience_id,
            data=serializer.validated_data,
        )
        return success_response(
            message="Volunteer experience updated successfully.",
            data=self.serializer_class(record).data,
            status_code=status.HTTP_200_OK,
        )

    def delete(self, request, volunteer_experience_id, *args, **kwargs):
        record = self._get_record(request, volunteer_experience_id)
        self._service().delete_volunteer_experience(user=request.user, volunteer_experience_id=record.id)
        return success_response(
            message="Volunteer experience deleted successfully.",
            status_code=status.HTTP_200_OK,
        )
