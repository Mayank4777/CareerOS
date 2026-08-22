from __future__ import annotations

from django.contrib import admin

from .models import CustomSection


@admin.register(CustomSection)
class CustomSectionAdmin(admin.ModelAdmin):
    list_display = ("title", "display_order", "career_profile")
    search_fields = ("title", "content")
    ordering = ("display_order", "title")
