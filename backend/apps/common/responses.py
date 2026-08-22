from __future__ import annotations

from typing import Any

from rest_framework import status
from rest_framework.response import Response


def success_response(
    *,
    message: str,
    data: Any = None,
    status_code: int = status.HTTP_200_OK,
) -> Response:
    payload: dict[str, Any] = {
        "success": True,
        "message": message,
    }
    if data is not None:
        payload["data"] = data
    return Response(payload, status=status_code)


def created_response(
    *,
    message: str,
    data: Any = None,
) -> Response:
    return success_response(message=message, data=data, status_code=status.HTTP_201_CREATED)


def error_response(
    *,
    message: str,
    errors: Any = None,
    status_code: int = status.HTTP_400_BAD_REQUEST,
) -> Response:
    payload: dict[str, Any] = {
        "success": False,
        "message": message,
    }
    if errors is not None:
        payload["errors"] = errors
    return Response(payload, status=status_code)

