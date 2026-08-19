from __future__ import annotations

from unittest.mock import MagicMock, patch

from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase


class HealthCheckAPITests(APITestCase):
    """Production health check API test suite."""

    def test_health_check_healthy_default(self) -> None:
        """Verify unauthenticated GET returns HTTP 200 with healthy database."""
        response = self.client.get("/api/v1/health/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "ok")
        self.assertEqual(response.data["database"], "ok")
        self.assertIn(response.data["redis"], {"disabled", "ok"})

    def test_health_check_unauthenticated_access(self) -> None:
        """Verify health check requires zero authentication (no Bearer token needed)."""
        self.client.credentials()  # Clear credentials
        response = self.client.get("/api/v1/health/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    @patch("apps.common.views.connection.cursor")
    def test_health_check_database_failure(self, mock_cursor: MagicMock) -> None:
        """Verify database error yields HTTP 503 Service Unavailable with unhealthy status."""
        mock_cursor.side_effect = Exception("Database connection refused")
        response = self.client.get("/api/v1/health/")
        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
        self.assertEqual(response.data["status"], "unhealthy")
        self.assertEqual(response.data["database"], "error")

    @override_settings(USE_REDIS=True)
    def test_health_check_redis_enabled_and_healthy(self) -> None:
        """Verify when Redis is enabled and reachable, redis status returns ok."""
        with patch("django.core.cache.cache.set") as mock_set, patch("django.core.cache.cache.get") as mock_get:
            mock_get.return_value = "ok"
            response = self.client.get("/api/v1/health/")
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(response.data["status"], "ok")
            self.assertEqual(response.data["redis"], "ok")

    @override_settings(USE_REDIS=True)
    def test_health_check_redis_enabled_and_unhealthy(self) -> None:
        """Verify when Redis is enabled but fails, response returns 503 Service Unavailable."""
        with patch("django.core.cache.cache.set") as mock_set:
            mock_set.side_effect = Exception("Redis connection refused")
            response = self.client.get("/api/v1/health/")
            self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
            self.assertEqual(response.data["status"], "unhealthy")
            self.assertEqual(response.data["redis"], "error")

    def test_no_sensitive_info_leakage(self) -> None:
        """Verify health check response strictly contains only status keys."""
        response = self.client.get("/api/v1/health/")
        allowed_keys = {"status", "database", "redis"}
        self.assertEqual(set(response.data.keys()), allowed_keys)
