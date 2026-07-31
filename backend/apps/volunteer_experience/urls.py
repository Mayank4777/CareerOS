from __future__ import annotations

from django.urls import path

from .views import VolunteerExperienceDetailAPIView, VolunteerExperienceListAPIView

app_name = "volunteer_experience"

urlpatterns = [
    path("", VolunteerExperienceListAPIView.as_view(), name="volunteer-experience-list"),
    path(
        "<uuid:volunteer_experience_id>/",
        VolunteerExperienceDetailAPIView.as_view(),
        name="volunteer-experience-detail",
    ),
]
