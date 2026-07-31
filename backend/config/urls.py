"""Root URL configuration for CareerOS."""

from __future__ import annotations

from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/auth/", include("apps.accounts.urls")),
    path("api/v1/experience/", include("apps.experience.urls")),
    path("api/v1/skills/", include("apps.skills.urls")),
    path("api/v1/projects/", include("apps.projects.urls")),
    path("api/v1/certifications/", include("apps.certifications.urls")),
    path("api/v1/languages/", include("apps.languages.urls")),
    path("api/v1/custom-sections/", include("apps.custom_sections.urls")),
    path("api/v1/achievements/", include("apps.achievements.urls")),
    path("api/v1/awards/", include("apps.awards.urls")),
    path("api/v1/volunteer-experience/", include("apps.volunteer_experience.urls")),
    path("api/v1/publications/", include("apps.publications.urls")),
    path("api/v1/interests/", include("apps.interests.urls")),
    path("api/v1/references/", include("apps.references.urls")),
    path("api/v1/", include("apps.career_profile.urls")),
]
