from __future__ import annotations

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.common.responses import created_response, success_response

from .permissions import IsAwardOwner
from .serializers import AwardSerializer
from .services import AwardService


class AwardListAPIView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AwardSerializer
    service_class = AwardService

    def _service(self) -> AwardService:
        return self.service_class()

    def get(self, request, *args, **kwargs):
        awards = self._service().list_awards(user=request.user)
        return success_response(
            message="Award records fetched successfully.",
            data=self.serializer_class(awards, many=True).data,
        )

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        award = self._service().create_award(user=request.user, data=serializer.validated_data)
        return created_response(
            message="Award created successfully.",
            data=self.serializer_class(award).data,
        )


class AwardDetailAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAwardOwner]
    serializer_class = AwardSerializer
    service_class = AwardService

    def _service(self) -> AwardService:
        return self.service_class()

    def _get_award(self, request, award_id):
        award = self._service().retrieve_award(user=request.user, award_id=award_id)
        self.check_object_permissions(request, award)
        return award

    def get(self, request, award_id, *args, **kwargs):
        award = self._get_award(request, award_id)
        return success_response(
            message="Award fetched successfully.",
            data=self.serializer_class(award).data,
        )

    def patch(self, request, award_id, *args, **kwargs):
        award = self._get_award(request, award_id)
        serializer = self.serializer_class(award, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        award = self._service().update_award(user=request.user, award_id=award_id, data=serializer.validated_data)
        return success_response(
            message="Award updated successfully.",
            data=self.serializer_class(award).data,
            status_code=status.HTTP_200_OK,
        )

    def delete(self, request, award_id, *args, **kwargs):
        award = self._get_award(request, award_id)
        self._service().delete_award(user=request.user, award_id=award.id)
        return success_response(
            message="Award deleted successfully.",
            status_code=status.HTTP_200_OK,
        )
