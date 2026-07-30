"""Development settings for CareerOS."""

from __future__ import annotations

import os

from .base import *  # noqa: F401,F403
from .base import _list

DEBUG = True
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", SECRET_KEY)
ALLOWED_HOSTS = _list("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1,[::1]")
CORS_ALLOWED_ORIGINS = _list(
    "DJANGO_CORS_ALLOWED_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173",
)
EMAIL_BACKEND = os.environ.get(
    "DJANGO_EMAIL_BACKEND",
    "django.core.mail.backends.console.EmailBackend",
)
REST_FRAMEWORK = {
    **REST_FRAMEWORK,
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
        "rest_framework.renderers.BrowsableAPIRenderer",
    ],
}
