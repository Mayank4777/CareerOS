from __future__ import annotations

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.common.responses import created_response, success_response

from .permissions import IsPublicationOwner
from .serializers import PublicationSerializer
from .services import PublicationService


class PublicationListAPIView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PublicationSerializer
    service_class = PublicationService

    def _service(self) -> PublicationService:
        return self.service_class()

    def get(self, request, *args, **kwargs):
        publications = self._service().list_publications(user=request.user)
        return success_response(
            message="Publication records fetched successfully.",
            data=self.serializer_class(publications, many=True).data,
        )

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        publication = self._service().create_publication(user=request.user, data=serializer.validated_data)
        return created_response(
            message="Publication created successfully.",
            data=self.serializer_class(publication).data,
        )


class PublicationDetailAPIView(APIView):
    permission_classes = [IsAuthenticated, IsPublicationOwner]
    serializer_class = PublicationSerializer
    service_class = PublicationService

    def _service(self) -> PublicationService:
        return self.service_class()

    def _get_publication(self, request, publication_id):
        publication = self._service().retrieve_publication(user=request.user, publication_id=publication_id)
        self.check_object_permissions(request, publication)
        return publication

    def get(self, request, publication_id, *args, **kwargs):
        publication = self._get_publication(request, publication_id)
        return success_response(
            message="Publication fetched successfully.",
            data=self.serializer_class(publication).data,
        )

    def patch(self, request, publication_id, *args, **kwargs):
        publication = self._get_publication(request, publication_id)
        serializer = self.serializer_class(publication, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        publication = self._service().update_publication(
            user=request.user,
            publication_id=publication_id,
            data=serializer.validated_data,
        )
        return success_response(
            message="Publication updated successfully.",
            data=self.serializer_class(publication).data,
            status_code=status.HTTP_200_OK,
        )

    def delete(self, request, publication_id, *args, **kwargs):
        publication = self._get_publication(request, publication_id)
        self._service().delete_publication(user=request.user, publication_id=publication.id)
        return success_response(
            message="Publication deleted successfully.",
            status_code=status.HTTP_200_OK,
        )
