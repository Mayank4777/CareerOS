from __future__ import annotations

from dataclasses import dataclass

from django.contrib.auth import authenticate
from django.db import IntegrityError, transaction

from .models import User


class EmailAlreadyExistsError(Exception):
    """Raised when an account already exists for the provided email."""


class InvalidCredentialsError(Exception):
    """Raised when email/password authentication fails."""


@dataclass(slots=True)
class RegistrationService:
    """Business logic for user registration."""

    def register_user(
        self,
        *,
        email: str,
        first_name: str = "",
        last_name: str = "",
        password: str,
    ) -> User:
        normalized_email = email.strip().lower()

        if User.objects.filter(email__iexact=normalized_email).exists():
            raise EmailAlreadyExistsError

        try:
            with transaction.atomic():
                return User.objects.create_user(
                    email=normalized_email,
                    password=password,
                    first_name=first_name.strip(),
                    last_name=last_name.strip(),
                )
        except IntegrityError as exc:
            raise EmailAlreadyExistsError from exc


@dataclass(slots=True)
class AuthenticationService:
    """Business logic for email/password authentication."""

    def authenticate_user(self, *, email: str, password: str) -> User:
        normalized_email = email.strip().lower()
        user = authenticate(email=normalized_email, password=password)

        if user is not None:
            return user

        existing_user = User.objects.filter(email__iexact=normalized_email).first()
        if existing_user is not None and not existing_user.is_active:
            raise InvalidCredentialsError

        raise InvalidCredentialsError
