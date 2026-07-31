from __future__ import annotations

from django.contrib import admin

from .models import Language


@admin.register(Language)
class LanguageAdmin(admin.ModelAdmin):
    list_display = ("language", "proficiency", "display_order", "career_profile")
    list_filter = ("proficiency",)
    search_fields = ("language",)
    ordering = ("display_order", "language")
