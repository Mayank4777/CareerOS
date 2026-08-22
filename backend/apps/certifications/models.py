from __future__ import annotations

import uuid

from django.db import models
from django.db.models import F, Q

from apps.career_profile.models import CareerProfile


class Certification(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    career_profile = models.ForeignKey(
        CareerProfile,
        on_delete=models.CASCADE,
        related_name="certifications",
    )
    name = models.CharField(max_length=255)
    issuing_organization = models.CharField(max_length=255)
    credential_id = models.CharField(max_length=255, blank=True, default="")
    credential_url = models.URLField(blank=True, null=True)
    issue_date = models.DateField()
    expiry_date = models.DateField(null=True, blank=True)
    does_not_expire = models.BooleanField(default=False)
    display_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "certification"
        verbose_name = "certification"
        verbose_name_plural = "certifications"
        ordering = ["display_order", "name"]
        constraints = [
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
        ]

    def __str__(self) -> str:
        return self.name
