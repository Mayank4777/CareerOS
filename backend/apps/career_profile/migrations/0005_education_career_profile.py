from __future__ import annotations

from django.db import migrations, models
from django.db.models import deletion


def copy_education_ownership_to_career_profile(apps, schema_editor) -> None:
    Education = apps.get_model("career_profile", "Education")
    CareerProfile = apps.get_model("career_profile", "CareerProfile")

    for education in Education.objects.select_related("user").all():
        career_profile, _ = CareerProfile.objects.get_or_create(user_id=education.user_id)
        education.career_profile = career_profile
        education.save(update_fields=["career_profile"])


class Migration(migrations.Migration):
    dependencies = [
        ("career_profile", "0004_education"),
    ]

    operations = [
        migrations.AddField(
            model_name="education",
            name="career_profile",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=deletion.CASCADE,
                related_name="educations",
                to="career_profile.careerprofile",
            ),
        ),
        migrations.RunPython(copy_education_ownership_to_career_profile, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="education",
            name="career_profile",
            field=models.ForeignKey(
                on_delete=deletion.CASCADE,
                related_name="educations",
                to="career_profile.careerprofile",
            ),
        ),
        migrations.RemoveField(
            model_name="education",
            name="user",
        ),
    ]
