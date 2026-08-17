from __future__ import annotations

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.common.responses import created_response, error_response, success_response
from apps.jobs.models import SavedJob
from apps.jobs.roadmap import CareerRoadmapGenerator


from ai.parsers import AIResponseParsingError
from ai.providers.base import AIProviderError

from .exceptions import OllamaError
from .models import CareerRoadmap, RoadmapPhase
from .serializers import (
    AIChatSerializer,
    AIHistorySerializer,
    CareerAdviceSerializer,
    CareerRoadmapSerializer,
    CoverLetterRequestSerializer,
    JobMatchResponseSerializer,
    JobMatchSerializer,
    ResumeReviewRequestSerializer,
    ResumeReviewResponseSerializer,
    RoadmapPhaseSerializer,
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


class CareerRoadmapListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CareerRoadmapSerializer

    def get(self, request, *args, **kwargs):
        roadmaps = CareerRoadmap.objects.filter(career_profile__user=request.user)
        return success_response(
            message="Career roadmaps retrieved successfully.",
            data=self.serializer_class(roadmaps, many=True, context={"request": request}).data,
        )

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        roadmap = serializer.save()
        return created_response(
            message="Career roadmap created successfully.",
            data=self.serializer_class(roadmap, context={"request": request}).data,
        )


class CareerRoadmapDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CareerRoadmapSerializer

    def get_object(self, user, roadmap_id):
        try:
            return CareerRoadmap.objects.get(career_profile__user=user, id=roadmap_id)
        except (CareerRoadmap.DoesNotExist, ValueError):
            return None

    def get(self, request, roadmap_id, *args, **kwargs):
        roadmap = self.get_object(request.user, roadmap_id)
        if not roadmap:
            return error_response(message="Career roadmap not found.", status_code=status.HTTP_404_NOT_FOUND)
        return success_response(
            message="Career roadmap details retrieved successfully.",
            data=self.serializer_class(roadmap, context={"request": request}).data,
        )

    def patch(self, request, roadmap_id, *args, **kwargs):
        roadmap = self.get_object(request.user, roadmap_id)
        if not roadmap:
            return error_response(message="Career roadmap not found.", status_code=status.HTTP_404_NOT_FOUND)
        serializer = self.serializer_class(roadmap, data=request.data, partial=True, context={"request": request})
        serializer.is_valid(raise_exception=True)
        updated_roadmap = serializer.save()
        return success_response(
            message="Career roadmap updated successfully.",
            data=self.serializer_class(updated_roadmap, context={"request": request}).data,
        )

    def delete(self, request, roadmap_id, *args, **kwargs):
        roadmap = self.get_object(request.user, roadmap_id)
        if not roadmap:
            return error_response(message="Career roadmap not found.", status_code=status.HTTP_404_NOT_FOUND)
        roadmap.delete()
        return success_response(
            message="Career roadmap deleted successfully.",
            status_code=status.HTTP_200_OK,
        )


class RoadmapPhaseListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = RoadmapPhaseSerializer

    def post(self, request, roadmap_id, *args, **kwargs):
        try:
            roadmap = CareerRoadmap.objects.get(career_profile__user=request.user, id=roadmap_id)
        except (CareerRoadmap.DoesNotExist, ValueError):
            return error_response(message="Career roadmap not found.", status_code=status.HTTP_404_NOT_FOUND)

        serializer = self.serializer_class(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        phase = serializer.save(roadmap=roadmap)
        return created_response(
            message="Roadmap phase created successfully.",
            data=self.serializer_class(phase, context={"request": request}).data,
        )


class RoadmapPhaseDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = RoadmapPhaseSerializer

    def get_object(self, user, roadmap_id, phase_id):
        try:
            return RoadmapPhase.objects.get(
                roadmap__career_profile__user=user,
                roadmap_id=roadmap_id,
                id=phase_id,
            )
        except (RoadmapPhase.DoesNotExist, ValueError):
            return None

    def patch(self, request, roadmap_id, phase_id, *args, **kwargs):
        phase = self.get_object(request.user, roadmap_id, phase_id)
        if not phase:
            return error_response(message="Roadmap phase not found.", status_code=status.HTTP_404_NOT_FOUND)
        serializer = self.serializer_class(phase, data=request.data, partial=True, context={"request": request})
        serializer.is_valid(raise_exception=True)
        updated_phase = serializer.save()
        return success_response(
            message="Roadmap phase updated successfully.",
            data=self.serializer_class(updated_phase, context={"request": request}).data,
        )

    def delete(self, request, roadmap_id, phase_id, *args, **kwargs):
        phase = self.get_object(request.user, roadmap_id, phase_id)
        if not phase:
            return error_response(message="Roadmap phase not found.", status_code=status.HTTP_404_NOT_FOUND)
        phase.delete()
        return success_response(
            message="Roadmap phase deleted successfully.",
            status_code=status.HTTP_200_OK,
        )


class CareerRoadmapGenerateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CareerRoadmapSerializer

    def post(self, request, *args, **kwargs):
        job_id = request.data.get("job_id")
        if not job_id:
            return error_response(message="job_id is required.", status_code=status.HTTP_400_BAD_REQUEST)

        generator = CareerRoadmapGenerator()
        try:
            roadmap = generator.generate(user=request.user, job_id=str(job_id))
            return success_response(
                message="Career roadmap generated successfully.",
                data=self.serializer_class(roadmap, context={"request": request}).data,
            )
        except (SavedJob.DoesNotExist, ValueError):
            return error_response(message="Saved job not found.", status_code=status.HTTP_404_NOT_FOUND)
