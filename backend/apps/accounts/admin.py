from __future__ import annotations

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .forms import UserChangeForm, UserCreationForm
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    add_form = UserCreationForm
    form = UserChangeForm
    list_display = ("email", "first_name", "last_name", "is_active", "is_verified", "is_staff")
    list_filter = ("is_active", "is_verified", "is_staff", "is_superuser")
    search_fields = ("email", "first_name", "last_name")
    ordering = ("email",)
    readonly_fields = ("date_joined", "last_login")
    fieldsets = (
        (
            None,
            {
                "fields": (
                    "email",
                    "password",
                    "first_name",
                    "last_name",
                )
            },
        ),
        (
            "Status",
            {
                "fields": (
                    "is_active",
                    "is_verified",
                    "is_staff",
                    "is_superuser",
                )
            },
        ),
        (
            "Important Dates",
            {
                "fields": (
                    "last_login",
                    "date_joined",
                )
            },
        ),
        (
            "Permissions",
            {
                "fields": (
                    "groups",
                    "user_permissions",
                )
            },
        ),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "first_name", "last_name", "password1", "password2"),
            },
        ),
    )
    filter_horizontal = ("groups", "user_permissions")
