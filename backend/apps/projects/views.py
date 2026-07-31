from __future__ import annotations

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.common.responses import created_response, success_response

from .permissions import IsProjectOwner
from .serializers import ProjectSerializer
from .services import ProjectService


class ProjectListAPIView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProjectSerializer
    service_class = ProjectService

    def _service(self) -> ProjectService:
        return self.service_class()

    def get(self, request, *args, **kwargs):
        projects = self._service().list_projects(user=request.user)
        return success_response(
            message="Project records fetched successfully.",
            data=self.serializer_class(projects, many=True).data,
        )

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        project = self._service().create_project(user=request.user, data=serializer.validated_data)
        return created_response(
            message="Project created successfully.",
            data=self.serializer_class(project).data,
        )


class ProjectDetailAPIView(APIView):
    permission_classes = [IsAuthenticated, IsProjectOwner]
    serializer_class = ProjectSerializer
    service_class = ProjectService

    def _service(self) -> ProjectService:
        return self.service_class()

    def _get_project(self, request, project_id):
        project = self._service().retrieve_project(user=request.user, project_id=project_id)
        self.check_object_permissions(request, project)
        return project

    def get(self, request, project_id, *args, **kwargs):
        project = self._get_project(request, project_id)
        return success_response(
            message="Project fetched successfully.",
            data=self.serializer_class(project).data,
        )

    def patch(self, request, project_id, *args, **kwargs):
        project = self._get_project(request, project_id)
        serializer = self.serializer_class(project, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        project = self._service().update_project(
            user=request.user,
            project_id=project_id,
            data=serializer.validated_data,
        )
        return success_response(
            message="Project updated successfully.",
            data=self.serializer_class(project).data,
            status_code=status.HTTP_200_OK,
        )

    def delete(self, request, project_id, *args, **kwargs):
        project = self._get_project(request, project_id)
        self._service().delete_project(user=request.user, project_id=project.id)
        return success_response(
            message="Project deleted successfully.",
            status_code=status.HTTP_200_OK,
        )
