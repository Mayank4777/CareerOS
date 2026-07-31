from __future__ import annotations

from django.apps import AppConfig


class CustomSectionsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.custom_sections"
    verbose_name = "Custom Sections"
