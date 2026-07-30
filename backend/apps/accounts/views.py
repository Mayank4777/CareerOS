from __future__ import annotations

from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import LoginSerializer, RegisterSerializer, RegisteredUserSerializer
from .services import AuthenticationService, EmailAlreadyExistsError, InvalidCredentialsError


class RegisterAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes: list = []

    def post(self, request, *args, **kwargs):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {
                    "success": False,
                    "message": "Validation failed.",
                    "errors": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = serializer.save()
        except EmailAlreadyExistsError:
            return Response(
                {
                    "success": False,
                    "message": "Email already exists.",
                },
                status=status.HTTP_409_CONFLICT,
            )

        return Response(
            {
                "success": True,
                "message": "User registered successfully.",
                "data": RegisteredUserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes: list = []

    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {
                    "success": False,
                    "message": "Validation failed.",
                    "errors": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = AuthenticationService().authenticate_user(
                email=serializer.validated_data["email"],
                password=serializer.validated_data["password"],
            )
        except InvalidCredentialsError:
            return Response(
                {
                    "success": False,
                    "message": "Invalid email or password.",
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "success": True,
                "message": "Login successful.",
                "data": {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                    "user": RegisteredUserSerializer(user).data,
                },
            },
            status=status.HTTP_200_OK,
        )


class MeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        return Response(
            {
                "success": True,
                "message": "User fetched successfully.",
                "data": RegisteredUserSerializer(request.user).data,
            },
            status=status.HTTP_200_OK,
        )
