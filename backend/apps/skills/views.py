from __future__ import annotations

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.common.responses import created_response, success_response

from .permissions import IsSkillOwner
from .serializers import SkillSerializer
from .services import SkillService


class SkillListAPIView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SkillSerializer
    service_class = SkillService

    def _service(self) -> SkillService:
        return self.service_class()

    def get(self, request, *args, **kwargs):
        skills = self._service().list_skills(user=request.user)
        return success_response(
            message="Skill records fetched successfully.",
            data=self.serializer_class(skills, many=True).data,
        )

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        skill = self._service().create_skill(
            user=request.user,
            data=serializer.validated_data,
        )
        return created_response(
            message="Skill created successfully.",
            data=self.serializer_class(skill).data,
        )


class SkillDetailAPIView(APIView):
    permission_classes = [IsAuthenticated, IsSkillOwner]
    serializer_class = SkillSerializer
    service_class = SkillService

    def _service(self) -> SkillService:
        return self.service_class()

    def _get_skill(self, request, skill_id):
        skill = self._service().retrieve_skill(user=request.user, skill_id=skill_id)
        self.check_object_permissions(request, skill)
        return skill

    def get(self, request, skill_id, *args, **kwargs):
        skill = self._get_skill(request, skill_id)
        return success_response(
            message="Skill fetched successfully.",
            data=self.serializer_class(skill).data,
        )

    def patch(self, request, skill_id, *args, **kwargs):
        skill = self._get_skill(request, skill_id)
        serializer = self.serializer_class(skill, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        skill = self._service().update_skill(
            user=request.user,
            skill_id=skill_id,
            data=serializer.validated_data,
        )
        return success_response(
            message="Skill updated successfully.",
            data=self.serializer_class(skill).data,
            status_code=status.HTTP_200_OK,
        )

    def delete(self, request, skill_id, *args, **kwargs):
        skill = self._get_skill(request, skill_id)
        self._service().delete_skill(user=request.user, skill_id=skill.id)
        return success_response(
            message="Skill deleted successfully.",
            status_code=status.HTTP_200_OK,
        )
