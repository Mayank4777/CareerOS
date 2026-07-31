from __future__ import annotations

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.common.responses import created_response, success_response

from .permissions import IsCareerProfileOwner, IsEducationOwner
from .serializers import CareerProfileSerializer, EducationSerializer
from .services import CareerProfileService, EducationService


class CareerProfileAPIView(APIView):
    permission_classes = [IsAuthenticated, IsCareerProfileOwner]
    serializer_class = CareerProfileSerializer
    service_class = CareerProfileService

    def _service(self) -> CareerProfileService:
        return self.service_class()

    def get(self, request, *args, **kwargs):
        profile = self._service().retrieve_profile(user=request.user)
        self.check_object_permissions(request, profile)
        return success_response(
            message="Career profile fetched successfully.",
            data=self.serializer_class(profile).data,
        )

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        profile = self._service().create_profile(
            user=request.user,
            data=serializer.validated_data,
        )
        return created_response(
            message="Career profile created successfully.",
            data=self.serializer_class(profile).data,
        )

    def patch(self, request, *args, **kwargs):
        profile = self._service().retrieve_profile(user=request.user)
        self.check_object_permissions(request, profile)

        serializer = self.serializer_class(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        profile = self._service().update_profile(
            user=request.user,
            data=serializer.validated_data,
        )
        return success_response(
            message="Career profile updated successfully.",
            data=self.serializer_class(profile).data,
            status_code=status.HTTP_200_OK,
        )

    def delete(self, request, *args, **kwargs):
        profile = self._service().retrieve_profile(user=request.user)
        self.check_object_permissions(request, profile)
        self._service().delete_profile(user=request.user)
        return success_response(
            message="Career profile deleted successfully.",
            status_code=status.HTTP_200_OK,
        )


class EducationListAPIView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = EducationSerializer
    service_class = EducationService

    def _service(self) -> EducationService:
        return self.service_class()

    def get(self, request, *args, **kwargs):
        educations = self._service().list_educations(user=request.user)
        return success_response(
            message="Education records fetched successfully.",
            data=self.serializer_class(educations, many=True).data,
        )

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        education = self._service().create_education(
            user=request.user,
            data=serializer.validated_data,
        )
        return created_response(
            message="Education created successfully.",
            data=self.serializer_class(education).data,
        )


class EducationDetailAPIView(APIView):
    permission_classes = [IsAuthenticated, IsEducationOwner]
    serializer_class = EducationSerializer
    service_class = EducationService

    def _service(self) -> EducationService:
        return self.service_class()

    def _get_education(self, request, education_id):
        education = self._service().retrieve_education(user=request.user, education_id=education_id)
        self.check_object_permissions(request, education)
        return education

    def get(self, request, education_id, *args, **kwargs):
        education = self._get_education(request, education_id)
        return success_response(
            message="Education fetched successfully.",
            data=self.serializer_class(education).data,
        )

    def patch(self, request, education_id, *args, **kwargs):
        education = self._get_education(request, education_id)
        serializer = self.serializer_class(education, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        education = self._service().update_education(
            user=request.user,
            education_id=education_id,
            data=serializer.validated_data,
        )
        return success_response(
            message="Education updated successfully.",
            data=self.serializer_class(education).data,
            status_code=status.HTTP_200_OK,
        )

    def delete(self, request, education_id, *args, **kwargs):
        education = self._get_education(request, education_id)
        self._service().delete_education(user=request.user, education_id=education.id)
        return success_response(
            message="Education deleted successfully.",
            status_code=status.HTTP_200_OK,
        )
