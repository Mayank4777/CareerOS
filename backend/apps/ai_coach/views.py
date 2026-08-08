from __future__ import annotations

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.common.responses import error_response, success_response

from .exceptions import OllamaError
from .serializers import (
    AIChatSerializer,
    AIHistorySerializer,
    CareerAdviceSerializer,
    CoverLetterRequestSerializer,
    JobMatchSerializer,
    SkillGapSerializer,
)
from .services import AICoachService


class AIChatAPIView(APIView):
    """Generic AI Chat API endpoint powered by local Ollama."""

    permission_classes = [IsAuthenticated]
    serializer_class = AIChatSerializer
    service_class = AICoachService

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        feature = serializer.validated_data["feature"]
        prompt = serializer.validated_data["prompt"]

        service = self.service_class()

        try:
            result = service.chat(user=request.user, feature=feature, prompt=prompt)
            return success_response(
                message="AI response generated successfully.",
                data=result,
            )
        except OllamaError as exc:
            return error_response(
                message=exc.message,
                status_code=exc.status_code,
            )
        except Exception as exc:
            return error_response(
                message=f"An unexpected error occurred while processing AI request: {exc}",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class CoverLetterAPIView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CoverLetterRequestSerializer
    service_class = AICoachService

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        service = self.service_class()
        try:
            result = service.generate_cover_letter(
                user=request.user,
                company_name=serializer.validated_data["company_name"],
                job_title=serializer.validated_data["job_title"],
                job_description=serializer.validated_data.get("job_description", ""),
                tone=serializer.validated_data.get("tone", "professional"),
            )
            return success_response(
                message="Cover letter generated successfully.",
                data=result,
            )
        except OllamaError as exc:
            return error_response(message=exc.message, status_code=exc.status_code)


class SkillGapAPIView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SkillGapSerializer
    service_class = AICoachService

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        service = self.service_class()
        try:
            result = service.analyze_skill_gap(
                user=request.user,
                target_role=serializer.validated_data["target_role"],
                required_skills=serializer.validated_data.get("required_skills", []),
            )
            return success_response(
                message="Skill gap analysis complete.",
                data=result,
            )
        except OllamaError as exc:
            return error_response(message=exc.message, status_code=exc.status_code)


class CareerAdviceAPIView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CareerAdviceSerializer
    service_class = AICoachService

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        service = self.service_class()
        try:
            result = service.get_career_advice(
                user=request.user,
                target_role=serializer.validated_data.get("target_role", ""),
                industry=serializer.validated_data.get("industry", ""),
            )
            return success_response(
                message="Career recommendations generated.",
                data=result,
            )
        except OllamaError as exc:
            return error_response(message=exc.message, status_code=exc.status_code)


class JobMatchAPIView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = JobMatchSerializer
    service_class = AICoachService

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        service = self.service_class()
        try:
            result = service.get_job_match(
                user=request.user,
                job_title=serializer.validated_data["job_title"],
                company_name=serializer.validated_data["company_name"],
                job_description=serializer.validated_data.get("job_description", ""),
            )
            return success_response(
                message="Job match calculation complete.",
                data=result,
            )
        except OllamaError as exc:
            return error_response(message=exc.message, status_code=exc.status_code)


class AIHistoryAPIView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AIHistorySerializer
    service_class = AICoachService

    def get(self, request, *args, **kwargs):
        service = self.service_class()
        history = service.get_history(user=request.user)
        return success_response(
            message="AI usage history retrieved.",
            data=self.serializer_class(history, many=True).data,
        )
