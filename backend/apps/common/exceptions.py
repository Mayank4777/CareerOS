from __future__ import annotations

from rest_framework.exceptions import APIException


class ConflictException(APIException):
    status_code = 409
    default_detail = "Conflict."
    default_code = "conflict"


class ValidationException(APIException):
    status_code = 400
    default_detail = "Validation failed."
    default_code = "validation_error"


class BusinessLogicException(APIException):
    status_code = 400
    default_detail = "Business rule violated."
    default_code = "business_logic_error"


class ResourceNotFoundException(APIException):
    status_code = 404
    default_detail = "Resource not found."
    default_code = "not_found"

