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
            name="Experience",
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
                ("designation", models.CharField(max_length=255)),
                (
                    "employment_type",
                    models.CharField(
                        choices=[
                            ("full_time", "Full time"),
                            ("part_time", "Part time"),
                            ("contract", "Contract"),
                            ("internship", "Internship"),
                            ("freelance", "Freelance"),
                            ("temporary", "Temporary"),
                            ("apprenticeship", "Apprenticeship"),
                        ],
                        max_length=32,
                    ),
                ),
                ("company", models.CharField(max_length=255)),
                ("location", models.CharField(max_length=255)),
                (
                    "location_type",
                    models.CharField(
                        choices=[
                            ("onsite", "On-site"),
                            ("remote", "Remote"),
                            ("hybrid", "Hybrid"),
                        ],
                        max_length=32,
                    ),
                ),
                ("start_date", models.DateField()),
                ("end_date", models.DateField(blank=True, null=True)),
                ("currently_working", models.BooleanField(default=False)),
                ("description", models.TextField()),
                ("display_order", models.PositiveIntegerField(default=0)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "career_profile",
                    models.ForeignKey(
                        on_delete=models.CASCADE,
                        related_name="experiences",
                        to="career_profile.careerprofile",
                    ),
                ),
            ],
            options={
                "db_table": "experience",
                "verbose_name": "experience",
                "verbose_name_plural": "experience",
                "ordering": ["display_order", "-start_date"],
                "indexes": [
                    models.Index(
                        fields=["career_profile", "display_order", "-start_date"],
                        name="experience_order_idx",
                    )
                ],
                "constraints": [
                    models.CheckConstraint(
                        condition=Q(currently_working=True, end_date__isnull=True)
                        | Q(currently_working=False, end_date__isnull=False),
                        name="experience_end_date_matches_currently_working",
                    ),
                    models.CheckConstraint(
                        condition=Q(end_date__isnull=True) | Q(start_date__lte=F("end_date")),
                        name="experience_start_date_before_end_date",
                    ),
                ],
            },
        ),
    ]
