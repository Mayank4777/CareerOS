from __future__ import annotations

import uuid

from django.db import migrations, models
from django.db.models import F, Q


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("career_profile", "0005_education_career_profile"),
    ]

    operations = [
        migrations.CreateModel(
            name="Project",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("title", models.CharField(max_length=255)),
                ("organization", models.CharField(blank=True, default="", max_length=255)),
                ("role", models.CharField(blank=True, default="", max_length=255)),
                ("description", models.TextField()),
                ("technologies", models.TextField()),
                ("project_url", models.URLField(blank=True, null=True)),
                ("github_url", models.URLField(blank=True, null=True)),
                ("start_date", models.DateField(blank=True, null=True)),
                ("end_date", models.DateField(blank=True, null=True)),
                ("currently_active", models.BooleanField(default=False)),
                ("display_order", models.PositiveIntegerField(default=0)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "career_profile",
                    models.ForeignKey(
                        on_delete=models.CASCADE,
                        related_name="projects",
                        to="career_profile.careerprofile",
                    ),
                ),
            ],
            options={
                "db_table": "project",
                "verbose_name": "project",
                "verbose_name_plural": "projects",
                "ordering": ["display_order", "title"],
                "constraints": [
                    models.CheckConstraint(
                        condition=Q(currently_active=True, end_date__isnull=True)
                        | Q(currently_active=False, end_date__isnull=True)
                        | Q(currently_active=False, start_date__isnull=True)
                        | Q(currently_active=False, start_date__lte=F("end_date")),
                        name="project_end_date_matches_currently_active",
                    ),
                    models.CheckConstraint(
                        condition=Q(end_date__isnull=True)
                        | Q(start_date__isnull=True)
                        | Q(start_date__lte=F("end_date")),
                        name="project_start_date_before_end_date",
                    ),
                ],
            },
        ),
    ]
