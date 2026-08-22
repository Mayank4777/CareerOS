from __future__ import annotations

from django.contrib import admin

from .models import Reference


@admin.register(Reference)
class ReferenceAdmin(admin.ModelAdmin):
    list_display = ("name", "designation", "company", "display_order", "career_profile")
    search_fields = ("name", "designation", "company", "email", "phone")
    ordering = ("display_order", "name")
