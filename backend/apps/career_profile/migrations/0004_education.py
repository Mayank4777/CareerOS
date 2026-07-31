from __future__ import annotations

import uuid

from django.conf import settings
from django.db.models import deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("career_profile", "0003_alter_careerprofile_options"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Education",
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
                ("institution", models.CharField(max_length=255)),
                ("degree", models.CharField(max_length=255)),
                ("field_of_study", models.CharField(max_length=255)),
                ("start_date", models.DateField()),
                ("end_date", models.DateField()),
                ("grade", models.CharField(max_length=255)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=deletion.CASCADE,
                        related_name="educations",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "db_table": "education",
                "verbose_name": "education",
                "verbose_name_plural": "education",
            },
        ),
    ]
