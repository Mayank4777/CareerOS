from __future__ import annotations

from rest_framework.exceptions import ValidationError


def validate_experience_dates(*, currently_working: bool, start_date, end_date) -> None:
    errors: dict[str, str] = {}

    if currently_working:
        if end_date is not None:
            errors["end_date"] = "End date must be null when currently working is true."
    elif end_date is None:
        errors["end_date"] = "End date is required when currently working is false."

    if start_date is not None and end_date is not None and start_date > end_date:
        errors["end_date"] = "End date cannot be before the start date."

    if errors:
        raise ValidationError(errors)
