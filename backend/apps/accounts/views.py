from __future__ import annotations

from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from apps.common.responses import created_response, error_response, success_response

from .serializers import LoginSerializer, RegisterSerializer, RegisteredUserSerializer
from .services import AuthenticationService, EmailAlreadyExistsError, InvalidCredentialsError


class RegisterAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes: list = []

    def post(self, request, *args, **kwargs):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                message="Validation failed.",
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = serializer.save()
        except EmailAlreadyExistsError:
            return error_response(
                message="Email already exists.",
                status_code=status.HTTP_409_CONFLICT,
            )

        return created_response(
            message="User registered successfully.",
            data=RegisteredUserSerializer(user).data,
        )


class LoginAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes: list = []

    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                message="Validation failed.",
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = AuthenticationService().authenticate_user(
                email=serializer.validated_data["email"],
                password=serializer.validated_data["password"],
            )
        except InvalidCredentialsError:
            return error_response(
                message="Invalid email or password.",
                status_code=status.HTTP_401_UNAUTHORIZED,
            )

        refresh = RefreshToken.for_user(user)
        return success_response(
            message="Login successful.",
            data={
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": RegisteredUserSerializer(user).data,
            },
        )


class MeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        return success_response(
            message="User fetched successfully.",
            data=RegisteredUserSerializer(request.user).data,
        )
