from __future__ import annotations

import uuid

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("resumes", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="ResumeSection",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("section_type", models.CharField(max_length=64)),
                ("title", models.CharField(max_length=255)),
                ("display_order", models.PositiveIntegerField(default=0)),
                ("is_visible", models.BooleanField(default=True)),
                (
                    "resume",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="sections",
                        to="resumes.resume",
                    ),
                ),
            ],
            options={
                "verbose_name": "resume section",
                "verbose_name_plural": "resume sections",
                "db_table": "resume_section",
                "ordering": ["display_order", "title"],
            },
        ),
        migrations.CreateModel(
            name="ResumeSectionItem",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("source_object_id", models.UUIDField()),
                ("display_order", models.PositiveIntegerField(default=0)),
                (
                    "resume_section",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="items",
                        to="resume_editor.resumesection",
                    ),
                ),
            ],
            options={
                "verbose_name": "resume section item",
                "verbose_name_plural": "resume section items",
                "db_table": "resume_section_item",
                "ordering": ["display_order", "id"],
            },
        ),
        migrations.AddIndex(
            model_name="resumesection",
            index=models.Index(fields=["resume", "display_order"], name="resume_section_order_idx"),
        ),
        migrations.AddIndex(
            model_name="resumesectionitem",
            index=models.Index(fields=["resume_section", "display_order"], name="resume_item_order_idx"),
        ),
    ]

