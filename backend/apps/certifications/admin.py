from __future__ import annotations

from django.contrib import admin

from .models import Certification


@admin.register(Certification)
class CertificationAdmin(admin.ModelAdmin):
    list_display = ("name", "issuing_organization", "display_order", "career_profile")
    list_filter = ("does_not_expire",)
    search_fields = ("name", "issuing_organization", "credential_id")
    ordering = ("display_order", "name")
