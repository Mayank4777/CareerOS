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
            name="Skill",
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
                ("name", models.CharField(max_length=255)),
                ("category", models.CharField(blank=True, default="", max_length=100)),
                (
                    "proficiency_level",
                    models.CharField(
                        choices=[
                            ("beginner", "Beginner"),
                            ("intermediate", "Intermediate"),
                            ("advanced", "Advanced"),
                            ("expert", "Expert"),
                        ],
                        max_length=32,
                    ),
                ),
                ("years_of_experience", models.PositiveIntegerField(blank=True, null=True)),
                ("display_order", models.PositiveIntegerField(default=0)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "career_profile",
                    models.ForeignKey(
                        on_delete=models.CASCADE,
                        related_name="skills",
                        to="career_profile.careerprofile",
                    ),
                ),
            ],
            options={
                "db_table": "skill",
                "verbose_name": "skill",
                "verbose_name_plural": "skills",
                "ordering": ["display_order", "name"],
            },
        ),
    ]
