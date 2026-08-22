from __future__ import annotations

from django.contrib import admin

from .models import Award


@admin.register(Award)
class AwardAdmin(admin.ModelAdmin):
    list_display = ("title", "issuer", "award_date", "display_order", "career_profile")
    search_fields = ("title", "issuer", "description")
    ordering = ("display_order", "title")
