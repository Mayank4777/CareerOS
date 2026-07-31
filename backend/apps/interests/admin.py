from __future__ import annotations

from django.contrib import admin

from .models import Interest


@admin.register(Interest)
class InterestAdmin(admin.ModelAdmin):
    list_display = ("name", "display_order", "career_profile")
    search_fields = ("name",)
    ordering = ("display_order", "name")
