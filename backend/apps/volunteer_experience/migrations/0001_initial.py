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
            name="VolunteerExperience",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("organization", models.CharField(max_length=255)),
                ("role", models.CharField(max_length=255)),
                ("description", models.TextField()),
                ("start_date", models.DateField()),
                ("end_date", models.DateField(blank=True, null=True)),
                ("currently_volunteering", models.BooleanField(default=False)),
                ("display_order", models.PositiveIntegerField(default=0)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "career_profile",
                    models.ForeignKey(
                        on_delete=models.CASCADE,
                        related_name="volunteer_experiences",
                        to="career_profile.careerprofile",
                    ),
                ),
            ],
            options={
                "db_table": "volunteer_experience",
                "verbose_name": "volunteer experience",
                "verbose_name_plural": "volunteer experiences",
                "ordering": ["display_order", "-start_date"],
                "constraints": [
                    models.CheckConstraint(
                        condition=Q(currently_volunteering=True, end_date__isnull=True)
                        | Q(currently_volunteering=False),
                        name="volunteer_experience_end_date_matches_currently_volunteering",
                    ),
                    models.CheckConstraint(
                        condition=Q(end_date__isnull=True) | Q(start_date__lte=F("end_date")),
                        name="volunteer_experience_start_date_before_end_date",
                    ),
                ],
            },
        ),
    ]
