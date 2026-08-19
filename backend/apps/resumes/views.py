from __future__ import annotations

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.common.responses import created_response, success_response

from .permissions import IsResumeOwner
from .serializers import (
    ApplySuggestionSerializer,
    ResumeGenerateSerializer,
    ResumeSerializer,
    ResumeVersionCreateSerializer,
    ResumeVersionSerializer,
)
from .services import ResumeService


class ResumeListAPIView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ResumeSerializer
    service_class = ResumeService

    def _service(self) -> ResumeService:
        return self.service_class()

    def get(self, request, *args, **kwargs):
        resumes = self._service().list_resumes(user=request.user)
        return success_response(
            message="Resume records fetched successfully.",
            data=self.serializer_class(resumes, many=True).data,
        )

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        resume = self._service().create_resume(
            user=request.user,
            data=serializer.validated_data,
        )
        return created_response(
            message="Resume created successfully.",
            data=self.serializer_class(resume).data,
        )


class ResumeGenerateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ResumeGenerateSerializer
    service_class = ResumeService

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        service = self.service_class()
        resume = service.generate_resume(user=request.user, data=serializer.validated_data)
        return created_response(
            message="Resume generated successfully from Career Profile.",
            data=ResumeSerializer(resume).data,
        )


class ResumeDetailAPIView(APIView):
    permission_classes = [IsAuthenticated, IsResumeOwner]
    serializer_class = ResumeSerializer
    service_class = ResumeService

    def _service(self) -> ResumeService:
        return self.service_class()

    def _get_resume(self, request, resume_id):
        resume = self._service().retrieve_resume(user=request.user, resume_id=resume_id)
        self.check_object_permissions(request, resume)
        return resume

    def get(self, request, resume_id, *args, **kwargs):
        resume = self._get_resume(request, resume_id)
        return success_response(
            message="Resume fetched successfully.",
            data=self.serializer_class(resume).data,
        )

    def patch(self, request, resume_id, *args, **kwargs):
        resume = self._get_resume(request, resume_id)
        serializer = self.serializer_class(resume, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        resume = self._service().update_resume(
            user=request.user,
            resume_id=resume_id,
            data=serializer.validated_data,
        )
        return success_response(
            message="Resume updated successfully.",
            data=self.serializer_class(resume).data,
            status_code=status.HTTP_200_OK,
        )

    def delete(self, request, resume_id, *args, **kwargs):
        resume = self._get_resume(request, resume_id)
        self._service().delete_resume(user=request.user, resume_id=resume.id)
        return success_response(
            message="Resume deleted successfully.",
            status_code=status.HTTP_200_OK,
        )


class ResumeApplySuggestionAPIView(APIView):
    permission_classes = [IsAuthenticated, IsResumeOwner]
    serializer_class = ApplySuggestionSerializer
    service_class = ResumeService

    def post(self, request, resume_id, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        service = self.service_class()
        resume = service.apply_suggestion(
            user=request.user,
            resume_id=resume_id,
            suggestion_data=serializer.validated_data,
        )
        return success_response(
            message="Suggestion applied to resume draft.",
            data=ResumeSerializer(resume).data,
        )


class ResumeVersionListAPIView(APIView):
    permission_classes = [IsAuthenticated, IsResumeOwner]
    service_class = ResumeService

    def get(self, request, resume_id, *args, **kwargs):
        service = self.service_class()
        versions = service.list_versions(user=request.user, resume_id=resume_id)
        return success_response(
            message="Resume versions fetched.",
            data=ResumeVersionSerializer(versions, many=True).data,
        )

    def post(self, request, resume_id, *args, **kwargs):
        serializer = ResumeVersionCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        service = self.service_class()
        version = service.create_version(
            user=request.user,
            resume_id=resume_id,
            data=serializer.validated_data,
        )
        return created_response(
            message="Resume snapshot saved.",
            data=ResumeVersionSerializer(version).data,
        )


class ResumeVersionRestoreAPIView(APIView):
    permission_classes = [IsAuthenticated, IsResumeOwner]
    service_class = ResumeService

    def post(self, request, resume_id, version_id, *args, **kwargs):
        service = self.service_class()
        resume = service.restore_version(
            user=request.user,
            resume_id=resume_id,
            version_id=version_id,
        )
        return success_response(
            message="Resume version restored successfully.",
            data=ResumeSerializer(resume).data,
        )


