from __future__ import annotations

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.common.responses import created_response, success_response

from .permissions import IsResumeSectionItemOwner, IsResumeSectionOwner
from .serializers import ResumeSectionItemSerializer, ResumeSectionSerializer
from .services import ResumeSectionItemService, ResumeSectionService


class ResumeSectionListAPIView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ResumeSectionSerializer
    service_class = ResumeSectionService

    def _service(self) -> ResumeSectionService:
        return self.service_class()

    def get(self, request, resume_id, *args, **kwargs):
        resume_sections = self._service().list_resume_sections(user=request.user, resume_id=resume_id)
        return success_response(
            message="Resume section records fetched successfully.",
            data=self.serializer_class(resume_sections, many=True).data,
        )

    def post(self, request, resume_id, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        resume_section = self._service().create_resume_section(
            user=request.user,
            resume_id=resume_id,
            data=serializer.validated_data,
        )
        return created_response(
            message="Resume section created successfully.",
            data=self.serializer_class(resume_section).data,
        )


class ResumeSectionDetailAPIView(APIView):
    permission_classes = [IsAuthenticated, IsResumeSectionOwner]
    serializer_class = ResumeSectionSerializer
    service_class = ResumeSectionService

    def _service(self) -> ResumeSectionService:
        return self.service_class()

    def _get_resume_section(self, request, resume_section_id):
        resume_section = self._service().retrieve_resume_section(
            user=request.user,
            resume_section_id=resume_section_id,
        )
        self.check_object_permissions(request, resume_section)
        return resume_section

    def patch(self, request, resume_section_id, *args, **kwargs):
        resume_section = self._get_resume_section(request, resume_section_id)
        serializer = self.serializer_class(resume_section, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        resume_section = self._service().update_resume_section(
            user=request.user,
            resume_section_id=resume_section_id,
            data=serializer.validated_data,
        )
        return success_response(
            message="Resume section updated successfully.",
            data=self.serializer_class(resume_section).data,
            status_code=status.HTTP_200_OK,
        )

    def delete(self, request, resume_section_id, *args, **kwargs):
        resume_section = self._get_resume_section(request, resume_section_id)
        self._service().delete_resume_section(user=request.user, resume_section_id=resume_section.id)
        return success_response(
            message="Resume section deleted successfully.",
            status_code=status.HTTP_200_OK,
        )


class ResumeSectionItemListAPIView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ResumeSectionItemSerializer
    service_class = ResumeSectionItemService

    def _service(self) -> ResumeSectionItemService:
        return self.service_class()

    def get(self, request, resume_section_id, *args, **kwargs):
        resume_section_items = self._service().list_resume_section_items(
            user=request.user,
            resume_section_id=resume_section_id,
        )
        return success_response(
            message="Resume section item records fetched successfully.",
            data=self.serializer_class(resume_section_items, many=True).data,
        )

    def post(self, request, resume_section_id, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        resume_section_item = self._service().create_resume_section_item(
            user=request.user,
            resume_section_id=resume_section_id,
            data=serializer.validated_data,
        )
        return created_response(
            message="Resume section item created successfully.",
            data=self.serializer_class(resume_section_item).data,
        )


class ResumeSectionItemDetailAPIView(APIView):
    permission_classes = [IsAuthenticated, IsResumeSectionItemOwner]
    serializer_class = ResumeSectionItemSerializer
    service_class = ResumeSectionItemService

    def _service(self) -> ResumeSectionItemService:
        return self.service_class()

    def _get_resume_section_item(self, request, resume_section_item_id):
        resume_section_item = self._service().retrieve_resume_section_item(
            user=request.user,
            resume_section_item_id=resume_section_item_id,
        )
        self.check_object_permissions(request, resume_section_item)
        return resume_section_item

    def patch(self, request, resume_section_item_id, *args, **kwargs):
        resume_section_item = self._get_resume_section_item(request, resume_section_item_id)
        serializer = self.serializer_class(resume_section_item, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        resume_section_item = self._service().update_resume_section_item(
            user=request.user,
            resume_section_item_id=resume_section_item_id,
            data=serializer.validated_data,
        )
        return success_response(
            message="Resume section item updated successfully.",
            data=self.serializer_class(resume_section_item).data,
            status_code=status.HTTP_200_OK,
        )

    def delete(self, request, resume_section_item_id, *args, **kwargs):
        resume_section_item = self._get_resume_section_item(request, resume_section_item_id)
        self._service().delete_resume_section_item(
            user=request.user,
            resume_section_item_id=resume_section_item.id,
        )
        return success_response(
            message="Resume section item deleted successfully.",
            status_code=status.HTTP_200_OK,
        )

