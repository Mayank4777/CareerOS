from __future__ import annotations

from django.db import models
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.common.responses import created_response, success_response

from .permissions import IsJobOwner
from .serializers import SavedJobSerializer
from .services import JobService


class SavedJobListAPIView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SavedJobSerializer
    service_class = JobService

    def get(self, request, *args, **kwargs):
        service = self.service_class()
        jobs = service.list_saved_jobs(user=request.user)
        search_query = request.query_params.get("search", "").strip()
        if search_query:
            jobs = jobs.filter(
                models.Q(title__icontains=search_query)
                | models.Q(company__icontains=search_query)
            )
        status_filter = request.query_params.get("status", "").strip()
        if status_filter:
            jobs = jobs.filter(status=status_filter)
        return success_response(
            message="Saved jobs fetched successfully.",
            data=self.serializer_class(jobs, many=True).data,
        )

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        service = self.service_class()
        job = service.create_saved_job(
            user=request.user,
            data=serializer.validated_data,
        )
        return created_response(
            message="Job saved successfully.",
            data=self.serializer_class(job).data,
        )


class SavedJobDetailAPIView(APIView):
    permission_classes = [IsAuthenticated, IsJobOwner]
    serializer_class = SavedJobSerializer
    service_class = JobService

    def get(self, request, job_id, *args, **kwargs):
        service = self.service_class()
        job = service.retrieve_saved_job(user=request.user, job_id=job_id)
        self.check_object_permissions(request, job)
        return success_response(
            message="Job details fetched successfully.",
            data=self.serializer_class(job).data,
        )

    def patch(self, request, job_id, *args, **kwargs):
        service = self.service_class()
        job = service.retrieve_saved_job(user=request.user, job_id=job_id)
        self.check_object_permissions(request, job)
        serializer = self.serializer_class(job, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated_job = service.update_saved_job(
            user=request.user,
            job_id=job_id,
            data=serializer.validated_data,
        )
        return success_response(
            message="Saved job updated successfully.",
            data=self.serializer_class(updated_job).data,
        )

    def delete(self, request, job_id, *args, **kwargs):
        service = self.service_class()
        job = service.retrieve_saved_job(user=request.user, job_id=job_id)
        self.check_object_permissions(request, job)
        service.delete_saved_job(user=request.user, job_id=job_id)
        return success_response(
            message="Saved job deleted successfully.",
            status_code=status.HTTP_200_OK,
        )
