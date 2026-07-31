from __future__ import annotations

from django.contrib import admin

from .models import Publication


@admin.register(Publication)
class PublicationAdmin(admin.ModelAdmin):
    list_display = ("title", "publisher", "publication_date", "display_order", "career_profile")
    search_fields = ("title", "publisher", "description")
    ordering = ("display_order", "title")
