from __future__ import annotations

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.common.responses import created_response, success_response

from .permissions import IsLanguageOwner
from .serializers import LanguageSerializer
from .services import LanguageService


class LanguageListAPIView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = LanguageSerializer
    service_class = LanguageService

    def _service(self) -> LanguageService:
        return self.service_class()

    def get(self, request, *args, **kwargs):
        languages = self._service().list_languages(user=request.user)
        return success_response(
            message="Language records fetched successfully.",
            data=self.serializer_class(languages, many=True).data,
        )

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        language = self._service().create_language(user=request.user, data=serializer.validated_data)
        return created_response(
            message="Language created successfully.",
            data=self.serializer_class(language).data,
        )


class LanguageDetailAPIView(APIView):
    permission_classes = [IsAuthenticated, IsLanguageOwner]
    serializer_class = LanguageSerializer
    service_class = LanguageService

    def _service(self) -> LanguageService:
        return self.service_class()

    def _get_language(self, request, language_id):
        language = self._service().retrieve_language(user=request.user, language_id=language_id)
        self.check_object_permissions(request, language)
        return language

    def get(self, request, language_id, *args, **kwargs):
        language = self._get_language(request, language_id)
        return success_response(
            message="Language fetched successfully.",
            data=self.serializer_class(language).data,
        )

    def patch(self, request, language_id, *args, **kwargs):
        language = self._get_language(request, language_id)
        serializer = self.serializer_class(language, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        language = self._service().update_language(
            user=request.user,
            language_id=language_id,
            data=serializer.validated_data,
        )
        return success_response(
            message="Language updated successfully.",
            data=self.serializer_class(language).data,
            status_code=status.HTTP_200_OK,
        )

    def delete(self, request, language_id, *args, **kwargs):
        language = self._get_language(request, language_id)
        self._service().delete_language(user=request.user, language_id=language.id)
        return success_response(
            message="Language deleted successfully.",
            status_code=status.HTTP_200_OK,
        )
