from __future__ import annotations

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.common.responses import error_response, success_response

from ai.parsers import AIResponseParsingError
from ai.providers.base import AIProviderError

from apps.jobs.models import SavedJob
from .exceptions import OllamaError
from .serializers import (
    AIChatSerializer,
    AIHistorySerializer,
    CareerAdviceSerializer,
    CoverLetterRequestSerializer,
    JobMatchResponseSerializer,
    JobMatchSerializer,
    ResumeReviewRequestSerializer,
    ResumeReviewResponseSerializer,
    SkillGapJobRequestSerializer,
    SkillGapJobResponseSerializer,
    SkillGapSerializer,
)

from .services import AICoachService



class AIChatAPIView(APIView):
    """Generic AI Chat API endpoint powered by centralized AI Orchestrator."""

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
        except (AIProviderError, OllamaError) as exc:
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
        except (AIProviderError, OllamaError) as exc:
            return error_response(message=exc.message, status_code=exc.status_code)


class SkillGapAnalysisAPIView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SkillGapJobRequestSerializer
    service_class = AICoachService

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        service = self.service_class()
        try:
            result = service.analyze_job_skill_gap(
                user=request.user,
                job_id=str(serializer.validated_data["job_id"]),
            )
            response_serializer = SkillGapJobResponseSerializer(data=result)
            response_serializer.is_valid(raise_exception=True)
            return success_response(
                message="Contextual skill gap analysis complete.",
                data=response_serializer.data,
            )
        except (SavedJob.DoesNotExist, ValueError) as exc:
            return error_response(message="Saved job not found.", status_code=status.HTTP_404_NOT_FOUND)
        except (AIProviderError, OllamaError, AIResponseParsingError) as exc:
            return error_response(message=exc.message, status_code=getattr(exc, "status_code", status.HTTP_502_BAD_GATEWAY))


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
        except (AIProviderError, OllamaError) as exc:
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
        except (AIProviderError, OllamaError) as exc:
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
                job_id=str(serializer.validated_data["job_id"]),
                resume_id=str(serializer.validated_data["resume_id"]),
            )
            response_serializer = JobMatchResponseSerializer(data=result)
            response_serializer.is_valid(raise_exception=True)
            return success_response(
                message="Job match evaluation complete.",
                data=response_serializer.data,
            )
        except ValueError as exc:
            return error_response(message=str(exc), status_code=status.HTTP_404_NOT_FOUND)
        except (AIProviderError, OllamaError, AIResponseParsingError) as exc:
            return error_response(message=exc.message, status_code=getattr(exc, "status_code", status.HTTP_502_BAD_GATEWAY))


class ResumeReviewAPIView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ResumeReviewRequestSerializer
    service_class = AICoachService

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        service = self.service_class()
        try:
            result = service.review_resume(
                user=request.user,
                resume_id=str(serializer.validated_data["resume_id"]),
            )
            response_serializer = ResumeReviewResponseSerializer(data=result)
            response_serializer.is_valid(raise_exception=True)
            return success_response(
                message="Resume review evaluation complete.",
                data=response_serializer.data,
            )
        except ValueError as exc:
            return error_response(message=str(exc), status_code=status.HTTP_404_NOT_FOUND)
        except (AIProviderError, OllamaError, AIResponseParsingError) as exc:
            return error_response(message=exc.message, status_code=getattr(exc, "status_code", status.HTTP_502_BAD_GATEWAY))


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

