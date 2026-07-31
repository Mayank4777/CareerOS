from __future__ import annotations

from django.contrib import admin

from .models import VolunteerExperience


@admin.register(VolunteerExperience)
class VolunteerExperienceAdmin(admin.ModelAdmin):
    list_display = ("organization", "role", "currently_volunteering", "display_order", "career_profile")
    search_fields = ("organization", "role", "description")
    ordering = ("display_order", "organization")
