from __future__ import annotations

from rest_framework.exceptions import ValidationError


def validate_resume_title(value: str) -> None:
    if value.strip() == "":
        raise ValidationError("Title is required.")
