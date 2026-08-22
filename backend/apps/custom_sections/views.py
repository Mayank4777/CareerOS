from __future__ import annotations

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.common.responses import created_response, success_response

from .permissions import IsCustomSectionOwner
from .serializers import CustomSectionSerializer
from .services import CustomSectionService


class CustomSectionListAPIView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CustomSectionSerializer
    service_class = CustomSectionService

    def _service(self) -> CustomSectionService:
        return self.service_class()

    def get(self, request, *args, **kwargs):
        custom_sections = self._service().list_custom_sections(user=request.user)
        return success_response(
            message="Custom section records fetched successfully.",
            data=self.serializer_class(custom_sections, many=True).data,
        )

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        custom_section = self._service().create_custom_section(user=request.user, data=serializer.validated_data)
        return created_response(
            message="Custom section created successfully.",
            data=self.serializer_class(custom_section).data,
        )


class CustomSectionDetailAPIView(APIView):
    permission_classes = [IsAuthenticated, IsCustomSectionOwner]
    serializer_class = CustomSectionSerializer
    service_class = CustomSectionService

    def _service(self) -> CustomSectionService:
        return self.service_class()

    def _get_custom_section(self, request, custom_section_id):
        custom_section = self._service().retrieve_custom_section(
            user=request.user,
            custom_section_id=custom_section_id,
        )
        self.check_object_permissions(request, custom_section)
        return custom_section

    def get(self, request, custom_section_id, *args, **kwargs):
        custom_section = self._get_custom_section(request, custom_section_id)
        return success_response(
            message="Custom section fetched successfully.",
            data=self.serializer_class(custom_section).data,
        )

    def patch(self, request, custom_section_id, *args, **kwargs):
        custom_section = self._get_custom_section(request, custom_section_id)
        serializer = self.serializer_class(custom_section, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        custom_section = self._service().update_custom_section(
            user=request.user,
            custom_section_id=custom_section_id,
            data=serializer.validated_data,
        )
        return success_response(
            message="Custom section updated successfully.",
            data=self.serializer_class(custom_section).data,
            status_code=status.HTTP_200_OK,
        )

    def delete(self, request, custom_section_id, *args, **kwargs):
        custom_section = self._get_custom_section(request, custom_section_id)
        self._service().delete_custom_section(user=request.user, custom_section_id=custom_section.id)
        return success_response(
            message="Custom section deleted successfully.",
            status_code=status.HTTP_200_OK,
        )
