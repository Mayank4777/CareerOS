from __future__ import annotations

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("resume_editor", "0001_initial"),
    ]

    operations = [
        migrations.AddConstraint(
            model_name="resumesectionitem",
            constraint=models.UniqueConstraint(
                fields=["resume_section", "source_object_id"],
                name="resume_section_item_unique_source_object",
            ),
        ),
    ]
