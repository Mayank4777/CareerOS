from __future__ import annotations

from django.contrib import admin

from .models import Achievement


@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ("title", "achievement_date", "display_order", "career_profile")
    search_fields = ("title", "description")
    ordering = ("display_order", "title")
