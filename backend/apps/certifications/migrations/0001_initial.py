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
            name="Certification",
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
                ("issuing_organization", models.CharField(max_length=255)),
                ("credential_id", models.CharField(blank=True, default="", max_length=255)),
                ("credential_url", models.URLField(blank=True, null=True)),
                ("issue_date", models.DateField()),
                ("expiry_date", models.DateField(blank=True, null=True)),
                ("does_not_expire", models.BooleanField(default=False)),
                ("display_order", models.PositiveIntegerField(default=0)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "career_profile",
                    models.ForeignKey(
                        on_delete=models.CASCADE,
                        related_name="certifications",
                        to="career_profile.careerprofile",
                    ),
                ),
            ],
            options={
                "db_table": "certification",
                "verbose_name": "certification",
                "verbose_name_plural": "certifications",
                "ordering": ["display_order", "name"],
                "constraints": [
                    models.CheckConstraint(
                        condition=Q(does_not_expire=True, expiry_date__isnull=True)
                        | Q(does_not_expire=False, expiry_date__isnull=True)
                        | Q(does_not_expire=False, issue_date__lte=F("expiry_date")),
                        name="certification_expiry_matches_does_not_expire",
                    ),
                    models.CheckConstraint(
                        condition=Q(expiry_date__isnull=True) | Q(issue_date__lte=F("expiry_date")),
                        name="certification_issue_date_before_expiry_date",
                    ),
                ],
            },
        ),
    ]
