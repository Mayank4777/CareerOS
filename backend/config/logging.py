"""Logging configuration helpers."""

from __future__ import annotations

from pathlib import Path


def build_logging_config(base_dir: Path, level: str = "INFO") -> dict:
    log_dir = base_dir / "logs"
    log_dir.mkdir(parents=True, exist_ok=True)

    return {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "standard": {
                "format": "%(asctime)s %(levelname)s %(name)s %(message)s",
            }
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "formatter": "standard",
                "level": level,
            },
            "file": {
                "class": "logging.handlers.RotatingFileHandler",
                "filename": str(log_dir / "career_os.log"),
                "formatter": "standard",
                "level": level,
                "maxBytes": 10 * 1024 * 1024,
                "backupCount": 5,
            },
        },
        "root": {
            "handlers": ["console", "file"],
            "level": level,
        },
        "loggers": {
            "django": {
                "handlers": ["console", "file"],
                "level": level,
                "propagate": False,
            },
            "django.request": {
                "handlers": ["console", "file"],
                "level": "WARNING",
                "propagate": False,
            },
            "celery": {
                "handlers": ["console", "file"],
                "level": level,
                "propagate": False,
            },
        },
    }
