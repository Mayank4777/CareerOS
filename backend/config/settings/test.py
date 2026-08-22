"""Dedicated test configuration for CareerOS."""

from __future__ import annotations

from .dev import *  # noqa: F401, F403

# Fast password hasher for Django unit tests
PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.MD5PasswordHasher",
]
