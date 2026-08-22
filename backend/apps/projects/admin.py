from __future__ import annotations

from django.contrib import admin

from .models import Project


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("title", "organization", "role", "display_order", "career_profile")
    list_filter = ("currently_active",)
    search_fields = ("title", "organization", "role")
    ordering = ("display_order", "title")
