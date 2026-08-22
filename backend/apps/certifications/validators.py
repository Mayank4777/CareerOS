from __future__ import annotations

from rest_framework.exceptions import ValidationError


def validate_certification_dates(*, does_not_expire: bool, issue_date, expiry_date) -> None:
    errors: dict[str, str] = {}

    if does_not_expire:
        if expiry_date is not None:
            errors["expiry_date"] = "Expiry date must be null when does not expire is true."
    elif expiry_date is not None and issue_date is not None and issue_date > expiry_date:
        errors["expiry_date"] = "Expiry date cannot be before the issue date."

    if errors:
        raise ValidationError(errors)
