from __future__ import annotations

from rest_framework.exceptions import ValidationError


def validate_resume_section_title(value: str) -> None:
    if not value.strip():
        raise ValidationError("Title is required.")


def validate_resume_section_type(value: str) -> None:
    if not value.strip():
        raise ValidationError("Section type is required.")

