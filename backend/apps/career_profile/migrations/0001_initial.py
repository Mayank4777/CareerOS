from __future__ import annotations

import uuid

from django.conf import settings
from django.db.models import deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="CareerProfile",
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
                (
                    "first_name",
                    models.CharField(blank=True, default="", max_length=150),
                ),
                (
                    "last_name",
                    models.CharField(blank=True, default="", max_length=150),
                ),
                (
                    "headline",
                    models.CharField(blank=True, default="", max_length=255),
                ),
                (
                    "summary",
                    models.TextField(blank=True, default=""),
                ),
                (
                    "phone",
                    models.CharField(blank=True, default="", max_length=32),
                ),
                (
                    "location",
                    models.CharField(blank=True, default="", max_length=255),
                ),
                (
                    "website",
                    models.URLField(blank=True, default=""),
                ),
                (
                    "linkedin_url",
                    models.URLField(blank=True, default=""),
                ),
                (
                    "github_url",
                    models.URLField(blank=True, default=""),
                ),
                (
                    "user",
                    models.OneToOneField(
                        on_delete=deletion.CASCADE,
                        related_name="career_profile",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "db_table": "career_profile",
                "verbose_name": "career profile",
                "verbose_name_plural": "career profiles",
            },
        ),
    ]
