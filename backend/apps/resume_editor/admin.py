from __future__ import annotations

from django.contrib import admin

from .models import ResumeSection, ResumeSectionItem


@admin.register(ResumeSection)
class ResumeSectionAdmin(admin.ModelAdmin):
    list_display = ("title", "section_type", "display_order", "is_visible", "resume")
    list_filter = ("section_type", "is_visible")
    search_fields = ("title", "section_type")
    ordering = ("display_order", "title")


@admin.register(ResumeSectionItem)
class ResumeSectionItemAdmin(admin.ModelAdmin):
    list_display = ("source_object_id", "display_order", "resume_section")
    search_fields = ("source_object_id",)
    ordering = ("display_order", "id")

