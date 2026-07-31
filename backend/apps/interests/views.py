from __future__ import annotations

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.common.responses import created_response, success_response

from .permissions import IsInterestOwner
from .serializers import InterestSerializer
from .services import InterestService


class InterestListAPIView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = InterestSerializer
    service_class = InterestService

    def _service(self) -> InterestService:
        return self.service_class()

    def get(self, request, *args, **kwargs):
        interests = self._service().list_interests(user=request.user)
        return success_response(
            message="Interest records fetched successfully.",
            data=self.serializer_class(interests, many=True).data,
        )

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        interest = self._service().create_interest(user=request.user, data=serializer.validated_data)
        return created_response(
            message="Interest created successfully.",
            data=self.serializer_class(interest).data,
        )


class InterestDetailAPIView(APIView):
    permission_classes = [IsAuthenticated, IsInterestOwner]
    serializer_class = InterestSerializer
    service_class = InterestService

    def _service(self) -> InterestService:
        return self.service_class()

    def _get_interest(self, request, interest_id):
        interest = self._service().retrieve_interest(user=request.user, interest_id=interest_id)
        self.check_object_permissions(request, interest)
        return interest

    def get(self, request, interest_id, *args, **kwargs):
        interest = self._get_interest(request, interest_id)
        return success_response(
            message="Interest fetched successfully.",
            data=self.serializer_class(interest).data,
        )

    def patch(self, request, interest_id, *args, **kwargs):
        interest = self._get_interest(request, interest_id)
        serializer = self.serializer_class(interest, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        interest = self._service().update_interest(
            user=request.user,
            interest_id=interest_id,
            data=serializer.validated_data,
        )
        return success_response(
            message="Interest updated successfully.",
            data=self.serializer_class(interest).data,
            status_code=status.HTTP_200_OK,
        )

    def delete(self, request, interest_id, *args, **kwargs):
        interest = self._get_interest(request, interest_id)
        self._service().delete_interest(user=request.user, interest_id=interest.id)
        return success_response(
            message="Interest deleted successfully.",
            status_code=status.HTTP_200_OK,
        )
