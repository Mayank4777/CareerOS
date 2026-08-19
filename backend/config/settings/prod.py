"""Production settings for CareerOS."""

from __future__ import annotations

import os

from django.core.exceptions import ImproperlyConfigured

from .base import *  # noqa: F401,F403
from .base import _bool, _int, _list

DEBUG = False

SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY")
if not SECRET_KEY:
    raise ImproperlyConfigured("DJANGO_SECRET_KEY must be set in production.")

ALLOWED_HOSTS = _list("DJANGO_ALLOWED_HOSTS")
if not ALLOWED_HOSTS:
    raise ImproperlyConfigured("DJANGO_ALLOWED_HOSTS must be set in production.")

CORS_ALLOWED_ORIGINS = _list("DJANGO_CORS_ALLOWED_ORIGINS")

if _bool("USE_SQLITE", False):
    raise ImproperlyConfigured("SQLite is strictly prohibited in production.")

USE_REDIS = _bool("USE_REDIS", True)
if USE_REDIS:
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.redis.RedisCache",
            "LOCATION": os.environ.get("REDIS_URL", "redis://redis:6379/1"),
        }
    }

SECURE_SSL_REDIRECT = _bool("DJANGO_SECURE_SSL_REDIRECT", True)
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = _int("DJANGO_SECURE_HSTS_SECONDS", 31536000)
SECURE_HSTS_INCLUDE_SUBDOMAINS = _bool("DJANGO_SECURE_HSTS_INCLUDE_SUBDOMAINS", False)
SECURE_HSTS_PRELOAD = _bool("DJANGO_SECURE_HSTS_PRELOAD", False)
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
EMAIL_BACKEND = os.environ.get(
    "DJANGO_EMAIL_BACKEND",
    "django.core.mail.backends.smtp.EmailBackend",
)
