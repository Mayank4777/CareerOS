"""Logging configuration helpers."""

from __future__ import annotations

import os
from pathlib import Path


def build_logging_config(base_dir: Path, level: str = "INFO") -> dict:
    log_dir = base_dir / "logs"
    log_dir.mkdir(parents=True, exist_ok=True)
    log_file = log_dir / "career_os.log"
    file_logging_enabled = _can_write_log_file(log_file)

    handlers = {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "standard",
            "level": level,
        },
    }

    if file_logging_enabled:
        handlers["file"] = {
            "class": "logging.handlers.RotatingFileHandler",
            "filename": str(log_file),
            "formatter": "standard",
            "level": level,
            "maxBytes": 10 * 1024 * 1024,
            "backupCount": 5,
        }

    root_handlers = ["console"]
    django_handlers = ["console"]
    if file_logging_enabled:
        root_handlers.append("file")
        django_handlers.append("file")

    return {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "standard": {
                "format": "%(asctime)s %(levelname)s %(name)s %(message)s",
            }
        },
        "handlers": handlers,
        "root": {
            "handlers": root_handlers,
            "level": level,
        },
        "loggers": {
            "django": {
                "handlers": django_handlers,
                "level": level,
                "propagate": False,
            },
            "django.request": {
                "handlers": django_handlers,
                "level": "WARNING",
                "propagate": False,
            },
            "celery": {
                "handlers": django_handlers,
                "level": level,
                "propagate": False,
            },
        },
    }


def _can_write_log_file(log_file: Path) -> bool:
    try:
        with log_file.open("a", encoding="utf-8"):
            return True
    except OSError:
        return False
