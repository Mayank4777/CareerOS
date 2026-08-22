from __future__ import annotations

from django.contrib import admin

from .models import Resume


@admin.register(Resume)
class ResumeAdmin(admin.ModelAdmin):
    list_display = ("title", "status", "template", "career_profile", "created_at", "updated_at")
    list_filter = ("status", "template")
    search_fields = ("title",)
    ordering = ("-created_at",)

