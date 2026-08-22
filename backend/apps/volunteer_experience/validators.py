from __future__ import annotations

from rest_framework.exceptions import ValidationError


def validate_volunteer_experience_dates(*, currently_volunteering: bool, start_date, end_date) -> None:
    errors: dict[str, str] = {}

    if currently_volunteering:
        if end_date is not None:
            errors["end_date"] = "End date must be null when currently volunteering is true."
    elif end_date is not None and start_date is not None and start_date > end_date:
        errors["end_date"] = "End date cannot be before the start date."

    if errors:
        raise ValidationError(errors)
