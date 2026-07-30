from __future__ import annotations

from collections.abc import Mapping
from typing import Any

from rest_framework.exceptions import APIException, ValidationError
from rest_framework.views import exception_handler as drf_exception_handler

from .responses import error_response


def custom_exception_handler(exc: Exception, context: dict[str, Any]):
    response = drf_exception_handler(exc, context)
    if response is None:
        return None

    if isinstance(exc, ValidationError):
        return error_response(
            message="Validation failed.",
            errors=_normalize_errors(exc.detail),
            status_code=response.status_code,
        )

    if isinstance(exc, APIException):
        detail = getattr(exc, "detail", None)
        errors = _normalize_errors(detail)
        if errors is not None:
            return error_response(
                message=str(exc.default_detail),
                errors=errors,
                status_code=response.status_code,
            )
        return error_response(
            message=str(detail if detail is not None else exc.default_detail),
            status_code=response.status_code,
        )

    return response


def _normalize_errors(detail: Any) -> Any:
    if isinstance(detail, Mapping):
        return detail
    if isinstance(detail, list):
        return detail
    return None

