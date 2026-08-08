from __future__ import annotations

import uuid

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("career_profile", "0005_education_career_profile"),
    ]

    operations = [
        migrations.CreateModel(
            name="Resume",
            fields=[
                (
                    "id",
                    models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False),
                ),
                ("title", models.CharField(max_length=255)),
                ("template", models.CharField(blank=True, default="", max_length=100)),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("draft", "Draft"),
                            ("in_review", "In Review"),
                            ("approved", "Approved"),
                            ("applied", "Applied"),
                            ("archived", "Archived"),
                        ],
                        default="draft",
                        max_length=32,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "career_profile",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="resumes",
                        to="career_profile.careerprofile",
                    ),
                ),
            ],
            options={
                "verbose_name": "resume",
                "verbose_name_plural": "resumes",
                "db_table": "resume",
                "ordering": ["-created_at", "-updated_at"],
            },
        ),
        migrations.AddIndex(
            model_name="resume",
            index=models.Index(fields=["career_profile", "-created_at"], name="resume_profile_created_idx"),
        ),
        migrations.AddIndex(
            model_name="resume",
            index=models.Index(fields=["career_profile", "status"], name="resume_profile_status_idx"),
        ),
    ]

