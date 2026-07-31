from __future__ import annotations

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.common.responses import created_response, success_response

from .permissions import IsCertificationOwner
from .serializers import CertificationSerializer
from .services import CertificationService


class CertificationListAPIView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CertificationSerializer
    service_class = CertificationService

    def _service(self) -> CertificationService:
        return self.service_class()

    def get(self, request, *args, **kwargs):
        certifications = self._service().list_certifications(user=request.user)
        return success_response(
            message="Certification records fetched successfully.",
            data=self.serializer_class(certifications, many=True).data,
        )

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        certification = self._service().create_certification(
            user=request.user,
            data=serializer.validated_data,
        )
        return created_response(
            message="Certification created successfully.",
            data=self.serializer_class(certification).data,
        )


class CertificationDetailAPIView(APIView):
    permission_classes = [IsAuthenticated, IsCertificationOwner]
    serializer_class = CertificationSerializer
    service_class = CertificationService

    def _service(self) -> CertificationService:
        return self.service_class()

    def _get_certification(self, request, certification_id):
        certification = self._service().retrieve_certification(user=request.user, certification_id=certification_id)
        self.check_object_permissions(request, certification)
        return certification

    def get(self, request, certification_id, *args, **kwargs):
        certification = self._get_certification(request, certification_id)
        return success_response(
            message="Certification fetched successfully.",
            data=self.serializer_class(certification).data,
        )

    def patch(self, request, certification_id, *args, **kwargs):
        certification = self._get_certification(request, certification_id)
        serializer = self.serializer_class(certification, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        certification = self._service().update_certification(
            user=request.user,
            certification_id=certification_id,
            data=serializer.validated_data,
        )
        return success_response(
            message="Certification updated successfully.",
            data=self.serializer_class(certification).data,
            status_code=status.HTTP_200_OK,
        )

    def delete(self, request, certification_id, *args, **kwargs):
        certification = self._get_certification(request, certification_id)
        self._service().delete_certification(user=request.user, certification_id=certification.id)
        return success_response(
            message="Certification deleted successfully.",
            status_code=status.HTTP_200_OK,
        )
