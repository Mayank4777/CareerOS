from __future__ import annotations

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.common.responses import created_response, success_response

from .permissions import IsReferenceOwner
from .serializers import ReferenceSerializer
from .services import ReferenceService


class ReferenceListAPIView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ReferenceSerializer
    service_class = ReferenceService

    def _service(self) -> ReferenceService:
        return self.service_class()

    def get(self, request, *args, **kwargs):
        references = self._service().list_references(user=request.user)
        return success_response(
            message="Reference records fetched successfully.",
            data=self.serializer_class(references, many=True).data,
        )

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        reference = self._service().create_reference(user=request.user, data=serializer.validated_data)
        return created_response(
            message="Reference created successfully.",
            data=self.serializer_class(reference).data,
        )


class ReferenceDetailAPIView(APIView):
    permission_classes = [IsAuthenticated, IsReferenceOwner]
    serializer_class = ReferenceSerializer
    service_class = ReferenceService

    def _service(self) -> ReferenceService:
        return self.service_class()

    def _get_reference(self, request, reference_id):
        reference = self._service().retrieve_reference(user=request.user, reference_id=reference_id)
        self.check_object_permissions(request, reference)
        return reference

    def get(self, request, reference_id, *args, **kwargs):
        reference = self._get_reference(request, reference_id)
        return success_response(
            message="Reference fetched successfully.",
            data=self.serializer_class(reference).data,
        )

    def patch(self, request, reference_id, *args, **kwargs):
        reference = self._get_reference(request, reference_id)
        serializer = self.serializer_class(reference, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        reference = self._service().update_reference(
            user=request.user,
            reference_id=reference_id,
            data=serializer.validated_data,
        )
        return success_response(
            message="Reference updated successfully.",
            data=self.serializer_class(reference).data,
            status_code=status.HTTP_200_OK,
        )

    def delete(self, request, reference_id, *args, **kwargs):
        reference = self._get_reference(request, reference_id)
        self._service().delete_reference(user=request.user, reference_id=reference.id)
        return success_response(
            message="Reference deleted successfully.",
            status_code=status.HTTP_200_OK,
        )
