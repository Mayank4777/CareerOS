from __future__ import annotations

from django.db import models
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.common.responses import created_response, success_response

from .permissions import IsApplicationOwner
from .serializers import ApplicationSerializer
from .services import ApplicationService


class ApplicationListAPIView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ApplicationSerializer
    service_class = ApplicationService

    def get(self, request, *args, **kwargs):
        service = self.service_class()
        apps = service.list_applications(user=request.user)
        search_query = request.query_params.get("search", "").strip()
        if search_query:
            apps = apps.filter(
                models.Q(company__icontains=search_query)
                | models.Q(position__icontains=search_query)
            )
        status_filter = request.query_params.get("status", "").strip()
        if status_filter:
            apps = apps.filter(status=status_filter)
        return success_response(
            message="Applications fetched successfully.",
            data=self.serializer_class(apps, many=True).data,
        )

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        service = self.service_class()
        app = service.create_application(
            user=request.user,
            data=serializer.validated_data,
        )
        return created_response(
            message="Application created successfully.",
            data=self.serializer_class(app).data,
        )


class ApplicationDetailAPIView(APIView):
    permission_classes = [IsAuthenticated, IsApplicationOwner]
    serializer_class = ApplicationSerializer
    service_class = ApplicationService

    def get(self, request, application_id, *args, **kwargs):
        service = self.service_class()
        app = service.retrieve_application(user=request.user, application_id=application_id)
        self.check_object_permissions(request, app)
        return success_response(
            message="Application details fetched successfully.",
            data=self.serializer_class(app).data,
        )

    def patch(self, request, application_id, *args, **kwargs):
        service = self.service_class()
        app = service.retrieve_application(user=request.user, application_id=application_id)
        self.check_object_permissions(request, app)
        serializer = self.serializer_class(app, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated_app = service.update_application(
            user=request.user,
            application_id=application_id,
            data=serializer.validated_data,
        )
        return success_response(
            message="Application updated successfully.",
            data=self.serializer_class(updated_app).data,
        )

    def delete(self, request, application_id, *args, **kwargs):
        service = self.service_class()
        app = service.retrieve_application(user=request.user, application_id=application_id)
        self.check_object_permissions(request, app)
        service.delete_application(user=request.user, application_id=application_id)
        return success_response(
            message="Application deleted successfully.",
            status_code=status.HTTP_200_OK,
        )
