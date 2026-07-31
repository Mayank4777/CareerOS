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
            name="Publication",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("title", models.CharField(max_length=255)),
                ("publisher", models.CharField(max_length=255)),
                ("publication_date", models.DateField()),
                ("publication_url", models.URLField(blank=True, null=True)),
                ("description", models.TextField(blank=True, default="")),
                ("display_order", models.PositiveIntegerField(default=0)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "career_profile",
                    models.ForeignKey(
                        on_delete=models.CASCADE,
                        related_name="publications",
                        to="career_profile.careerprofile",
                    ),
                ),
            ],
            options={
                "db_table": "publication",
                "verbose_name": "publication",
                "verbose_name_plural": "publications",
                "ordering": ["display_order", "title"],
            },
        ),
    ]
