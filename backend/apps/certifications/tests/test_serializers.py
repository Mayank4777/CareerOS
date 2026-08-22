from __future__ import annotations

from django.test import TestCase

from ..serializers import CertificationSerializer


class CertificationSerializerTests(TestCase):
    def test_validation_and_stripping(self) -> None:
        serializer = CertificationSerializer(
            data={
                "name": " AWS Certified Developer ",
                "issuing_organization": " Amazon ",
                "credential_id": " 123 ",
                "issue_date": "2024-01-01",
                "does_not_expire": True,
            }
        )
        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(serializer.validated_data["name"], "AWS Certified Developer")
        self.assertEqual(serializer.validated_data["issuing_organization"], "Amazon")
        self.assertEqual(serializer.validated_data["credential_id"], "123")

    def test_date_rules_are_enforced(self) -> None:
        serializer = CertificationSerializer(
            data={
                "name": "AWS Certified Developer",
                "issuing_organization": "Amazon",
                "issue_date": "2024-01-01",
                "expiry_date": "2023-01-01",
                "does_not_expire": False,
            }
        )
        self.assertFalse(serializer.is_valid())
        self.assertIn("expiry_date", serializer.errors)
