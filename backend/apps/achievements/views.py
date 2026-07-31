from __future__ import annotations

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.common.responses import created_response, success_response

from .permissions import IsAchievementOwner
from .serializers import AchievementSerializer
from .services import AchievementService


class AchievementListAPIView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AchievementSerializer
    service_class = AchievementService

    def _service(self) -> AchievementService:
        return self.service_class()

    def get(self, request, *args, **kwargs):
        achievements = self._service().list_achievements(user=request.user)
        return success_response(
            message="Achievement records fetched successfully.",
            data=self.serializer_class(achievements, many=True).data,
        )

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        achievement = self._service().create_achievement(user=request.user, data=serializer.validated_data)
        return created_response(
            message="Achievement created successfully.",
            data=self.serializer_class(achievement).data,
        )


class AchievementDetailAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAchievementOwner]
    serializer_class = AchievementSerializer
    service_class = AchievementService

    def _service(self) -> AchievementService:
        return self.service_class()

    def _get_achievement(self, request, achievement_id):
        achievement = self._service().retrieve_achievement(user=request.user, achievement_id=achievement_id)
        self.check_object_permissions(request, achievement)
        return achievement

    def get(self, request, achievement_id, *args, **kwargs):
        achievement = self._get_achievement(request, achievement_id)
        return success_response(
            message="Achievement fetched successfully.",
            data=self.serializer_class(achievement).data,
        )

    def patch(self, request, achievement_id, *args, **kwargs):
        achievement = self._get_achievement(request, achievement_id)
        serializer = self.serializer_class(achievement, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        achievement = self._service().update_achievement(
            user=request.user,
            achievement_id=achievement_id,
            data=serializer.validated_data,
        )
        return success_response(
            message="Achievement updated successfully.",
            data=self.serializer_class(achievement).data,
            status_code=status.HTTP_200_OK,
        )

    def delete(self, request, achievement_id, *args, **kwargs):
        achievement = self._get_achievement(request, achievement_id)
        self._service().delete_achievement(user=request.user, achievement_id=achievement.id)
        return success_response(
            message="Achievement deleted successfully.",
            status_code=status.HTTP_200_OK,
        )
