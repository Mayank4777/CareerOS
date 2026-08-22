from __future__ import annotations

import uuid

from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("career_profile", "0005_education_career_profile"),
    ]

    operations = [
        migrations.CreateModel(
            name="Language",
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
                ("language", models.CharField(max_length=255)),
                (
                    "proficiency",
                    models.CharField(
                        choices=[
                            ("beginner", "Beginner"),
                            ("intermediate", "Intermediate"),
                            ("professional", "Professional"),
                            ("native", "Native"),
                        ],
                        max_length=32,
                    ),
                ),
                ("display_order", models.PositiveIntegerField(default=0)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "career_profile",
                    models.ForeignKey(
                        on_delete=models.CASCADE,
                        related_name="languages",
                        to="career_profile.careerprofile",
                    ),
                ),
            ],
            options={
                "db_table": "language",
                "verbose_name": "language",
                "verbose_name_plural": "languages",
                "ordering": ["display_order", "language"],
            },
        ),
    ]
