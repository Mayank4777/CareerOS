from __future__ import annotations

from django.contrib import admin

from .models import Skill


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "category",
        "proficiency_level",
        "years_of_experience",
        "display_order",
        "career_profile",
    )
    list_filter = ("proficiency_level", "category")
    search_fields = ("name", "category")
    ordering = ("display_order", "name")
