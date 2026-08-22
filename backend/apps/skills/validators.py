from __future__ import annotations

from rest_framework.exceptions import ValidationError


def validate_skill_years_of_experience(value) -> None:
    if value is not None and value < 0:
        raise ValidationError({"years_of_experience": "Years of experience cannot be negative."})
