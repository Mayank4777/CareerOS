from __future__ import annotations

from django.db import models
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.common.responses import created_response, success_response

from .permissions import IsInterviewOwner
from .serializers import InterviewSerializer
from .services import InterviewService


class InterviewListAPIView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = InterviewSerializer
    service_class = InterviewService

    def get(self, request, *args, **kwargs):
        service = self.service_class()
        interviews = service.list_interviews(user=request.user)
        search_query = request.query_params.get("search", "").strip()
        if search_query:
            interviews = interviews.filter(
                models.Q(application__company__icontains=search_query)
                | models.Q(application__position__icontains=search_query)
                | models.Q(round__icontains=search_query)
            )
        status_filter = request.query_params.get("status", "").strip()
        if status_filter:
            interviews = interviews.filter(status=status_filter)
        return success_response(
            message="Interviews fetched successfully.",
            data=self.serializer_class(interviews, many=True).data,
        )

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        service = self.service_class()
        interview = service.create_interview(
            user=request.user,
            data=serializer.validated_data,
        )
        return created_response(
            message="Interview scheduled successfully.",
            data=self.serializer_class(interview).data,
        )


class InterviewDetailAPIView(APIView):
    permission_classes = [IsAuthenticated, IsInterviewOwner]
    serializer_class = InterviewSerializer
    service_class = InterviewService

    def get(self, request, interview_id, *args, **kwargs):
        service = self.service_class()
        interview = service.retrieve_interview(user=request.user, interview_id=interview_id)
        self.check_object_permissions(request, interview)
        return success_response(
            message="Interview details fetched successfully.",
            data=self.serializer_class(interview).data,
        )

    def patch(self, request, interview_id, *args, **kwargs):
        service = self.service_class()
        interview = service.retrieve_interview(user=request.user, interview_id=interview_id)
        self.check_object_permissions(request, interview)
        serializer = self.serializer_class(interview, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated_interview = service.update_interview(
            user=request.user,
            interview_id=interview_id,
            data=serializer.validated_data,
        )
        return success_response(
            message="Interview details updated successfully.",
            data=self.serializer_class(updated_interview).data,
        )

    def delete(self, request, interview_id, *args, **kwargs):
        service = self.service_class()
        interview = service.retrieve_interview(user=request.user, interview_id=interview_id)
        self.check_object_permissions(request, interview)
        service.delete_interview(user=request.user, interview_id=interview_id)
        return success_response(
            message="Interview deleted successfully.",
            status_code=status.HTTP_200_OK,
        )
